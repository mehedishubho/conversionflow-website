"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ADMIN_NOTIFICATION_TYPES = [
  "payment_failed",
  "license_expiring",
  "new_signup",
  "new_ticket",
  "fraud_alert",
];

export async function getAdminNotifications() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { notifications: [], unreadCount: 0 };

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    return { notifications: [], unreadCount: 0 };
  }

  const userId = session.user.id;

  const adminNotifs = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        inArray(notifications.type, ADMIN_NOTIFICATION_TYPES)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(10);

  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        inArray(notifications.type, ADMIN_NOTIFICATION_TYPES),
        eq(notifications.read, false)
      )
    );

  return {
    notifications: adminNotifs,
    unreadCount: Number(unreadResult?.count ?? 0),
  };
}

export async function markAdminNotificationRead(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: true };

  const userId = session.user.id;

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        inArray(notifications.type, ADMIN_NOTIFICATION_TYPES)
      )
    );

  return { success: true };
}

export async function markAllAdminNotificationsRead() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: true };

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    return { success: true };
  }

  const userId = session.user.id;

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.userId, userId),
        inArray(notifications.type, ADMIN_NOTIFICATION_TYPES),
        eq(notifications.read, false)
      )
    );

  return { success: true };
}

export async function createAdminNotification(params: {
  adminUserId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  if (!ADMIN_NOTIFICATION_TYPES.includes(params.type)) {
    return { error: "Invalid notification type." };
  }

  await db.insert(notifications).values({
    userId: params.adminUserId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: params.data ?? null,
    read: false,
  });

  return { success: true };
}
