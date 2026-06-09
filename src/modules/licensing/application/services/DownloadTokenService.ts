/**
 * DownloadTokenService - HMAC-SHA256 signed download URL generation and verification
 *
 * Per D-13: Time-limited signed URLs for ZIP file downloads.
 * Per D-14: 2-hour token expiry.
 *
 * Token format: {licenseId}:{versionId}:{expires}:{signature}
 * - licenseId: UUID of the license
 * - versionId: UUID of the product version
 * - expires: Unix timestamp (seconds) when token expires
 * - signature: HMAC-SHA256 of "{licenseId}:{versionId}:{expires}" using server secret
 *
 * Security (T-32-02, T-32-06):
 * - HMAC-SHA256 signing prevents token tampering
 * - crypto.timingSafeEqual for signature comparison
 * - 2-hour expiry embedded in token, verified server-side
 */

import crypto from "crypto";

const DEFAULT_EXPIRY_SECONDS = 7200; // 2 hours per D-14

function getSigningSecret(): string {
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret) {
    console.warn(
      "[DownloadTokenService] DOWNLOAD_SIGNING_SECRET not set. Using random fallback. Tokens will not survive restarts."
    );
    return crypto.randomBytes(32).toString("hex");
  }
  return secret;
}

export class DownloadTokenService {
  /**
   * Generate a signed download URL with time-limited token.
   *
   * @param baseUrl - Platform base URL (e.g., "https://conversionflow.com")
   * @param licenseId - UUID of the license
   * @param versionId - UUID of the product version
   * @param expirySeconds - Token lifetime in seconds (default 7200 = 2 hours)
   * @returns Full signed download URL
   */
  static generateDownloadUrl(
    baseUrl: string,
    licenseId: string,
    versionId: string,
    expirySeconds: number = DEFAULT_EXPIRY_SECONDS
  ): string {
    const expires = Math.floor(Date.now() / 1000) + expirySeconds;
    const payload = `${licenseId}:${versionId}:${expires}`;
    const signature = crypto
      .createHmac("sha256", getSigningSecret())
      .update(payload)
      .digest("hex");
    const token = `${payload}:${signature}`;

    const base = baseUrl.replace(/\/+$/, "");
    return `${base}/api/v1/update/download?token=${token}`;
  }

  /**
   * Verify a download token and extract its components.
   *
   * Checks:
   * 1. Token has exactly 4 parts (licenseId, versionId, expires, signature)
   * 2. Token has not expired
   * 3. HMAC signature matches (timing-safe comparison)
   *
   * @param token - The full token string from the download URL
   * @returns Parsed token components if valid, null if invalid or expired
   */
  static verifyToken(
    token: string
  ): { licenseId: string; versionId: string; expires: number } | null {
    const parts = token.split(":");
    if (parts.length !== 4) return null;

    const [licenseId, versionId, expiresStr, signature] = parts;

    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires)) return null;

    // Check expiry
    if (Math.floor(Date.now() / 1000) > expires) return null;

    // Verify HMAC signature with timing-safe comparison
    const payload = `${licenseId}:${versionId}:${expiresStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", getSigningSecret())
      .update(payload)
      .digest("hex");

    try {
      const a = Buffer.from(signature, "hex");
      const b = Buffer.from(expectedSignature, "hex");

      if (a.length !== b.length) return null;

      if (!crypto.timingSafeEqual(a, b)) return null;
    } catch {
      return null;
    }

    return { licenseId, versionId, expires };
  }
}
