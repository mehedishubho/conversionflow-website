"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

const VALID_ROLES = ["super_admin", "admin", "support_staff", "customer"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

/**
 * Change a user's role. Only super_admin can call this.
 * Prevents demoting the last super_admin.
 */
export async function updateUserRole(targetUserId: string, newRole: string) {
  const { session } = await requireSuperAdmin();

  if (!VALID_ROLES.includes(newRole as ValidRole)) {
    return { error: `Invalid role: ${newRole}` };
  }

  // Fetch the target user
  const [targetUser] = await db
    .select({ id: user.id, role: user.role, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return { error: "User not found." };
  }

  // Prevent self-demotion
  if (targetUser.id === session.user.id && newRole !== "super_admin") {
    return { error: "You cannot demote yourself." };
  }

  // Prevent demoting the last super_admin
  if (targetUser.role === "super_admin" && newRole !== "super_admin") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(eq(user.role, "super_admin"));

    if (Number(count) <= 1) {
      return { error: "Cannot demote the last super admin. Promote another user first." };
    }
  }

  const oldRole = targetUser.role;

  await db
    .update(user)
    .set({ role: newRole })
    .where(eq(user.id, targetUserId));

  await createAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "user.role_changed",
    targetType: "user",
    targetId: targetUserId,
    details: {
      oldRole,
      newRole,
      targetEmail: targetUser.email,
      targetName: targetUser.name,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);

  return { success: true };
}

/**
 * Ban a user. Only super_admin can call this.
 */
export async function banUser(
  targetUserId: string,
  reason: string,
  expiresAt?: Date
) {
  const { session } = await requireSuperAdmin();

  const [targetUser] = await db
    .select({ id: user.id, email: user.email, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return { error: "User not found." };
  }

  // Prevent banning self
  if (targetUser.id === session.user.id) {
    return { error: "You cannot ban yourself." };
  }

  // Prevent banning other super_admins
  if (targetUser.role === "super_admin") {
    return { error: "Cannot ban a super admin. Demote them first." };
  }

  await db
    .update(user)
    .set({
      banned: true,
      banReason: reason || null,
      banExpires: expiresAt || null,
    })
    .where(eq(user.id, targetUserId));

  await createAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "user.banned",
    targetType: "user",
    targetId: targetUserId,
    details: {
      reason: reason || "No reason provided",
      expiresAt: expiresAt?.toISOString() || "permanent",
      targetEmail: targetUser.email,
      targetName: targetUser.name,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);

  return { success: true };
}

/**
 * Unban (activate) a user. Only super_admin can call this.
 */
export async function unbanUser(targetUserId: string) {
  const { session } = await requireSuperAdmin();

  const [targetUser] = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return { error: "User not found." };
  }

  await db
    .update(user)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
    })
    .where(eq(user.id, targetUserId));

  await createAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "user.activated",
    targetType: "user",
    targetId: targetUserId,
    details: {
      targetEmail: targetUser.email,
      targetName: targetUser.name,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);

  return { success: true };
}
