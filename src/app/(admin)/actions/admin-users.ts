"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user, orders, licenses, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

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

export interface UserDetailData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
}

export interface UserOrderRow {
  id: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export interface UserLicenseRow {
  id: string;
  licenseKey: string;
  plan: string;
  status: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface UserActivityResult {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export async function getUserDetail(targetUserId: string) {
  await requireAdmin();

  if (!targetUserId) {
    return { error: "User ID is required." };
  }

  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return { error: "User not found." };
  }

  const userOrders = await db
    .select({
      id: orders.id,
      plan: orders.plan,
      amount: orders.amount,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, targetUserId))
    .orderBy(desc(orders.createdAt))
    .limit(10);

  const userLicenses = await db
    .select({
      id: licenses.id,
      licenseKey: licenses.licenseKey,
      plan: licenses.plan,
      status: licenses.status,
      expiresAt: licenses.expiresAt,
      createdAt: licenses.createdAt,
    })
    .from(licenses)
    .where(eq(licenses.userId, targetUserId))
    .orderBy(desc(licenses.createdAt));

  const userActivity = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(eq(auditLogs.actorId, targetUserId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  return {
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role,
      banned: targetUser.banned,
      banReason: targetUser.banReason,
      twoFactorEnabled: targetUser.twoFactorEnabled,
      createdAt: targetUser.createdAt,
    } as UserDetailData,
    orders: userOrders as UserOrderRow[],
    licenses: userLicenses as UserLicenseRow[],
    activity: userActivity.map((a) => ({
      ...a,
      details: a.details as Record<string, unknown> | null,
    })) as UserActivityResult[],
  };
}

const VALID_ROLES = ["customer", "admin", "support_staff", "super_admin"];

export async function changeUserRole(targetUserId: string, newRole: string) {
  const { userId, role: adminRole } = await requireAdmin();

  if (!targetUserId) {
    return { error: "User ID is required." };
  }

  if (!VALID_ROLES.includes(newRole)) {
    return { error: "Invalid role." };
  }

  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return { error: "User not found." };
  }

  const oldRole = targetUser.role || "customer";

  await db
    .update(user)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(user.id, targetUserId));

  await createAuditLog({
    actorId: userId,
    actorRole: adminRole,
    action: "user.role_changed",
    targetType: "user",
    targetId: targetUserId,
    details: { from: oldRole, to: newRole },
  });

  return { success: true };
}

export async function toggleUserBan(targetUserId: string, ban: boolean, reason?: string) {
  const { userId, role: adminRole } = await requireAdmin();

  if (!targetUserId) {
    return { error: "User ID is required." };
  }

  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return { error: "User not found." };
  }

  if (ban) {
    if (!reason || reason.trim().length === 0) {
      return { error: "Ban reason is required." };
    }
    await db
      .update(user)
      .set({ banned: true, banReason: reason.trim(), updatedAt: new Date() })
      .where(eq(user.id, targetUserId));
  } else {
    await db
      .update(user)
      .set({ banned: false, banReason: null, updatedAt: new Date() })
      .where(eq(user.id, targetUserId));
  }

  await createAuditLog({
    actorId: userId,
    actorRole: adminRole,
    action: ban ? "user.banned" : "user.activated",
    targetType: "user",
    targetId: targetUserId,
    details: { reason: reason ?? "Account reactivated" },
  });

  return { success: true };
}
