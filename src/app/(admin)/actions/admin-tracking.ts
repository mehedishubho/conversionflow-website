"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

const TRACKING_KEYS = [
  "google_search_console_verification",
  "facebook_pixel_id",
  "facebook_capi_token",
  "google_tag_manager_id",
  "google_analytics_id",
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];

export interface TrackingData {
  google_search_console_verification: string;
  facebook_pixel_id: string;
  facebook_capi_token: string;
  google_tag_manager_id: string;
  google_analytics_id: string;
}

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return { session, userId: session.user.id, role };
}

export async function getTrackingSettingsAdmin(): Promise<TrackingData> {
  await requireAdmin();

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

export async function saveTrackingSettings(data: TrackingData) {
  const { userId, role } = await requireAdmin();

  for (const key of TRACKING_KEYS) {
    const value = data[key];
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.settings_updated",
    targetType: "settings",
    targetId: "tracking",
    details: {
      action: "tracking_settings_updated",
      keys: TRACKING_KEYS.filter((k) => !!data[k]),
    },
  });

  return { success: true };
}
