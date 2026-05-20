import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const TRACKING_KEYS = [
  "google_search_console_verification",
  "facebook_pixel_id",
  "facebook_capi_token",
  "google_tag_manager_id",
  "google_analytics_id",
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];

export async function getTrackingSettings(): Promise<Record<TrackingKey, string>> {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, [...TRACKING_KEYS]));

  const map = {} as Record<TrackingKey, string>;
  for (const key of TRACKING_KEYS) {
    const row = rows.find((r) => r.key === key);
    map[key] = row?.value ?? "";
  }
  return map;
}
