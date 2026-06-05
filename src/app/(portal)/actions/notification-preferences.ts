"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NotificationPreferences } from "@/modules/notifications/domain/types";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  license: true,
  billing: true,
  support: true,
  system: true,
  channels: { email: true, in_app: true },
};

export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db
      .update(user)
      .set({ notificationPreferences: preferences })
      .where(eq(user.id, session.user.id));
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save preferences";
    return { success: false, error: message };
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [row] = await db
    .select({ notificationPreferences: user.notificationPreferences })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return (row?.notificationPreferences as NotificationPreferences | null) ?? DEFAULT_PREFERENCES;
}
