/**
 * DownloadHandler - Application command handler for ZIP file downloads
 *
 * Per D-13: Verifies HMAC-SHA256 signed download tokens.
 * Per D-14: 2-hour token expiry enforced via DownloadTokenService.
 * Per D-15: Returns file metadata for streaming by the API route.
 *
 * Flow: verify token -> look up version -> look up license ->
 *       verify license status -> verify file exists on disk ->
 *       log to update_logs -> return file metadata
 *
 * The API route handles actual file streaming (Content-Type, Content-Disposition,
 * Content-Length headers, Node.js readable stream).
 *
 * Security (T-32-02, T-32-06):
 * - HMAC-SHA256 signed tokens with timing-safe comparison
 * - 2-hour expiry embedded in token, verified server-side
 */

import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { productVersions, licenses, updateLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DownloadTokenService } from "@/modules/licensing/application/services/DownloadTokenService";

export interface DownloadInput {
  token: string;
  ipAddress: string;
  userAgent: string | null;
}

export interface DownloadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
}

export class DownloadHandler {
  /**
   * Execute a download request.
   *
   * Verifies the signed token, validates the license and version,
   * checks the ZIP file exists on disk, logs the download event,
   * and returns file metadata for the route to stream.
   *
   * @returns DownloadResult with file metadata if valid, null if invalid/expired
   */
  static async execute(input: DownloadInput): Promise<DownloadResult | null> {
    // 1. Verify token
    const tokenData = DownloadTokenService.verifyToken(input.token);
    if (!tokenData) return null;

    const { licenseId, versionId } = tokenData;

    // 2. Look up version by ID
    const versionRows = await db
      .select()
      .from(productVersions)
      .where(eq(productVersions.id, versionId))
      .limit(1);

    if (versionRows.length === 0) return null;
    const version = versionRows[0];

    // 3. Look up license by ID
    const licenseRows = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .limit(1);

    if (licenseRows.length === 0) return null;
    const license = licenseRows[0];

    // 4. Verify license status is not revoked/suspended
    if (license.status === "revoked" || license.status === "suspended") {
      return null;
    }

    // 5. Verify version has a download file path
    if (!version.downloadUrl) return null;

    // 6. Construct full file path (downloadUrl stores relative path within uploads/)
    const filePath = path.join(process.cwd(), "uploads", version.downloadUrl);

    // 7. Verify file exists on disk
    if (!fs.existsSync(filePath)) return null;

    // 8. Get file stat for Content-Length
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      return null;
    }

    const fileName = path.basename(filePath);

    // 9. Log to update_logs (before streaming starts)
    try {
      await db.insert(updateLogs).values({
        productId: version.productId,
        licenseId: license.id,
        action: "download",
        versionTo: version.version,
        domain: "", // Domain not available from token alone
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
    } catch {
      // Log failure should not block download
    }

    // 10. Return file metadata for route to stream
    return {
      filePath,
      fileName,
      fileSize: stat.size,
    };
  }
}
