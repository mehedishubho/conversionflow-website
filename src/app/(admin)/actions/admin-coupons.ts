"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  coupons,
  couponApplicablePlans,
  products,
  productPlans,
} from "@/lib/db/schema";
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
 * List all coupons with scope info (product name, applicable plans).
 */
export async function listCoupons() {
  const { userId, role } = await requireAdmin();

  try {
    const rows = await db
      .select({
        id: coupons.id,
        code: coupons.code,
        type: coupons.type,
        value: coupons.value,
        minOrderAmount: coupons.minOrderAmount,
        maxUses: coupons.maxUses,
        currentUses: coupons.currentUses,
        expiresAt: coupons.expiresAt,
        active: coupons.active,
        createdAt: coupons.createdAt,
        scope: coupons.scope,
        applicableProductId: coupons.applicableProductId,
        productName: products.name,
      })
      .from(coupons)
      .leftJoin(products, eq(coupons.applicableProductId, products.id))
      .orderBy(desc(coupons.createdAt));

    // Fetch plan applicabilities for all coupons with scope="plan"
    const planApplicabilities = await db
      .select({
        couponId: couponApplicablePlans.couponId,
        planName: productPlans.name,
      })
      .from(couponApplicablePlans)
      .innerJoin(
        productPlans,
        eq(couponApplicablePlans.planId, productPlans.id)
      );

    // Group plan names by couponId
    const planMap = new Map<string, string[]>();
    for (const a of planApplicabilities) {
      const arr = planMap.get(a.couponId) ?? [];
      arr.push(a.planName);
      planMap.set(a.couponId, arr);
    }

    const couponsWithScope = rows.map((row) => ({
      ...row,
      applicablePlans: planMap.get(row.id) ?? [],
    }));

    return { success: true as const, coupons: couponsWithScope };
  } catch (error) {
    console.error("[Admin] Failed to list coupons:", error);
    return { success: true as const, coupons: [] };
  }
}

/**
 * Create a new coupon from form data.
 * Validates code, type, value, scope, and optional fields.
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

  // Validate scope
  const scope = (formData.get("scope") as string) || "all";
  if (!["all", "product", "plan"].includes(scope)) {
    return { error: "Invalid scope value." };
  }

  const applicableProductId = formData.get("applicableProductId") as string | null;
  if (scope === "product" && !applicableProductId) {
    return { error: "Please select a product when scope is 'product'." };
  }

  const planIds = formData.getAll("planIds") as string[];
  if (scope === "plan" && planIds.length === 0) {
    return { error: "Please select at least one plan when scope is 'plan'." };
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
        scope: scope as "all" | "product" | "plan",
        applicableProductId: scope === "product" ? applicableProductId : null,
      })
      .returning();

    // Insert junction rows for plan scope
    if (scope === "plan" && planIds.length > 0) {
      await db.insert(couponApplicablePlans).values(
        planIds.map((planId) => ({
          couponId: coupon.id,
          planId,
        }))
      );
    }

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "coupon.created",
      targetType: "coupon",
      targetId: coupon.id,
      details: { code, type, value, scope, applicableProductId, planIds },
    });

    return { success: true as const, couponId: coupon.id };
  } catch (error) {
    console.error("[Admin] Failed to create coupon:", error);
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

/**
 * Get a single coupon by ID with scope info (for edit page).
 */
