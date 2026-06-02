/**
 * VerificationTokenIssuer Domain Service
 *
 * Issues single-use verification tokens for domain activation.
 *
 * Security considerations (T-16-03):
 * - Tokens are 32-hex-char (16 bytes of cryptographic randomness)
 * - Atomic GETDEL on consume prevents token replay attacks
 * - Token bound to (licenseId, domain) tuple prevents cross-domain reuse
 * - 24-hour TTL ensures tokens expire if not consumed promptly
 */

import crypto from "crypto";
import { redis, kvGet, kvSet, kvDelete } from "@/lib/redis";

const VERIFICATION_TOKEN_PREFIX = "verify:";
const VERIFICATION_TTL_SECONDS = 86400; // 24 hours

export class VerificationTokenIssuer {
  /**
   * Issue a new verification token bound to a license and domain.
   * Token is stored in Redis with 24-hour TTL.
   * @param licenseId - The license requesting verification
   * @param domain - The domain being verified
   * @returns The verification token (32 hex characters)
   */
  static async issue(licenseId: string, domain: string): Promise<string> {
    const token = crypto.randomBytes(16).toString("hex");
    const key = `${VERIFICATION_TOKEN_PREFIX}${token}`;
    await kvSet(
      key,
      JSON.stringify({ licenseId, domain }),
      VERIFICATION_TTL_SECONDS,
    );
    return token;
  }

  /**
   * Consume a verification token, validating it matches the expected license and domain.
   * Uses atomic GETDEL on Redis to prevent token replay.
   * Falls back to GET+DELETE for memory store.
   * @param token - The verification token to consume
   * @param expectedLicenseId - The license ID that should match
   * @param expectedDomain - The domain that should match
   * @returns true if the token was valid and matched, false otherwise
   */
  static async consume(
    token: string,
    expectedLicenseId: string,
    expectedDomain: string,
  ): Promise<boolean> {
    const key = `${VERIFICATION_TOKEN_PREFIX}${token}`;

    if (redis) {
      // Atomic GETDEL prevents replay attacks
      const value = await redis.getdel(key);
      if (!value) return false;
      const parsed = JSON.parse(value);
      return (
        parsed.licenseId === expectedLicenseId && parsed.domain === expectedDomain
      );
    }

    // Memory fallback: GET + DELETE (non-atomic but acceptable for dev)
    const value = await kvGet(key);
    if (!value) return false;
    await kvDelete(key);
    const parsed = JSON.parse(value);
    return (
      parsed.licenseId === expectedLicenseId && parsed.domain === expectedDomain
    );
  }
}
