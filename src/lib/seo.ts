import type { Metadata } from "next";
import { getLocalizedUrl, siteConfig } from "@/lib/site";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

export const pageSeo: Record<string, PageSeo> = {
  home: {
    title: "ConversionFlow - Commerce Tracking, Courier Automation & COD Protection",
    description:
      "Unify Meta CAPI, pixels, courier automation, COD fraud protection, partial payments, checkout recovery, and analytics for WooCommerce, Laravel, and Next.js/MERN stores.",
    path: "",
    keywords: [
      "eCommerce operations platform Bangladesh",
      "WooCommerce Meta CAPI plugin",
      "COD fraud protection system",
      "Bangladesh courier automation",
      "WooCommerce tracking plugin",
    ],
  },
  features: {
    title: "ConversionFlow Features - Tracking, Courier Automation, Fraud Protection",
    description:
      "Explore ConversionFlow features for tracking accuracy, courier automation, COD protection, partial payments, checkout recovery, and operational analytics.",
    path: "/features",
    keywords: [
      "WooCommerce tracking plugin",
      "Meta Conversion API WooCommerce",
      "WooCommerce courier integration Bangladesh",
      "WooCommerce fraud protection plugin",
      "WooCommerce analytics dashboard",
    ],
  },
  pricing: {
    title: "ConversionFlow Pricing - WooCommerce, Laravel, Next.js/MERN Editions",
    description:
      "Compare ConversionFlow pricing for WooCommerce, Laravel, and Next.js/MERN editions with yearly, 2-year, and lifetime licensing options.",
    path: "/pricing",
    keywords: [
      "ConversionFlow pricing",
      "WooCommerce COD protection pricing",
      "Laravel eCommerce analytics pricing",
      "Next.js eCommerce tracking pricing",
    ],
  },
  changelog: {
    title: "ConversionFlow Changelog - Product Updates and Release Notes",
    description:
      "Track ConversionFlow releases across Meta CAPI, courier integrations, fraud protection, checkout recovery, analytics, and platform editions.",
    path: "/changelog",
    keywords: ["ConversionFlow changelog", "WooCommerce Meta CAPI updates", "fraud protection release notes"],
  },
  faq: {
    title: "ConversionFlow FAQ - Licensing, Tracking, Couriers, COD Protection",
    description:
      "Answers about ConversionFlow editions, pricing, Meta CAPI, courier integrations, partial payments, COD protection, support, and licensing.",
    path: "/faq",
    keywords: ["ConversionFlow FAQ", "WooCommerce COD protection FAQ", "Meta CAPI WooCommerce FAQ"],
  },
  platformComparison: {
    title: "WooCommerce vs Laravel vs Next.js/MERN - ConversionFlow Editions",
    description:
      "Compare ConversionFlow editions for WooCommerce merchants, Laravel commerce stacks, and Next.js/MERN headless commerce infrastructure.",
    path: "/platform-comparison",
    keywords: ["WooCommerce vs Laravel vs Next.js eCommerce tracking", "Laravel Meta CAPI", "Next.js eCommerce tracking"],
  },
  docs: {
    title: "ConversionFlow Documentation - Setup Tracking, Couriers, Fraud Protection",
    description:
      "Setup guides for ConversionFlow tracking, Meta CAPI, courier automation, fraud protection, partial payments, checkout recovery, and platform editions.",
    path: "/docs",
    keywords: ["ConversionFlow documentation", "Meta CAPI setup WooCommerce", "Steadfast WooCommerce integration"],
  },
  support: {
    title: "ConversionFlow Support - Tracking, Courier, COD and Licensing Help",
    description:
      "Get support for ConversionFlow setup, Meta CAPI, courier integrations, fraud protection, licensing, billing, and platform edition selection.",
    path: "/support",
    keywords: ["ConversionFlow support", "Meta CAPI setup help", "COD protection support"],
  },
};

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

  // Canonical URL: use DB override as base if set, otherwise siteConfig.url
  const siteUrl = overrides["seo_canonical_url"]?.trim() || siteConfig.url;
  const canonical = `${siteUrl}${seo.path ? seo.path : ""}`;

  // OG image: use DB override if set
  const ogImage = overrides["seo_og_image"]?.trim() || undefined;

  // Title: keep page-specific title as-is (per-page titles are better than global override)
  const title = seo.title;

  return {
    title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        en: getLocalizedUrl("en", seo.path),
        bn: getLocalizedUrl("bn", seo.path),
      },
    },
    openGraph: {
      title,
      description: seo.description,
      url: canonical,
      siteName: siteConfig.legalName,
      type: "website",
      locale: locale === "bn" ? "bn_BD" : "en_US",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seo.description,
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.supportEmail,
    sameAs: ["https://facebook.com/conversionflow", "https://linkedin.com/company/conversionflow"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.legalName,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.legalName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, WordPress, Laravel, Node.js",
    url: siteConfig.url,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "18",
      highPrice: "210",
      priceCurrency: "USD",
      offerCount: "9",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
