/**
 * Paddle Webhook Endpoint (D-27)
 *
 * Processes webhook events from Paddle Billing API via the PaddleAdapter.
 * Paddle sends webhook notifications for transaction lifecycle events.
 *
 * Security (T-34-11): HMAC-SHA256 signature verification via adapter.handleWebhook()
 * Idempotency (T-34-10): Returns 200 if order already completed.
 * Audit (T-34-09): Raw payloads stored in payment_webhook_events.
 *
 * Event types handled (D-16):
 * - transaction.completed -> complete order
 * - transaction.payment_failed -> mark order failed
 * - transaction.refunded -> mark order refunded
 */

import { NextRequest, NextResponse } from "next/server";
import { GatewayRegistry } from "@/modules/payments/application/GatewayRegistry";
import { PaymentService } from "@/modules/payments/application/PaymentService";
import { PaymentError } from "@/modules/payments/domain/PaymentError";
import { db } from "@/lib/db";
import { orders, paymentWebhookEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Get adapter from registry
    const registry = GatewayRegistry.getInstance();
    const adapter = registry.get("paddle");
    if (!adapter) {
      console.error("[Webhook/Paddle] Paddle adapter not registered");
      return NextResponse.json(
        { error: "Gateway not registered" },
        { status: 500 }
      );
    }

    // 2. Let adapter verify signature and parse webhook (T-34-11)
    const result = await adapter.handleWebhook(request);

    // 3. Log raw webhook event (D-06, T-34-09)
    await db.insert(paymentWebhookEvents).values({
      gatewayId: "paddle",
      eventType: result.eventType,
      payload: result.rawPayload,
      processed: result.success,
      processedAt: result.success ? new Date() : null,
    });

    // Return 200 for unknown/failed events to prevent Paddle retries
    if (!result.success || !result.orderId) {
      console.warn(
        `[Webhook/Paddle] Webhook processing skipped: eventType=${result.eventType}`
      );
      return NextResponse.json({ ok: true });
    }

    // 4. Idempotency check (T-34-10)
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.id, result.orderId))
      .limit(1);

    const order = orderResults[0];
    if (!order || order.status === "completed") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // 4b. Amount verification: ensure paid amount matches order amount
    if (result.rawPayload && result.status === "completed") {
      const data = (result.rawPayload as { data?: { details?: { totals?: { total?: string } } } })?.data;
      const paidAmount = parseFloat(String(data?.details?.totals?.total ?? "0")) || 0;
      if (paidAmount > 0 && Math.abs(paidAmount - order.amount) > 1) {
        console.error(
          `[Webhook/Paddle] Amount mismatch: order=${order.amount}, paid=${paidAmount}`
        );
        return NextResponse.json(
          { error: "Amount mismatch" },
          { status: 400 }
        );
      }
    }

    // 5. Handle event type
    if (result.status === "completed") {
      const paymentService = new PaymentService();
      await paymentService.completePaymentFromWebhook(order.id, order.userId);
      console.log(
        `[Webhook/Paddle] Order ${order.id} completed successfully`
      );
    } else if (result.status === "failed") {
      await db
        .update(orders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(orders.id, result.orderId));
      console.log(
        `[Webhook/Paddle] Order ${result.orderId} marked as failed`
      );
    } else if (result.status === "refunded") {
      // Refunded webhook - update order status (license revocation handled by admin)
      await db
        .update(orders)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(eq(orders.id, result.orderId));
      console.log(
        `[Webhook/Paddle] Order ${result.orderId} marked as refunded`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook/Paddle] Unhandled error:", error);
    // Only swallow errors that Paddle retrying won't fix (e.g., invalid config, business logic)
    if (error instanceof PaymentError) {
      return NextResponse.json({ ok: true });
    }
    // For unknown/transient errors (DB connection, network), let Paddle retry
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
