/**
 * UpdateInfoHandler - Application command handler for plugin info requests
 *
 * Per D-10: Returns full plugin info for WordPress "View version x.x details" popup.
 * Same validation flow as UpdateCheckHandler but returns full sections content
 * with changelog compiled from all stable versions.
 *
 * Security (T-32-01, T-32-03):
 * - Per-license API token validation via ApiTokenGenerator
 * - All error paths return identical UPDATE_NOT_AVAILABLE response
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { Domain } from "@/shared/domain/valueObjects/Domain";
import { db } from "@/lib/db";
import { products, productVersions, settings, updateLogs } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { DownloadTokenService } from "@/modules/licensing/application/services/DownloadTokenService";

export interface UpdateInfoInput {
  licenseKey: string;
  domain: string;
  apiToken: string;
  productSlug: string;
}

export interface UpdateInfoResult {
  info_available: boolean;
  slug?: string;
  name?: string;
  version?: string;
  homepage?: string;
  sections?: {
    description: string;
    changelog: string;
    installation: string;
    faq: string;
  };
  requires?: string;
  tested?: string;
  requires_php?: string;
  last_updated?: string | null;
  download_link?: string;
}

const INFO_NOT_AVAILABLE: UpdateInfoResult = { info_available: false };

export class UpdateInfoHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Execute a plugin info request.
   *
   * Validates the license, finds the product by pluginSlug, retrieves
   * all stable versions to build full changelog sections, and returns
   * a WordPress-compatible plugin info response.
   */
  static async execute(
    input: UpdateInfoInput,
    ipAddress: string,
    userAgent: string | null
  ): Promise<UpdateInfoResult> {
    // 1. Parse license key
    let key: LicenseKey;
    try {
      key = LicenseKey.create(input.licenseKey);
    } catch {
      return INFO_NOT_AVAILABLE;
    }

    // 2. Normalize domain
    let normalizedDomain: string;
    try {
      normalizedDomain = Domain.create(input.domain).value;
    } catch {
      return INFO_NOT_AVAILABLE;
    }

    // 3. Look up license by key
    const license = await this.licenseRepo.findByKey(key.value);
    if (!license) return INFO_NOT_AVAILABLE;

    // 4. Validate API token
    if (
      !license.apiTokenHash ||
      !ApiTokenGenerator.validate(input.apiToken, license.apiTokenHash)
    ) {
      return INFO_NOT_AVAILABLE;
    }

    // 5. Check status
    if (license.status === "revoked" || license.status === "suspended") {
      return INFO_NOT_AVAILABLE;
    }

    // 6. Expiry check with grace period
    if (license.expiresAt && new Date() > license.expiresAt) {
      const graceDays = await this.getGracePeriodDays();
      const graceEnd = new Date(
        license.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000
      );
      if (new Date() > graceEnd) return INFO_NOT_AVAILABLE;
    }

    // 7. Find product by pluginSlug
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.pluginSlug, input.productSlug))
      .limit(1);

    if (productRows.length === 0) return INFO_NOT_AVAILABLE;
    const product = productRows[0];

    if (product.id !== license.productId) return INFO_NOT_AVAILABLE;

    // 8. Find ALL stable versions for full sections content
    const allVersions = await db
      .select()
      .from(productVersions)
      .where(
        and(
          eq(productVersions.productId, product.id),
          eq(productVersions.status, "stable")
        )
      )
      .orderBy(desc(productVersions.createdAt));

    if (allVersions.length === 0) return INFO_NOT_AVAILABLE;

    const latestVersion = allVersions[0];

    // Build changelog section from all versions
    const changelogSection = allVersions
      .map((v) => `== ${v.version} ==\n${v.changelog ?? "No changelog available."}`)
      .join("\n\n");

    // 9. Get platform_url and generate download URL
    const platformUrl = await this.getPlatformUrl();
    const signedDownloadUrl = DownloadTokenService.generateDownloadUrl(
      platformUrl,
      license.id,
      latestVersion.id
    );

    // 10. Build response with full sections (D-10)
    const result: UpdateInfoResult = {
      info_available: true,
      slug: product.pluginSlug ?? product.slug,
      name: product.name,
      version: latestVersion.version,
      homepage: platformUrl,
      sections: {
        description: product.description ?? "",
        changelog: changelogSection,
        installation:
          "Upload the ZIP file via Plugins > Add New > Upload Plugin in your WordPress admin panel.\n\nActivate the plugin and enter your license key in Settings > ConversionFlow.",
        faq: "See our documentation for frequently asked questions.",
      },
      requires: "5.0",
      tested: "6.5",
      requires_php: "7.4",
      last_updated: latestVersion.releasedAt?.toISOString() ?? null,
      download_link: signedDownloadUrl,
    };

    // 11. Log to update_logs
    try {
      await db.insert(updateLogs).values({
        productId: product.id,
        licenseId: license.id,
        action: "info",
        domain: normalizedDomain,
        ipAddress,
        userAgent,
      });
    } catch {
      // Log failure should not block info response
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
