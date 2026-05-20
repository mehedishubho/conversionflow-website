import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { TRACKING_KEYS, type TrackingKey } from "@/lib/tracking-keys";

export type { TrackingKey };

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
