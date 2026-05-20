export const SEO_KEYS = [
  // General SEO (10)
  "seo_title",
  "seo_description",
  "seo_keywords",
  "seo_canonical_url",
  "seo_separator",
  "seo_robots_default",
  "seo_og_image",
  "seo_auto_meta",
  "seo_lowercase_urls",
  "seo_trailing_slash",
  // Verification (5)
  "seo_verify_google",
  "seo_verify_bing",
  "seo_verify_yandex",
  "seo_verify_baidu",
  "seo_verify_pinterest",
  // Sitemaps (8)
  "seo_sitemap_enabled",
  "seo_sitemap_pages",
  "seo_sitemap_blog",
  "seo_sitemap_docs",
  "seo_sitemap_landing",
  "seo_sitemap_excludes",
  "seo_sitemap_frequency",
  "seo_sitemap_auto_regenerate",
  // Robots (2)
  "seo_robots_txt",
  "seo_ai_bots",
  // Sitemap meta (1)
  "seo_sitemap_last_generated",
] as const;

export type SeoKey = (typeof SEO_KEYS)[number];

export const GENERAL_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(0, 10);
export const VERIFICATION_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(10, 15);
export const SITEMAP_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(15, 24);
export const ROBOTS_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(24, 26);

export interface SeoSettingsData {
  [key: string]: string;
}
