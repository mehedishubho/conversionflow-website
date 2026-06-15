"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notifications, user, notificationDeliveries } from "@/lib/db/schema";
import { eq, desc, ilike, and, or, gt, sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  return { session, userId: session.user.id, role };
}

export interface DeliveryInfo {
  channel: string;
  status: string;
  error: string | null;
}

export interface NotificationRow {
  id: string;
  userId: string;
  userName: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean | null;
  createdAt: Date;
  deliveries: DeliveryInfo[];
}

export async function getAdminNotifications(search?: string, type?: string): Promise<NotificationRow[]> {
  await requireAdmin();

  const conditions = [];
  if (search) {
    conditions.push(or(
      ilike(notifications.title, `%${search}%`),
      ilike(notifications.message, `%${search}%`),
      ilike(user.name, `%${search}%`)
    ));
  }
  if (type) {
    conditions.push(eq(notifications.type, type));
  }

  const rows = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      userName: user.name,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .leftJoin(user, eq(notifications.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  // Fetch deliveries for each notification
  const rowsWithDeliveries = await Promise.all(
    rows.map(async (row) => {
      const deliveryRows = await db
        .select({
          channel: notificationDeliveries.channel,
          status: notificationDeliveries.status,
          error: notificationDeliveries.error,
        })
        .from(notificationDeliveries)
        .where(eq(notificationDeliveries.notificationId, row.id));

      return {
        ...row,
        deliveries: deliveryRows.map((d) => ({
          channel: d.channel,
          status: d.status,
          error: d.error,
        })),
      };
    })
  );

  return rowsWithDeliveries;
}

export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  try {
    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
    });

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "notification.sent",
      targetType: "user",
      targetId: userId,
      details: { type, title },
    });

    return { success: true };
  } catch {
    return { error: "Failed to send notification" };
  }
}

export async function broadcastNotification(
  type: string,
  title: string,
  message: string
): Promise<{ success?: boolean; error?: string; count?: number }> {
  const { session } = await requireAdmin();

  try {
    const allUsers = await db.select({ id: user.id }).from(user);
    if (allUsers.length === 0) return { success: true, count: 0 };

    await db.insert(notifications).values(
      allUsers.map((u) => ({
        userId: u.id,
        type,
        title,
        message,
      }))
    );

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "notification.broadcast",
      targetType: "system",
      details: { type, title, recipientCount: allUsers.length },
    });

    return { success: true, count: allUsers.length };
  } catch {
    return { error: "Failed to broadcast notification" };
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();

  try {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
    return { success: true };
  } catch {
    return { error: "Failed to delete notification" };
  }
}

export interface RecentAdminNotification {
  id: string;
  userId: string;
  userName: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean | null;
  createdAt: Date;
}

// Read-only recent activity feed for the admin bell dropdown.
// Admins have no owned notifications, so this returns the most recent
// system-wide notifications across ALL users with the target user's name.
// `unreadCount` is a "recent activity" signal (notifications created in the
// last 24h), NOT a per-admin unread tally. READ-ONLY by construction — no
// mark-read mutation path exists here.
export async function getRecentAdminNotifications(
  limit = 8
): Promise<{ notifications: RecentAdminNotification[]; unreadCount: number }> {
  await requireAdmin();

  const rows = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      userName: user.name,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .leftJoin(user, eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  // Recent-activity signal: count of notifications created in the last 24h.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(gt(notifications.createdAt, since));

  return {
    notifications: rows,
    unreadCount: Number(recentRow?.count ?? 0),
  };
}
