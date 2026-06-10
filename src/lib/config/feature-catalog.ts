/**
 * Feature Catalog - Single source of truth for valid feature keys
 *
 * Per D-01: All features use per-platform nesting.
 * Per D-02: Fixed 4 platforms: wordpress, laravel, shopify, nextjs.
 * Per D-03: Feature keys are catalog-based (admin picks from this list, no free-form).
 */

// ──────────────────────────────────────────────
// Platform Types
// ──────────────────────────────────────────────

export type Platform = "wordpress" | "laravel" | "shopify" | "nextjs";

export const PLATFORMS: Platform[] = ["wordpress", "laravel", "shopify", "nextjs"];

export const PLATFORM_LABELS: Record<Platform, string> = {
  wordpress: "WordPress",
  laravel: "Laravel",
  shopify: "Shopify",
  nextjs: "Next.js",
};

// ──────────────────────────────────────────────
// Feature Catalog
// ──────────────────────────────────────────────

export interface FeatureCatalogEntry {
  key: string;
  label: string;
  description: string;
  category: "modules" | "support" | "updates" | "advanced";
}

export const FEATURE_CATALOG: FeatureCatalogEntry[] = [
  // Modules
  { key: "all_modules", label: "All Modules", description: "Access to all plugin modules", category: "modules" },
  { key: "courier_sync", label: "Courier Sync", description: "Courier service integration", category: "modules" },
  { key: "meta_capi", label: "Meta CAPI", description: "Meta Conversions API integration", category: "modules" },
  { key: "fraud_shield", label: "Fraud Shield", description: "Fraud detection and prevention", category: "modules" },
  // Updates
  { key: "one_year_updates", label: "1-Year Updates", description: "One year of updates", category: "updates" },
  { key: "lifetime_updates", label: "Lifetime Updates", description: "Lifetime updates", category: "updates" },
  { key: "beta_channel", label: "Beta Channel", description: "Access to beta/pre-release versions", category: "updates" },
  // Support
  { key: "email_support", label: "Email Support", description: "Email-based support", category: "support" },
  { key: "priority_support", label: "Priority Support", description: "Priority support", category: "support" },
  { key: "priority_email_support", label: "Priority Email Support", description: "Priority email support", category: "support" },
  { key: "whatsapp_support", label: "WhatsApp Support", description: "WhatsApp-based support", category: "support" },
  { key: "priority_whatsapp_support", label: "Priority WhatsApp Support", description: "Priority WhatsApp support", category: "support" },
  // Advanced
  { key: "white_label", label: "White Label", description: "White label branding", category: "advanced" },
];

export type FeatureKey = (typeof FEATURE_CATALOG)[number]["key"];

// ──────────────────────────────────────────────
// Feature Matrix Type
// ──────────────────────────────────────────────

/**
 * Nested feature matrix: feature key -> platform -> enabled.
 * Per D-01: Every feature maps to { wordpress, laravel, shopify, nextjs } booleans.
 */
export type FeatureMatrix = Record<string, Record<Platform, boolean>>;

/**
 * Resolve platform-specific features from the nested matrix.
 * Per D-06: Returns flat features map filtered to the requesting platform.
 * Returns empty object if features is null/undefined.
 */
export function resolveFeaturesForPlatform(
  features: Record<string, Record<string, boolean>> | null | undefined,
  platform: string
): Record<string, boolean> {
  if (!features) return {};

  const result: Record<string, boolean> = {};
  for (const [featureKey, platformMap] of Object.entries(features)) {
    if (typeof platformMap === "object" && platformMap !== null) {
      result[featureKey] = !!platformMap[platform];
    }
  }
  return result;
}

/**
 * Check if a feature key exists in the catalog.
 * Used for validation in admin actions per D-03.
 */
export function isValidFeatureKey(key: string): boolean {
  return FEATURE_CATALOG.some((entry) => entry.key === key);
}

/**
 * Get all valid feature keys as a Set for fast lookup.
 */
export const VALID_FEATURE_KEYS = new Set<FeatureKey>(
  FEATURE_CATALOG.map((e) => e.key)
);
