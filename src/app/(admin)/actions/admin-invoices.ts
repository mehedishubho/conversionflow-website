"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendPaymentReminderEmail } from "@/lib/emails/payment-reminder";

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

export async function sendPaymentReminder(orderId: string) {
  const { userId, role } = await requireAdmin();

  if (!orderId) {
    return { error: "Order ID is required." };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.status !== "pending") {
    return { error: "Reminders can only be sent for pending orders." };
  }

  const [orderUser] = order.userId
    ? await db
        .select()
        .from(user)
        .where(eq(user.id, order.userId))
        .limit(1)
    : [];

  if (!orderUser?.email) {
    return { error: "Customer email not found." };
  }

  try {
    await sendPaymentReminderEmail({
      to: orderUser.email,
      orderNumber: orderId.slice(0, 8),
      planName: order.plan,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: order.paymentMethod ?? "N/A",
    });
  } catch (emailError) {
    console.error(`[Admin] Failed to send payment reminder for order ${orderId}:`, emailError);
    return { error: "Failed to send email. Please try again." };
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "order.reminder_sent",
    targetType: "order",
    targetId: orderId,
    details: { email: orderUser.email },
  });

  return { success: true };
}
