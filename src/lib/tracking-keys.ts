export const TRACKING_KEYS = [
  // Social / OG (7)
  "seo_fb_app_id",
  "seo_share_title",
  "seo_share_description",
  "seo_share_image",
  "seo_twitter_handle",
  "seo_twitter_card_type",
  "seo_linkedin_image",
  // Meta Pixel & CAPI (8)
  "meta_pixel_id",
  "meta_capi_token",
  "meta_dataset_id",
  "meta_test_event_code",
  "meta_advanced_matching",
  "meta_matching_fields",
  "meta_events",
  "meta_event_deduplication",
  // TikTok (6)
  "tiktok_pixel_id",
  "tiktok_events_token",
  "tiktok_advanced_matching",
  "tiktok_matching_fields",
  "tiktok_server_side",
  "tiktok_events",
  // Google Analytics & Ads (6)
  "google_analytics_id",
  "google_tag_manager_id",
  "google_ads_conversion_id",
  "google_ads_conversion_label",
  "google_server_side",
  "google_enhanced_ecommerce",
  // Schema Markup (3)
  "seo_schema_auto_generate",
  "seo_schema_overrides",
  "seo_schema_types_enabled",
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];

export const SOCIAL_KEYS: readonly TrackingKey[] = TRACKING_KEYS.slice(0, 7);
export const META_PIXEL_KEYS: readonly TrackingKey[] = TRACKING_KEYS.slice(7, 15);
export const TIKTOK_KEYS: readonly TrackingKey[] = TRACKING_KEYS.slice(15, 21);
export const GOOGLE_KEYS: readonly TrackingKey[] = TRACKING_KEYS.slice(21, 27);
export const SCHEMA_KEYS: readonly TrackingKey[] = TRACKING_KEYS.slice(27, 30);

export interface TrackingSettingsData {
  [key: string]: string;
}
