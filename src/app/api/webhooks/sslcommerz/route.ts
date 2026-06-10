/**
 * SSL Commerz Unified Webhook Endpoint (D-27)
 *
 * Processes IPN callbacks from SSL Commerz via the SSLCommerzAdapter.
 * This is the canonical webhook path; the legacy IPN handler at
 * /api/ssl-commerz/ipn remains for backward compatibility with
 * SSL Commerz's existing retry queue.
 *
 * Security (T-34-07): Server-to-server validation via adapter.verifyPayment()
 * Idempotency (T-34-10): Returns 200 if order already completed.
 * Audit (T-34-09): Raw payloads stored in payment_webhook_events.
 */

import { NextRequest, NextResponse } from "next/server";
import { GatewayRegistry } from "@/modules/payments/application/GatewayRegistry";
import { PaymentService } from "@/modules/payments/application/PaymentService";
import { db } from "@/lib/db";
import { orders, paymentWebhookEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Get adapter from registry
    const registry = GatewayRegistry.getInstance();
    const adapter = registry.get("ssl_commerz");
    if (!adapter) {
      console.error("[Webhook/SSLCommerz] SSL Commerz adapter not registered");
      return NextResponse.json(
        { error: "Gateway not registered" },
        { status: 500 }
      );
    }

    // 2. Let adapter parse and verify webhook
    const result = await adapter.handleWebhook(request);

    // 3. Log raw webhook event (D-06, T-34-09)
    await db.insert(paymentWebhookEvents).values({
      gatewayId: "ssl_commerz",
      eventType: result.eventType,
      payload: result.rawPayload,
      processed: result.success,
      processedAt: result.success ? new Date() : null,
    });

    if (!result.success || !result.orderId) {
      console.warn(
        `[Webhook/SSLCommerz] Webhook processing failed: eventType=${result.eventType}`
      );
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 400 }
      );
    }

    // 4. Find order by orderId (tran_id = our order UUID)
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.id, result.orderId))
      .limit(1);

    const order = orderResults[0];
    if (!order) {
      console.warn(
        `[Webhook/SSLCommerz] Order not found: ${result.orderId}`
      );
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 5. Idempotency check (T-34-10)
    if (order.status === "completed") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // 5b. Amount verification: ensure paid amount matches order amount
    if (result.rawPayload) {
      const paidAmount = parseFloat(result.rawPayload.amount as string) || 0;
      if (paidAmount > 0 && Math.abs(paidAmount - order.amount) > 1) {
        console.error(
          `[Webhook/SSLCommerz] Amount mismatch: order=${order.amount}, paid=${paidAmount}`
        );
        return NextResponse.json(
          { error: "Amount mismatch" },
          { status: 400 }
        );
      }
    }

    // 6. Complete order via PaymentService
    const paymentService = new PaymentService();
    await paymentService.completePaymentFromWebhook(order.id, order.userId);

    console.log(
      `[Webhook/SSLCommerz] Order ${order.id} completed successfully`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook/SSLCommerz] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
