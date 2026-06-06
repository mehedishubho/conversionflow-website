"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { OrderService } from "@/modules/billing/application/services/OrderService";

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

  // Audit log: record the admin-triggered status transition
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "order.status_changed",
    targetType: "order",
    targetId: orderId,
    details: { from: "pending", to: "completed" },
  });

  // Trigger order completion via Billing Context
  // OrderService.completeOrder() updates status + publishes OrderCompleted event.
  // The OrderCompletedHandler generates the license, creates audit log, and sends email.
  try {
    const orderService = new OrderService();
    await orderService.completeOrder(orderId, order.userId);
  } catch (completionError) {
    console.error(
      `[Admin] Order completion failed for ${orderId}:`,
      completionError
    );
    return {
      error: "Order completed but license generation failed. Check logs.",
    };
  }

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
