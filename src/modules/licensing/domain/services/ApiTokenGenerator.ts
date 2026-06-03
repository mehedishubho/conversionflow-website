/**
 * ApiTokenGenerator Domain Service
 *
 * Generates and validates API tokens for license authentication.
 *
 * Security considerations (T-16-02):
 * - Tokens are formatted as cf_live_<32-char-random> for clear identification
 * - Hashes stored using SHA-256 (one-way, no plaintext storage)
 * - Validation uses crypto.timingSafeEqual for constant-time comparison
 *   to prevent timing-based token enumeration attacks
 */

import crypto from "crypto";
import { nanoid } from "nanoid";

export class ApiTokenGenerator {
  /**
   * Generate a new API token and its SHA-256 hash.
   * @returns Object with plaintext token (to show once) and hash (to store)
   */
  static generate(): { plaintext: string; hash: string } {
    const token = `cf_live_${nanoid(32)}`;
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    return { plaintext: token, hash };
  }

  /**
   * Validate a plaintext API token against a stored hash.
   * Uses constant-time comparison to prevent timing attacks.
   * @param plaintext - The token to validate
   * @param storedHash - The SHA-256 hash stored in the database
   * @returns true if the token matches the hash
   */
  static validate(plaintext: string, storedHash: string): boolean {
    if (!plaintext || !storedHash) return false;

    const plaintextHash = crypto
      .createHash("sha256")
      .update(plaintext)
      .digest("hex");

    const a = Buffer.from(plaintextHash, "hex");
    const b = Buffer.from(storedHash, "hex");

    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  }
}
