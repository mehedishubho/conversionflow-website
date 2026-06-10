/**
 * LicenseStatusHandler - Application command handler for full license profile
 *
 * Per D-18: Returns full license profile including activations, plan, features, expiry.
 * Per D-19: Auth model same as existing endpoints (license_key, domain, api_token via POST).
 * Per D-20: POST method consistent with existing /api/v1/license/* endpoints.
 * Per D-21: Redis cached with 10-min TTL, cache key: license:status:<sha256(licenseKey)>.
 *
 * Flow: parse key -> normalize domain -> check cache -> DB lookup ->
 *       API token check -> status check -> expiry check -> product lookup ->
 *       plan lookup -> activation details -> build response -> cache result
 *
 * Security (T-32-01):
 * - Per-license API token validation via ApiTokenGenerator
 * - All error paths return identical INVALID response
 */

import crypto from "crypto";
import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { Domain } from "@/shared/domain/valueObjects/Domain";
import { db } from "@/lib/db";
import { products, productPlans, settings, licenseActivations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { cacheGet, cacheSet } from "@/lib/redis";

export interface LicenseStatusInput {
  licenseKey: string;
  domain: string;
  apiToken: string;
}

export interface ActivationInfo {
  domain: string;
  activated_at: string | null;
}

export interface LicenseStatusResult {
  valid: boolean;
  error?: string;
  license_id?: string;
  status?: string;
  plan?: { name: string | null; slug: string | null };
  product?: { name: string | null; slug: string | null };
  expires_at?: string | null;
  grace_period_expires_at?: string | null;
  max_activations?: number;
  current_activations?: number;
  activations?: ActivationInfo[];
  features?: Record<string, Record<string, boolean>>;
  license_type?: string;
}

const INVALID: LicenseStatusResult = {
  valid: false,
  error: "INVALID_LICENSE",
};

export class LicenseStatusHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Execute a license status request.
   *
   * Returns full license profile with activations, plan features, and expiry.
   * Cached in Redis with 10-min TTL per D-21.
   */
  static async execute(input: LicenseStatusInput): Promise<LicenseStatusResult> {
    // 1. Parse license key
    let key: LicenseKey;
    try {
      key = LicenseKey.create(input.licenseKey);
    } catch {
      return INVALID;
    }

    // 2. Normalize domain
    try {
      Domain.create(input.domain);
    } catch {
      return INVALID;
    }

    // 3. Check cache (D-21: license:status:<sha256(licenseKey)>)
    const cacheKey = `license:status:${crypto.createHash("sha256").update(key.value).digest("hex")}`;
    const cached = await cacheGet("LICENSE", cacheKey);
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

    // 5. Validate API token (constant-time comparison)
    if (
      !license.apiTokenHash ||
      !ApiTokenGenerator.validate(input.apiToken, license.apiTokenHash)
    ) {
      return INVALID;
    }

    // 6. Check status — revoked and suspended are always invalid
    if (license.status === "revoked" || license.status === "suspended") {
      return INVALID;
    }

    // 7. Expiry check with grace period
    let graceEndDate: Date | null = null;
    if (license.expiresAt && new Date() > license.expiresAt) {
      const graceDays = await this.getGracePeriodDays();
      graceEndDate = new Date(
        license.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000
      );
      if (new Date() > graceEndDate) return INVALID;
    }

    // 8. Look up product
    let product = null;
    try {
      const productRows = await db
        .select()
        .from(products)
        .where(eq(products.id, license.productId))
        .limit(1);
      product = productRows[0] ?? null;
    } catch {
      // Continue with null product
    }

    // 9. Look up plan
    let plan = null;
    try {
      const planRows = await db
        .select()
        .from(productPlans)
        .where(
          and(
            eq(productPlans.slug, license.plan),
            eq(productPlans.productId, license.productId)
          )
        )
        .limit(1);
      plan = planRows[0] ?? null;
    } catch {
      // Continue with null plan
    }

    // 10. Get activation details
    let activationDetails: ActivationInfo[] = [];
    try {
      const activations = await db
        .select({ domain: licenseActivations.domain, createdAt: licenseActivations.createdAt })
        .from(licenseActivations)
        .where(eq(licenseActivations.licenseId, license.id));

      // Build per-domain activation info from activationDomains
      const domainSet = new Set(license.activationDomains);
      const activationMap = new Map<string, Date>();
      for (const act of activations) {
        if (!activationMap.has(act.domain)) {
          activationMap.set(act.domain, act.createdAt);
        }
      }

      activationDetails = license.activationDomains.map((d) => ({
        domain: d,
        activated_at: activationMap.has(d)
          ? activationMap.get(d)!.toISOString()
          : null,
      }));

      // Include any activation records for domains not in activationDomains
      for (const act of activations) {
        if (!domainSet.has(act.domain)) {
          activationDetails.push({
            domain: act.domain,
            activated_at: act.createdAt.toISOString(),
          });
        }
      }
    } catch {
      activationDetails = license.activationDomains.map((d) => ({
        domain: d,
        activated_at: null,
      }));
    }

    // 11. Build response per D-18
    const result: LicenseStatusResult = {
      valid: true,
      license_id: license.id,
      status: license.status,
      plan: { name: plan?.name ?? null, slug: license.plan },
      product: { name: product?.name ?? null, slug: product?.slug ?? null },
      expires_at: license.expiresAt?.toISOString() ?? null,
      grace_period_expires_at: graceEndDate?.toISOString() ?? null,
      max_activations: license.maxActivations,
      current_activations: license.currentActivations,
      activations: activationDetails,
      features: (plan?.features as Record<string, Record<string, boolean>>) ?? {},
      license_type: plan?.licenseType ?? "subscription",
    };

    // 12. Cache with 10-min TTL (D-21: 600 seconds)
    try {
      await cacheSet("LICENSE", cacheKey, JSON.stringify(result), 600);
    } catch {
      // Cache write failure — don't block response
    }

    return result;
  }

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
    return 7;
  }
}
