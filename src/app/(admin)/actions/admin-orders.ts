"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, licenses, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import {
  importOrderToCentral,
  mockImportOrderToCentral,
  type ImportOrderPayload,
} from "@/lib/central-api";
import { nanoid } from "nanoid";

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
    redirect("/admin/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// 1. Verify Order (D-09, LIC-01)
// ──────────────────────────────────────────────

export async function verifyOrder(orderId: string) {
  const { userId, role } = await requireAdmin();

  if (!orderId) {
    return { error: "Order ID is required." };
  }

  // Fetch order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.status !== "pending") {
    return { error: "Only pending orders can be verified." };
  }

  // Update status to completed
  await db
    .update(orders)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "order.status_changed",
    targetType: "order",
    targetId: orderId,
    details: { from: "pending", to: "completed" },
  });

  // Sync to central API
  const [orderUser] = order.userId
    ? await db
        .select()
        .from(user)
        .where(eq(user.id, order.userId))
        .limit(1)
    : [];

  const payload: ImportOrderPayload = {
    orderId: orderId,
    userId: order.userId,
    userEmail: orderUser?.email ?? "",
    userName: orderUser?.name ?? "",
    userPhone: orderUser?.phone ?? "",
    productId: order.productId,
    plan: order.plan,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: order.paymentMethod ?? "unknown",
    paymentRef: order.paymentRef ?? null,
  };

  // Use mock if CENTRAL_API_KEY is not set
  const centralResult = process.env.CENTRAL_API_KEY
    ? await importOrderToCentral(payload)
    : await mockImportOrderToCentral(payload);

  if (centralResult.success && centralResult.data) {
    // Update order with central ID
    await db
      .update(orders)
      .set({
        centralOrderId: centralResult.data.centralOrderId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Update user central ID
    if (order.userId && centralResult.data.centralUserId) {
      await db
        .update(user)
        .set({ centralUserId: centralResult.data.centralUserId })
        .where(eq(user.id, order.userId));
    }

    // Create license record
    await db.insert(licenses).values({
      userId: order.userId,
      centralLicenseId: centralResult.data.centralLicenseId,
      orderId: orderId,
      productId: order.productId,
      plan: order.plan,
      licenseKey: centralResult.data.licenseKey,
      status: "active",
      activationDomains: [],
      maxActivations: order.plan === "starter" ? 1 : order.plan === "professional" ? 3 : 10,
      currentActivations: 0,
      expiresAt: null,
    });

    // Audit license creation
    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "license.created",
      targetType: "license",
      targetId: centralResult.data.centralLicenseId,
      details: {
        orderId,
        licenseKey: centralResult.data.licenseKey,
        source: "admin_verify",
      },
    });
  }
  // If central API fails, order stays completed but no central mapping (pending_sync per D-14)

  return { success: true };
}

// ──────────────────────────────────────────────
// 2. Reject Order (D-09, D-20)
// ──────────────────────────────────────────────

export async function rejectOrder(orderId: string, reason: string) {
  const { userId, role } = await requireAdmin();

  if (!orderId) {
    return { error: "Order ID is required." };
  }

  if (!reason || reason.trim().length === 0) {
    return { error: "Rejection reason is required." };
  }

  // Fetch order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.status !== "pending") {
    return { error: "Only pending orders can be rejected." };
  }

  // Update status to failed
  await db
    .update(orders)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "order.status_changed",
    targetType: "order",
    targetId: orderId,
    details: {
      from: "pending",
      to: "failed",
      reason: reason.trim(),
    },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 3. Issue Refund (D-20)
// ──────────────────────────────────────────────

export async function issueRefund(orderId: string, reason?: string) {
  const { userId, role } = await requireAdmin();

  if (!orderId) {
    return { error: "Order ID is required." };
  }

  // Fetch order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.status !== "completed") {
    return { error: "Only completed orders can be refunded." };
  }

  // Update status to refunded
  await db
    .update(orders)
    .set({ status: "refunded", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Revoke linked license
  const linkedLicenses = await db
    .select()
    .from(licenses)
    .where(eq(licenses.orderId, orderId));

  for (const license of linkedLicenses) {
    await db
      .update(licenses)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(licenses.id, license.id));

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "license.status_changed",
      targetType: "license",
      targetId: license.id,
      details: { from: license.status, to: "revoked", reason: "order_refunded" },
    });
  }

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "order.status_changed",
    targetType: "order",
    targetId: orderId,
    details: {
      from: "completed",
      to: "refunded",
      reason: reason ?? "Admin issued refund",
    },
  });

  return { success: true };
}
