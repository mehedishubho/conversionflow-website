"use server";

import { db } from "@/lib/db";
import { user, notificationPreferences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from "@/lib/notifications/types";
import type { NotificationCategory, NotificationChannel } from "@/lib/notifications/types";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name || name.trim().length < 1) {
    return { error: "Name is required" };
  }

  await db
    .update(user)
    .set({ name: name.trim(), phone: phone?.trim() || "" })
    .where(eq(user.id, userId));

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword) {
    return { error: "Current password is required" };
  }
  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Password change is handled client-side via authClient.changePassword
  // which validates the current password through Better Auth API.
  // This server action performs validation only.
  return { success: true, message: "Validation passed" };
}

/**
 * Get notification preferences for the current session user.
 * Returns a matrix: Record<category, Record<channel, boolean>>.
 * Defaults to true (enabled) for all category/channel combinations with no DB row.
 */
export async function getUserNotificationPreferences(): Promise<{
  preferences: Record<string, Record<string, boolean>>;
}> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    // Return defaults for unauthenticated users
    const defaults: Record<string, Record<string, boolean>> = {};
    for (const category of NOTIFICATION_CATEGORIES) {
      defaults[category] = {};
      for (const channel of NOTIFICATION_CHANNELS) {
        defaults[category][channel] = true;
      }
    }
    return { preferences: defaults };
  }

  const userId = session.user.id;
  const rows = await db
    .select({
      category: notificationPreferences.category,
      channel: notificationPreferences.channel,
      enabled: notificationPreferences.enabled,
    })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));

  // Build full matrix, defaulting to true for missing combinations
  const matrix: Record<string, Record<string, boolean>> = {};
  for (const category of NOTIFICATION_CATEGORIES) {
    matrix[category] = {};
    for (const channel of NOTIFICATION_CHANNELS) {
      matrix[category][channel] = true;
    }
  }

  // Override with explicit preferences from DB
  for (const row of rows) {
    if (row.enabled !== null) {
      if (!matrix[row.category]) {
        matrix[row.category] = {};
      }
      matrix[row.category][row.channel] = row.enabled;
    }
  }

  return { preferences: matrix };
}

/**
 * Update notification preferences for the current session user.
 * Each preference has a category, channel, and enabled flag.
 * Validates category and channel against the allowed catalogs.
 * Uses upsert pattern: update existing row or insert new one.
 */
export async function updateNotificationPreferences(
  preferences: Array<{ category: string; channel: string; enabled: boolean }>
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;

  // Validate each preference against allowed catalogs (T-07-14)
  for (const pref of preferences) {
    if (
      !NOTIFICATION_CATEGORIES.includes(pref.category as NotificationCategory)
    ) {
      return { error: `Invalid category: ${pref.category}` };
    }
    if (
      !NOTIFICATION_CHANNELS.includes(pref.channel as NotificationChannel)
    ) {
      return { error: `Invalid channel: ${pref.channel}` };
    }
  }

  // Upsert each preference
  for (const pref of preferences) {
    const existing = await db
      .select({ id: notificationPreferences.id })
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.category, pref.category),
          eq(notificationPreferences.channel, pref.channel)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(notificationPreferences)
        .set({ enabled: pref.enabled })
        .where(eq(notificationPreferences.id, existing[0].id));
    } else {
      await db.insert(notificationPreferences).values({
        userId,
        category: pref.category,
        channel: pref.channel,
        enabled: pref.enabled,
      });
    }
  }

  return { success: true };
}
