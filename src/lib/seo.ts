import type { Metadata } from "next";
import { getLocalizedUrl, siteConfig } from "@/lib/site";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray, eq } from "drizzle-orm";

// Re-export pageSeo from the client-safe config file
export { pageSeo, type PageSeo } from "@/lib/page-seo-config";
import { pageSeo } from "@/lib/page-seo-config";

export interface SeoOverrides {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  robots?: { index: boolean; follow: boolean };
  ogImage?: string;
  schemaType?: string;
}

const SEO_OVERRIDE_KEYS = [
  "seo_title",
  "seo_description",
  "seo_keywords",
  "seo_canonical_url",
  "seo_separator",
  "seo_robots_default",
  "seo_og_image",
] as const;

/**
 * Read SEO overrides from DB. Returns empty map on failure so hardcoded defaults take over.
 */
async function getCachedSeoOverrides(): Promise<Record<string, string>> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, [...SEO_OVERRIDE_KEYS]));

    const map: Record<string, string> = {};
    for (const key of SEO_OVERRIDE_KEYS) {
      const row = rows.find((r) => r.key === key);
      map[key] = row?.value ?? "";
    }
    return map;
  } catch {
    // DB failure: return empty so hardcoded defaults take over
    return {};
  }
}

/**
 * Read page-level SEO overrides from settings table for a specific page key.
 * Returns empty SeoOverrides if not set or on failure.
 */
async function getPageLevelOverrides(pageKey: string): Promise<SeoOverrides> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, `seo_page_overrides_${pageKey}`))
      .limit(1);

    if (rows.length === 0 || !rows[0].value) {
      return {};
    }

    return JSON.parse(rows[0].value) as SeoOverrides;
  } catch {
    return {};
  }
}

/**
 * Get a single SEO setting from DB, falling back to the provided default.
 */
async function getSeoSetting(key: string, fallback: string): Promise<string> {
  const overrides = await getCachedSeoOverrides();
  const value = overrides[key];
  return value && value.trim() !== "" ? value : fallback;
}

export async function createPageMetadata(key: keyof typeof pageSeo, locale: string): Promise<Metadata> {
  const seo = pageSeo[key];
  const overrides = await getCachedSeoOverrides();
  const pageLevelOverrides = await getPageLevelOverrides(key);

  // Canonical URL: page-level override takes precedence, then global override, then siteConfig.url
  const siteUrl = pageLevelOverrides.canonicalUrl?.trim() || overrides["seo_canonical_url"]?.trim() || siteConfig.url;
  const canonical = `${siteUrl}${seo.path ? seo.path : ""}`;

  // OG image: page-level override takes precedence, then global override
  const ogImage = pageLevelOverrides.ogImage?.trim() || overrides["seo_og_image"]?.trim() || undefined;

  // Title: page-level override takes precedence, then page-specific default
  const title = pageLevelOverrides.title?.trim() || seo.title;

  // Description: page-level override takes precedence, then page-specific default
  const description = pageLevelOverrides.description?.trim() || seo.description;

  // Keywords: combine page-specific keywords with focus keyword if set
  const keywords = pageLevelOverrides.focusKeyword
    ? [...seo.keywords, pageLevelOverrides.focusKeyword]
    : seo.keywords;

  // Build metadata object
  const metadata: Metadata = {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: getLocalizedUrl("en", seo.path),
        bn: getLocalizedUrl("bn", seo.path),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.legalName,
      type: "website",
      locale: locale === "bn" ? "bn_BD" : "en_US",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  // Add robots meta if page-level override is set
  if (pageLevelOverrides.robots) {
    const robotsDirectives: string[] = [];
    if (!pageLevelOverrides.robots.index) robotsDirectives.push("noindex");
    if (!pageLevelOverrides.robots.follow) robotsDirectives.push("nofollow");
    if (robotsDirectives.length > 0) {
      metadata.robots = robotsDirectives.join(", ");
    }
  }

  return metadata;
}

export { organizationSchema, websiteSchema, productSchema, breadcrumbSchema } from "@/lib/schema-helpers";

/**
 * Schema settings stored in the DB as tracking keys.
 * Reads seo_schema_auto_generate, seo_schema_types_enabled, seo_schema_overrides.
 */
const SCHEMA_SETTINGS_KEYS = [
  "seo_schema_auto_generate",
  "seo_schema_types_enabled",
  "seo_schema_overrides",
] as const;

function parseJsonSetting<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export interface SchemaSettings {
  autoGenerate: boolean;
  typesEnabled: Record<string, boolean>;
  overrides: Record<string, string>;
}

/**
 * Read schema configuration from DB. Returns sensible defaults on failure.
 * Used by SchemaForm component and by public JSON-LD generation.
 */
export async function getSchemaSettings(): Promise<SchemaSettings> {
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, [...SCHEMA_SETTINGS_KEYS]));

    const map: Record<string, string> = {};
    for (const key of SCHEMA_SETTINGS_KEYS) {
      const row = rows.find((r) => r.key === key);
      map[key] = row?.value ?? "";
    }

    return {
      autoGenerate:
        map["seo_schema_auto_generate"] === "false" ? false : true,
      typesEnabled: parseJsonSetting<Record<string, boolean>>(
        map["seo_schema_types_enabled"],
        { Organization: true, WebSite: true, BreadcrumbList: true }
      ),
      overrides: parseJsonSetting<Record<string, string>>(
        map["seo_schema_overrides"],
        {}
      ),
    };
  } catch {
    return {
      autoGenerate: true,
      typesEnabled: {
        Organization: true,
        WebSite: true,
        BreadcrumbList: true,
      },
      overrides: {},
    };
  }
}
