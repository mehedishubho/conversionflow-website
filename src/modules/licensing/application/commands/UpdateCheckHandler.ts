/**
 * UpdateCheckHandler - Application command handler for update checks
 *
 * Per D-08: WordPress-compatible update check response format.
 * Per D-09: Plugin sends license_key, domain, installed_version, product_slug, api_token.
 * Per D-12: Only returns stable versions (beta deferred to Phase 33).
 *
 * Flow: parse key -> normalize domain -> DB lookup -> API token check ->
 *       status check -> expiry check -> product lookup by pluginSlug ->
 *       find latest stable version -> semver compare -> generate download URL ->
 *       build response -> log to update_logs
 *
 * Security (T-32-01, T-32-03):
 * - Per-license API token validation via ApiTokenGenerator (D-09)
 * - All error paths return identical UPDATE_NOT_AVAILABLE response
 *   to prevent key/version enumeration
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { Domain } from "@/shared/domain/valueObjects/Domain";
import { db } from "@/lib/db";
import { products, productVersions, settings, updateLogs, productPlans } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { DownloadTokenService } from "@/modules/licensing/application/services/DownloadTokenService";
import { hasUpdate } from "@/modules/licensing/application/services/SemverCompare";

export interface UpdateCheckInput {
  licenseKey: string;
  domain: string;
  apiToken: string;
  installedVersion: string;
  productSlug: string;
}

export interface UpdateCheckResult {
  update_available: boolean;
  slug?: string;
  new_version?: string;
  url?: string;
  package?: string;
  download_url?: string;
  last_updated?: string | null;
  sections?: {
    description: string;
    changelog: string;
    installation: string;
  };
  requires?: string;
  tested?: string;
  requires_php?: string;
}

const UPDATE_NOT_AVAILABLE: UpdateCheckResult = { update_available: false };

export class UpdateCheckHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Execute an update check.
   *
   * Validates the license, finds the product by pluginSlug, compares versions,
   * and returns a WordPress-compatible update response if a newer version exists.
   *
   * All error paths return the identical UPDATE_NOT_AVAILABLE response
   * to prevent key/version enumeration (T-32-03).
   */
  static async execute(
    input: UpdateCheckInput,
    ipAddress: string,
    userAgent: string | null
  ): Promise<UpdateCheckResult> {
    // 1. Parse license key
    let key: LicenseKey;
    try {
      key = LicenseKey.create(input.licenseKey);
    } catch {
      return UPDATE_NOT_AVAILABLE;
    }

    // 2. Normalize domain
    let normalizedDomain: string;
    try {
      normalizedDomain = Domain.create(input.domain).value;
    } catch {
      return UPDATE_NOT_AVAILABLE;
    }

    // 3. Look up license by key
    const license = await this.licenseRepo.findByKey(key.value);
    if (!license) return UPDATE_NOT_AVAILABLE;

    // 4. Validate API token (constant-time comparison)
    if (
      !license.apiTokenHash ||
      !ApiTokenGenerator.validate(input.apiToken, license.apiTokenHash)
    ) {
      return UPDATE_NOT_AVAILABLE;
    }

    // 5. Check status — revoked and suspended are always invalid
    if (license.status === "revoked" || license.status === "suspended") {
      return UPDATE_NOT_AVAILABLE;
    }

    // 6. Expiry check with grace period
    if (license.expiresAt && new Date() > license.expiresAt) {
      const graceDays = await this.getGracePeriodDays();
      const graceEnd = new Date(
        license.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000
      );
      if (new Date() > graceEnd) return UPDATE_NOT_AVAILABLE;
    }

    // 7. Find product by pluginSlug
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.pluginSlug, input.productSlug))
      .limit(1);

    if (productRows.length === 0) return UPDATE_NOT_AVAILABLE;
    const product = productRows[0];

    // Verify license belongs to this product
    if (product.id !== license.productId) return UPDATE_NOT_AVAILABLE;

    // 7b. Check beta_channel feature flag (D-04: beta channel enables beta versions)
    let includeBeta = false;
    try {
      const planRows = await db
        .select({ features: productPlans.features })
        .from(productPlans)
        .where(
          and(
            eq(productPlans.slug, license.plan),
            eq(productPlans.productId, license.productId)
          )
        )
        .limit(1);

      const planFeatures = planRows[0]?.features as Record<string, Record<string, boolean>> | undefined;
      // For beta_channel check, use wordpress as default platform (v3.0 was WP-only)
      // Future: accept platform from input when multi-platform products exist
      includeBeta = !!planFeatures?.beta_channel?.wordpress;
    } catch {
      // Plan lookup failure — default to stable only
    }

    // 8. Find latest version (D-12 resolved: include beta if beta_channel flag enabled)
    const versionRows = await db
      .select()
      .from(productVersions)
      .where(
        includeBeta
          ? eq(productVersions.productId, product.id)
          : and(
              eq(productVersions.productId, product.id),
              eq(productVersions.status, "stable")
            )
      )
      .orderBy(desc(productVersions.createdAt))
      .limit(1);

    if (versionRows.length === 0) return UPDATE_NOT_AVAILABLE;
    const latestVersion = versionRows[0];

    // 9. Compare installed vs latest using semver
    if (!hasUpdate(input.installedVersion, latestVersion.version)) {
      return UPDATE_NOT_AVAILABLE;
    }

    // 10. Get platform_url from settings
    const platformUrl = await this.getPlatformUrl();

    // 11. Generate signed download URL
    const signedDownloadUrl = DownloadTokenService.generateDownloadUrl(
      platformUrl,
      license.id,
      latestVersion.id
    );

    // 12. Build WordPress-compatible response (D-08)
    const result: UpdateCheckResult = {
      update_available: true,
      slug: product.pluginSlug ?? product.slug,
      new_version: latestVersion.version,
      url: `${platformUrl}/admin/products/${product.id}`,
      package: signedDownloadUrl,
      download_url: signedDownloadUrl,
      last_updated: latestVersion.releasedAt?.toISOString() ?? null,
      sections: {
        description: product.description ?? "",
        changelog: latestVersion.changelog ?? "",
        installation:
          "Upload the ZIP file via Plugins > Add New > Upload Plugin in your WordPress admin panel.",
      },
      requires: "5.0",
      tested: "6.5",
      requires_php: "7.4",
    };

    // 13. Log to update_logs
    try {
      await db.insert(updateLogs).values({
        productId: product.id,
        licenseId: license.id,
        action: "check",
        versionFrom: input.installedVersion,
        versionTo: latestVersion.version,
        domain: normalizedDomain,
        ipAddress,
        userAgent,
      });
    } catch {
      // Log failure should not block update response
    }

    return result;
  }

  /**
   * Fetch grace period days from settings table.
   * Returns default of 7 days if not configured or on DB error.
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
    return 7;
  }

  /**
   * Fetch platform_url from settings table.
   * Returns empty string if not configured.
   */
  private static async getPlatformUrl(): Promise<string> {
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "platform_url"))
        .limit(1);
      if (rows.length > 0 && rows[0].value) return rows[0].value;
    } catch {
      // DB error — use fallback
    }
    return "";
  }
}
