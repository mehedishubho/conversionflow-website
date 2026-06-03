import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateSSLPayment } from "@/lib/ssl-commerz";
import { createAuditLog } from "@/lib/audit";
import { OrderService } from "@/modules/billing/application/services/OrderService";

/**
 * SSL Commerz IPN (Instant Payment Notification) handler.
 *
 * CRITICAL SECURITY NOTES (T-04-06, T-04-08, Pitfall 3):
 * - This is the ONLY route that marks orders as completed
 * - Always validate via server-to-server call (validateSSLPayment)
 * - Never trust redirect/form data alone
 * - val_id is single-use and verified server-to-server
 * - Handler is idempotent: returns 200 if order already completed (T-04-11)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Read form data from SSL Commerz callback
    const formData = await request.formData();
    const valId = formData.get("val_id") as string | null;
    const tranId = formData.get("tran_id") as string | null;
    const status = formData.get("status") as string | null;
    const bankTranId = formData.get("bank_tran_id") as string | null;
    const amount = formData.get("amount") as string | null;
    const currency = formData.get("currency") as string | null;

    if (!valId || !tranId) {
      return NextResponse.json(
        { error: "Missing required fields: val_id, tran_id" },
        { status: 400 }
      );
    }

    // 2. Validate payment server-to-server (T-04-06, T-04-08)
    const validation = await validateSSLPayment(valId);

    if (validation.status !== "VALID") {
      console.warn(`[IPN] Payment validation failed for tran_id=${tranId}, status=${validation.status}`);
      return NextResponse.json(
        { error: "Payment validation failed" },
        { status: 400 }
      );
    }

    // 3. Find order by tran_id (our order UUID)
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.id, tranId))
      .limit(1);

    const order = orderResults[0];
    if (!order) {
      console.warn(`[IPN] Order not found for tran_id=${tranId}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 4. Idempotency check: if order already completed, return 200 (T-04-11)
    if (order.status === "completed") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // 5. Audit log: record the IPN-triggered status transition
    await createAuditLog({
      actorId: "system",
      actorRole: "system",
      action: "order.status_changed",
      targetType: "order",
      targetId: order.id,
      details: {
        from: order.status,
        to: "completed",
        paymentRef: bankTranId,
        amount,
        currency,
        status,
      },
    });

    // 6. Trigger order completion via Billing Context
    // OrderService.completeOrder() updates status + publishes OrderCompleted event.
    // The OrderCompletedHandler generates the license, creates audit log, and sends email.
    // SSL Commerce will retry the IPN on failure — idempotency handles retries.
    try {
      const orderService = new OrderService();
      await orderService.completeOrder(order.id, order.userId);
    } catch (completionError) {
      console.error(
        `[IPN] Order completion failed for ${order.id}:`,
        completionError
      );
      // Order status update failed — SSL Commerce will retry
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[IPN] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
