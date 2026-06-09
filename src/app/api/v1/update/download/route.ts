/**
 * GET /api/v1/update/download
 *
 * Authenticated ZIP file download endpoint per D-13, D-14, D-15, UPDT-02.
 *
 * Accepts query params: ?token={licenseId}:{versionId}:{expires}:{signature}
 * Returns: ZIP file stream with Content-Disposition: attachment
 *
 * Security:
 * - Token verified via HMAC-SHA256 (timing-safe comparison)
 * - Token expiry enforced (2 hours per D-14)
 * - File path resolved from DB record only (never user-supplied paths)
 * - Rate limited (100 req/min per IP per D-23)
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { Readable } from "stream";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { DownloadHandler } from "@/modules/licensing/application/commands/DownloadHandler";

export async function GET(request: NextRequest) {
  // 1. Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  // 2. Extract and verify token
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 404 });
  }

  // 3. Delegate to handler (verifies token, looks up license/version, checks file)
  const result = await DownloadHandler.execute({
    token,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent"),
  });

  if (!result) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 404 });
  }

  // 4. Stream the file
  try {
    const stream = fs.createReadStream(result.filePath);

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Length": String(result.fileSize),
      },
    });
  } catch (error) {
    console.error("[Download Route] File stream error:", error);
    return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
  }
}
