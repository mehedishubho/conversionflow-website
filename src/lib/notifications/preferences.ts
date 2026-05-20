/**
 * Notification preference lookup.
 *
 * Queries the notification_preferences table for a given user and category.
 * Returns a map of channel -> enabled status. Defaults to true for all
 * channels when no preference rows exist (new users get everything enabled).
 */

import { db } from "@/lib/db";
import { notificationPreferences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { NotificationCategory, NotificationChannel } from "@/lib/notifications/types";
import { NOTIFICATION_CHANNELS } from "@/lib/notifications/types";

/**
 * Get notification preferences for a user-category combination.
 * Returns a Record mapping each channel to its enabled status.
 * Channels with no explicit preference default to true (opt-in by default).
 */
export async function getNotificationPreferences(
  userId: string,
  category: NotificationCategory
): Promise<Record<NotificationChannel, boolean>> {
  const rows = await db
    .select({
      channel: notificationPreferences.channel,
      enabled: notificationPreferences.enabled,
    })
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.category, category)
      )
    );

  // Build preference map, defaulting to true for channels without explicit rows
  const prefs: Record<string, boolean> = {};
  for (const channel of NOTIFICATION_CHANNELS) {
    prefs[channel] = true;
  }

  // Override with explicit preferences from DB
  for (const row of rows) {
    if (row.enabled !== null) {
      prefs[row.channel] = row.enabled;
    }
  }

  return prefs as Record<NotificationChannel, boolean>;
}
