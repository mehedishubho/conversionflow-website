/**
 * LicenseKeyGenerator Domain Service
 *
 * Generates cryptographically secure license keys using rejection sampling.
 *
 * Security considerations (T-16-01):
 * - Uses crypto.randomBytes() for cryptographic randomness (never Math.random)
 * - Rejection sampling eliminates modulo bias for 31-char charset (threshold=248)
 * - Charset excludes ambiguous characters (0, O, 1, I, L) per D-03
 * - Generates 20-character keys with CF- prefix when formatted
 */

import crypto from "crypto";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";

/**
 * 31-character alphabet excluding ambiguous characters: 0, O, 1, I, L
 * A-Z (26) minus O, I, L (23) + 2-9 (8) = 31 characters
 */
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CHARSET_LENGTH = 31;

/** Number of alphanumeric characters in the key body (before CF- prefix) */
const KEY_LENGTH = 20;

/**
 * Rejection threshold for unbiased sampling.
 * floor(256 / 31) * 31 = 8 * 31 = 248
 * Bytes >= 248 are rejected to avoid modulo bias in the remaining range.
 */
const REJECTION_THRESHOLD = Math.floor(256 / CHARSET_LENGTH) * CHARSET_LENGTH; // 248

export class LicenseKeyGenerator {
  /**
   * Generate a new 20-character license key using rejection sampling.
   * @returns LicenseKey value object with the generated key
   */
  static generate(): LicenseKey {
    const body = Buffer.alloc(KEY_LENGTH);
    let written = 0;

    while (written < KEY_LENGTH) {
      // Request extra bytes to account for rejected values
      const bytes = crypto.randomBytes(KEY_LENGTH * 2);
      for (let i = 0; i < bytes.length && written < KEY_LENGTH; i++) {
        const byte = bytes[i];
        if (byte < REJECTION_THRESHOLD) {
          body[written] = CHARSET.charCodeAt(byte % CHARSET_LENGTH);
          written++;
        }
      }
    }

    return LicenseKey.create(body.toString("ascii"));
  }

  /**
   * Generate a formatted license key string with CF- prefix.
   * Example: "CF-ABCD-2345-EFGH-6789-JKLM"
   */
  static generateFormatted(): string {
    return `CF-${this.generate().formatted}`;
  }
}
