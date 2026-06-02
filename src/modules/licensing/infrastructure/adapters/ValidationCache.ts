/**
 * ValidationCache - Redis cache wrapper with two-level sha256 key scheme
 *
 * Cache key format per D-19:
 *   validate:{sha256(licenseKey)}:{sha256(licenseKey+domain)}
 *
 * Two-level scheme enables:
 * - Individual entry invalidation by exact key (single domain)
 * - Bulk invalidation via prefix-scan on validate:{sha256(licenseKey)}:* (all domains)
 *
 * TTL: 600 seconds (10 minutes) per D-19.
 * Even if Redis is compromised, license keys cannot be derived from sha256 hashes (T-16-08).
 */

import crypto from "crypto";
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from "@/lib/redis";

const VALIDATE_PREFIX = "validate:";
const DEFAULT_TTL = 600; // 10 minutes per D-19

export class ValidationCache {
  /**
   * Build a two-level cache key from license key and domain.
   * Level 1: sha256(licenseKey) groups all domain entries for a license.
   * Level 2: sha256(licenseKey+domain) uniquely identifies a domain entry.
   */
  static buildKey(licenseKey: string, domain: string): string {
    const keyHash = crypto.createHash("sha256").update(licenseKey).digest("hex");
    const pairHash = crypto
      .createHash("sha256")
      .update(`${licenseKey}${domain}`)
      .digest("hex");
    return `${VALIDATE_PREFIX}${keyHash}:${pairHash}`;
  }

  /**
   * Get a cached validation result for a license key + domain pair.
   *
   * @param licenseKey - The license key
   * @param domain - The domain being validated
   * @returns Cached value string or null if not cached/expired
   */
  static async get(licenseKey: string, domain: string): Promise<string | null> {
    return cacheGet("license", this.buildKey(licenseKey, domain));
  }

  /**
   * Cache a validation result for a license key + domain pair.
   *
   * @param licenseKey - The license key
   * @param domain - The domain being validated
   * @param value - The validation response JSON string to cache
   */
  static async set(licenseKey: string, domain: string, value: string): Promise<void> {
    return cacheSet("license", this.buildKey(licenseKey, domain), value, DEFAULT_TTL);
  }

  /**
   * Invalidate a single domain's cached validation result.
   *
   * @param licenseKey - The license key
   * @param domain - The domain to invalidate
   */
  static async invalidate(licenseKey: string, domain: string): Promise<void> {
    return cacheDelete("license", this.buildKey(licenseKey, domain));
  }

  /**
   * Invalidate ALL cached validation results for a license key.
   * Uses prefix-scan on validate:{sha256(licenseKey)}:* to match every domain entry.
   *
   * Called when license status changes (revoked, suspended) to ensure
   * no stale validation results remain cached.
   *
   * @param licenseKey - The license key whose entries should all be cleared
   */
  static async invalidateAll(licenseKey: string): Promise<void> {
    const keyHash = crypto.createHash("sha256").update(licenseKey).digest("hex");
    return cacheDeletePattern("license", `${VALIDATE_PREFIX}${keyHash}:*`);
  }
}
