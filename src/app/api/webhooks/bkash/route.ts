/**
 * bKash Webhook/Callback Endpoint (D-28)
 *
 * Processes payment callbacks from bKash Tokenized Checkout API via BKashAdapter.
 * bKash calls the callbackURL after the customer completes or cancels payment.
 *
 * POST handler: Server-to-server callback with payment result in JSON body.
 * GET handler: Customer browser redirect after inline payment completes.
 *
 * Security (T-34-15): Server-side executePayment verification never trusts callback data alone.
 * Idempotency (T-34-10): Returns 200 if order already completed.
 * Audit (T-34-09): Raw payloads stored in payment_webhook_events.
 */

import { NextRequest, NextResponse } from "next/server";
import { GatewayRegistry } from "@/modules/payments/application/GatewayRegistry";
import { PaymentService } from "@/modules/payments/application/PaymentService";
import { db } from "@/lib/db";
import { orders, paymentWebhookEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST handler - bKash server-to-server callback with payment result.
 *
 * bKash sends a POST request to the callbackURL after payment processing.
 * The body contains paymentID and status. We verify server-side via
 * executePayment API to prevent spoofing (T-34-15).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get adapter from registry
    const registry = GatewayRegistry.getInstance();
    const adapter = registry.get("bkash_api");
    if (!adapter) {
      console.error("[Webhook/bKash] bKash adapter not registered");
      return NextResponse.json(
        { error: "Gateway not registered" },
        { status: 500 }
      );
    }

    // 2. Let adapter parse and verify callback (T-34-15: server-side executePayment)
    const result = await adapter.handleWebhook(request);

    // 3. Log raw webhook event (D-06, T-34-09)
    await db.insert(paymentWebhookEvents).values({
      gatewayId: "bkash_api",
      eventType: result.eventType,
      payload: result.rawPayload,
      processed: result.success,
      processedAt: result.success ? new Date() : null,
    });

    if (!result.success || !result.orderId) {
      console.warn(
        `[Webhook/bKash] Callback processing failed: eventType=${result.eventType}`
      );
      return NextResponse.json({ ok: true });
    }

    // 4. Find order by orderId (merchantInvoiceNumber = our order UUID)
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.id, result.orderId))
      .limit(1);

    const order = orderResults[0];
    if (!order) {
      console.warn(`[Webhook/bKash] Order not found: ${result.orderId}`);
      return NextResponse.json({ ok: true });
    }

    // 5. Idempotency check (T-34-10)
    if (order.status === "completed") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // 6. Complete or fail order
    if (result.status === "completed") {
      const paymentService = new PaymentService();
      await paymentService.completePaymentFromWebhook(order.id, order.userId);
      console.log(`[Webhook/bKash] Order ${order.id} completed successfully`);
    } else if (result.status === "failed") {
      await db
        .update(orders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(orders.id, result.orderId));
      console.log(`[Webhook/bKash] Order ${result.orderId} marked as failed`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook/bKash] Unhandled error:", error);
    // Return 200 to prevent bKash retries for transient errors
    return NextResponse.json({ ok: true });
  }
}

/**
 * GET handler - Customer browser redirect after inline payment.
 *
 * After the bKash JS SDK inline payment completes, bKash redirects
 * the customer's browser to the callbackURL with query params.
 * We redirect the user to the appropriate dashboard page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentID");
  const status = searchParams.get("status");

  if (status === "success" && paymentId) {
    // Redirect to success page with payment details
    return NextResponse.redirect(
      new URL(
        `/dashboard/checkout/success?gateway=bkash&paymentId=${encodeURIComponent(paymentId)}`,
        request.url
      )
    );
  }

  // Redirect to fail page for cancelled or failed payments
  return NextResponse.redirect(
    new URL("/dashboard/checkout/fail", request.url)
  );
}