export async function getCouponById(couponId: string) {
  const { userId, role } = await requireAdmin();

  if (!couponId) {
    return { error: "Coupon ID is required." } as const;
  }

  try {
    const [row] = await db
      .select({
        id: coupons.id,
        code: coupons.code,
        type: coupons.type,
        value: coupons.value,
        minOrderAmount: coupons.minOrderAmount,
        maxUses: coupons.maxUses,
        currentUses: coupons.currentUses,
        expiresAt: coupons.expiresAt,
        active: coupons.active,
        scope: coupons.scope,
        applicableProductId: coupons.applicableProductId,
        createdAt: coupons.createdAt,
      })
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (!row) {
      return { error: "Coupon not found." } as const;
    }

    // Fetch applicable plan IDs
    const applicablePlanRows = await db
      .select({ planId: couponApplicablePlans.planId })
      .from(couponApplicablePlans)
      .where(eq(couponApplicablePlans.couponId, couponId));

    return {
      success: true as const,
      coupon: {
        ...row,
        applicablePlanIds: applicablePlanRows.map((r) => r.planId),
      },
    };
  } catch (error) {
    console.error("[Admin] Failed to get coupon:", error);
    return { error: "Failed to fetch coupon." } as const;
  }
}

/**
 * Update an existing coupon from form data.
 * Handles scope changes and junction table updates.
 */
export async function updateCoupon(formData: FormData) {
  const { userId, role } = await requireAdmin();

  const couponId = formData.get("couponId") as string;
  if (!couponId) {
    return { error: "Coupon ID is required." };
  }

  const code = ((formData.get("code") as string) || "").trim().toUpperCase();
  const type = formData.get("type") as string;
  const valueStr = formData.get("value") as string;
  const minOrderAmountStr = formData.get("minOrderAmount") as string | null;
  const maxUsesStr = formData.get("maxUses") as string | null;
  const expiresAtStr = formData.get("expiresAt") as string | null;

  if (!code || code.length < 3) {
    return { error: "Coupon code is required and must be at least 3 characters." };
  }
  if (type !== "percentage" && type !== "flat") {
    return { error: "Coupon type must be 'percentage' or 'flat'." };
  }
  const value = parseInt(valueStr, 10);
  if (isNaN(value) || value <= 0) {
    return { error: "Coupon value must be a positive number." };
  }
  if (type === "percentage" && value > 100) {
    return { error: "Percentage value must be between 1 and 100." };
  }
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
  const scope = (formData.get("scope") as string) || "all";
  if (!["all", "product", "plan"].includes(scope)) {
    return { error: "Invalid scope value." };
  }
  const applicableProductId = formData.get("applicableProductId") as string | null;
  if (scope === "product" && !applicableProductId) {
    return { error: "Please select a product when scope is 'product'." };
  }
  const planIds = formData.getAll("planIds") as string[];
  if (scope === "plan" && planIds.length === 0) {
    return { error: "Please select at least one plan when scope is 'plan'." };
  }

  try {
    const [existing] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);
    if (!existing) {
      return { error: "Coupon not found." };
    }

    // Check code uniqueness (exclude self)
    if (code !== existing.code) {
      const [duplicate] = await db
        .select({ id: coupons.id })
        .from(coupons)
        .where(eq(coupons.code, code))
        .limit(1);
      if (duplicate) {
        return { error: `Coupon code "${code}" already exists.` };
      }
    }

    await db
      .update(coupons)
      .set({
        code,
        type: type as "percentage" | "flat",
        value,
        minOrderAmount: minOrderAmount ?? undefined,
        maxUses: maxUses ?? undefined,
        expiresAt: expiresAt ?? undefined,
        scope: scope as "all" | "product" | "plan",
        applicableProductId: scope === "product" ? applicableProductId : null,
      })
      .where(eq(coupons.id, couponId));

    // Update junction table: delete old, insert new
    await db
      .delete(couponApplicablePlans)
      .where(eq(couponApplicablePlans.couponId, couponId));
    if (scope === "plan" && planIds.length > 0) {
      await db.insert(couponApplicablePlans).values(
        planIds.map((planId) => ({ couponId, planId }))
      );
    }

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "coupon.updated",
      targetType: "coupon",
      targetId: couponId,
      details: { code, type, value, scope, applicableProductId, planIds },
    });

    return { success: true as const };
  } catch (error) {
    console.error("[Admin] Failed to update coupon:", error);
    return { error: "Failed to update coupon." };
  }
}
