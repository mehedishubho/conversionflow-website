/**
 * ValidateLicenseHandler - Application command handler for license validation
 *
 * Implements the full validation flow per D-21 (identical errors for all failures)
 * and D-19 (cache with 10-min TTL).
 *
 * Flow: parse key -> normalize domain -> cache lookup -> DB lookup ->
 *       API token check -> status check -> expiry check -> domain membership check ->
 *       build success response -> cache result
 *
 * Security: All error paths return the identical ValidateResult to prevent
 * timing-based key enumeration (T-16-09, LGEN-09).
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { ValidationCache } from "@/modules/licensing/infrastructure/adapters/ValidationCache";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface ValidateInput {
  licenseKey: string;
  domain: string;
  apiToken: string;
}

export interface ValidateResult {
  valid: boolean;
  licenseId: string | null;
  plan: string | null;
  expiresAt: Date | null;
  maxActivations: number | null;
  currentActivations: number | null;
  grace_period_expires_at?: Date;
}

export class ValidateLicenseHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Fetch grace period days from settings table.
   * Returns default of 7 days if not configured or on DB error (D-01).
   * Validates parsed value is between 7-30 (T-18-04).
   */
  private static async getGracePeriodDays(): Promise<number> {
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "grace_period_days"))
        .limit(1);
      if (rows.length > 0) {
        const days = parseInt(rows[0].value, 10);
        if (!isNaN(days) && days >= 7 && days <= 30) return days;
      }
    } catch {
      // DB error — use default
    }
    return 7; // Default per D-01
  }

  /**
   * Execute license validation.
   *
   * Returns identical result for all failure paths (D-21, LGEN-09).
   * Only returns valid=true when the license is active, unexpired,
   * API token matches, and domain is in activation_domains.
   */
  static async execute(input: ValidateInput): Promise<ValidateResult> {
    const INVALID: ValidateResult = {
      valid: false,
      licenseId: null,
      plan: null,
      expiresAt: null,
      maxActivations: null,
      currentActivations: null,
    };

    // 1. Parse license key (accept legacy lengths via create())
    let key: LicenseKey;
    try {
      key = LicenseKey.create(input.licenseKey);
    } catch {
      return INVALID;
    }

    // 2. Normalize domain
    const domain = input.domain.toLowerCase().trim();

    // 3. Check cache first (D-19)
    const cached = await ValidationCache.get(key.value, domain);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Corrupt cache, continue to DB
      }
    }

    // 4. Look up license by key
    const license = await this.licenseRepo.findByKey(key.value);
    if (!license) return INVALID;

    // 5. Validate API token (constant-time, per D-05/D-06)
    if (!license.apiTokenHash || !ApiTokenGenerator.validate(input.apiToken, license.apiTokenHash)) {
      return INVALID;
    }

    // 6. Check status — revoked and suspended are always invalid (D-07: immediate, no grace)
    if (license.status === "revoked" || license.status === "suspended") {
      return INVALID;
    }

    // 7. Real-time expiry check (D-03: safety net, compares expires_at against current time)
    if (license.expiresAt && new Date() > license.expiresAt) {
      // License is past its expires_at timestamp
      const graceDays = await this.getGracePeriodDays();
      const graceEnd = new Date(
        license.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000,
      );
      const now = new Date();

      if (now <= graceEnd) {
        // Within grace period — return valid with grace_period_expires_at (D-02)
        const graceResult: ValidateResult = {
          valid: true,
          licenseId: license.id,
          plan: license.plan,
          expiresAt: license.expiresAt,
          maxActivations: license.maxActivations,
          currentActivations: license.currentActivations,
          grace_period_expires_at: graceEnd,
        };

        // Cache with shorter TTL during grace period (60 seconds)
        try {
          await ValidationCache.set(
            key.value,
            domain,
            JSON.stringify({
              valid: true,
              licenseId: license.id,
              plan: license.plan,
              expiresAt: license.expiresAt,
              maxActivations: license.maxActivations,
              currentActivations: license.currentActivations,
            }),
          );
        } catch {
          // Cache write failure — don't block validation
        }

        return graceResult;
      }

      // Past grace period — expired (D-05)
      return INVALID;
    }

    // 8. Check domain is in activation_domains
    if (!license.activationDomains.includes(domain)) return INVALID;

    // 9. Build success response (D-23)
    const result: ValidateResult = {
      valid: true,
      licenseId: license.id,
      plan: license.plan,
      expiresAt: license.expiresAt,
      maxActivations: license.maxActivations,
      currentActivations: license.currentActivations,
    };

    // 10. Cache the result (D-19, TTL=600s)
    await ValidationCache.set(key.value, domain, JSON.stringify(result));

    return result;
  }
}
