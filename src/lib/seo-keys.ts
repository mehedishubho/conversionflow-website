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
  // AI SEO (2) - Plan 12-02
  "seo_ai_usage_rules",
  "seo_llms_txt_custom",
  // Image SEO (4) - Plan 12-03
  "seo_image_auto_alt",
  "seo_image_webp",
  "seo_image_lazy_loading",
  "seo_image_compression",
  // Performance SEO (5) - Plan 12-04
  "seo_perf_critical_css",
  "seo_perf_js_defer",
  "seo_perf_minification",
  "seo_perf_cdn_url",
  "seo_perf_cache_settings",
] as const;

export type SeoKey = (typeof SEO_KEYS)[number];

export const GENERAL_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(0, 10);
export const VERIFICATION_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(10, 15);
export const SITEMAP_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(15, 23);
export const ROBOTS_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(23, 25);
export const AI_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(26, 28);
export const IMAGE_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(28, 32);
export const PERFORMANCE_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(32, 37);

export interface SeoSettingsData {
  [key: string]: string;
}
