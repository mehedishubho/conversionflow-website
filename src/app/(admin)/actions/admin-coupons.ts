"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

// ──────────────────────────────────────────────
// Admin Role Guard
// ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Coupon Actions
// ──────────────────────────────────────────────

/**
 * List all coupons ordered by creation date (newest first).
 */
export async function listCoupons() {
  const { userId, role } = await requireAdmin();

  try {
    const rows = await db
      .select()
      .from(coupons)
      .orderBy(desc(coupons.createdAt));

    return { success: true as const, coupons: rows };
  } catch (error) {
    console.error("[Admin] Failed to list coupons:", error);
    return { success: true as const, coupons: [] };
  }
}

/**
 * Create a new coupon from form data.
 * Validates code, type, value, and optional fields.
 */
export async function createCoupon(formData: FormData) {
  const { userId, role } = await requireAdmin();

  const code = ((formData.get("code") as string) || "").trim().toUpperCase();
  const type = formData.get("type") as string;
  const valueStr = formData.get("value") as string;
  const minOrderAmountStr = formData.get("minOrderAmount") as string | null;
  const maxUsesStr = formData.get("maxUses") as string | null;
  const expiresAtStr = formData.get("expiresAt") as string | null;

  // Validate code
  if (!code || code.length < 3) {
    return { error: "Coupon code is required and must be at least 3 characters." };
  }

  // Validate type
  if (type !== "percentage" && type !== "flat") {
    return { error: "Coupon type must be 'percentage' or 'flat'." };
  }

  // Validate value
  const value = parseInt(valueStr, 10);
  if (isNaN(value) || value <= 0) {
    return { error: "Coupon value must be a positive number." };
  }
  if (type === "percentage" && value > 100) {
    return { error: "Percentage value must be between 1 and 100." };
  }

  // Validate optional fields
  const minOrderAmount = minOrderAmountStr ? parseInt(minOrderAmountStr, 10) : null;
  if (minOrderAmountStr && (isNaN(minOrderAmount!) || minOrderAmount! < 0)) {
    return { error: "Minimum order amount must be a non-negative number." };
  }

  const maxUses = maxUsesStr ? parseInt(maxUsesStr, 10) : null;
  if (maxUsesStr && (isNaN(maxUses!) || maxUses! <= 0)) {
    return { error: "Max uses must be a positive number." };
  }

  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
  if (expiresAtStr && isNaN(expiresAt!.getTime())) {
    return { error: "Invalid expiry date." };
  }

  try {
    const [coupon] = await db
      .insert(coupons)
      .values({
        code,
        type: type as "percentage" | "flat",
        value,
        minOrderAmount: minOrderAmount ?? undefined,
        maxUses: maxUses ?? undefined,
        expiresAt: expiresAt ?? undefined,
        active: true,
      })
      .returning();

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "coupon.created",
      targetType: "coupon",
      targetId: coupon.id,
      details: { code, type, value },
    });

    return { success: true as const, couponId: coupon.id };
  } catch (error) {
    console.error("[Admin] Failed to create coupon:", error);
    // Unique constraint violation on code
    if (error instanceof Error && error.message.includes("unique")) {
      return { error: `Coupon code "${code}" already exists.` };
    }
    return { error: "Failed to create coupon." };
  }
}

/**
 * Toggle a coupon's active status (enable/disable).
 */
export async function toggleCouponActive(couponId: string) {
  const { userId, role } = await requireAdmin();

  if (!couponId) {
    return { error: "Coupon ID is required." };
  }

  try {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (!coupon) {
      return { error: "Coupon not found." };
    }

    const newActive = !coupon.active;

    await db
      .update(coupons)
      .set({ active: newActive })
      .where(eq(coupons.id, couponId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "coupon.toggled",
      targetType: "coupon",
      targetId: couponId,
      details: { code: coupon.code, active: newActive },
    });

    return { success: true as const };
  } catch (error) {
    console.error("[Admin] Failed to toggle coupon:", error);
    return { error: "Failed to toggle coupon status." };
  }
}

/**
 * Delete a coupon permanently.
 */
export async function deleteCoupon(couponId: string) {
  const { userId, role } = await requireAdmin();

  if (!couponId) {
    return { error: "Coupon ID is required." };
  }

  try {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (!coupon) {
      return { error: "Coupon not found." };
    }

    await db.delete(coupons).where(eq(coupons.id, couponId));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "coupon.deleted",
      targetType: "coupon",
      targetId: couponId,
      details: { code: coupon.code },
    });

    return { success: true as const };
  } catch (error) {
    console.error("[Admin] Failed to delete coupon:", error);
    return { error: "Failed to delete coupon." };
  }
}
