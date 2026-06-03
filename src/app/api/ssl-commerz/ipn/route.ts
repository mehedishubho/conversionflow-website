import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, licenses, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateSSLPayment } from "@/lib/ssl-commerz";
import {
  importOrderToCentral,
  mockImportOrderToCentral,
} from "@/lib/central-api";
import { createAuditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail } from "@/lib/emails/order-confirmation";

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

    // 5. Update order: mark completed, set paymentRef
    await db
      .update(orders)
      .set({
        status: "completed",
        paymentRef: bankTranId || null,
      })
      .where(eq(orders.id, order.id));

    // 6. Audit log: order status changed (T-04-09)
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

    // 7. Fetch user data for central API payload
    const userResults = await db
      .select()
      .from(user)
      .where(eq(user.id, order.userId))
      .limit(1);

    const orderUser = userResults[0];

    // 8. Sync to central API (D-13, LIC-01, LIC-02)
    const centralPayload = {
      orderId: order.id,
      userId: order.userId,
      userEmail: orderUser?.email || "",
      userName: orderUser?.name || "",
      userPhone: orderUser?.phone || "",
      productId: order.productId,
      plan: order.plan,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: "ssl_commerz",
      paymentRef: bankTranId || null,
    };

    const CENTRAL_API_KEY = process.env.CENTRAL_API_KEY;
    const centralResult = CENTRAL_API_KEY
      ? await importOrderToCentral(centralPayload)
      : await mockImportOrderToCentral(centralPayload);

    if (centralResult.success && centralResult.data) {
      const centralData = centralResult.data;

      // 9a. Update order with centralOrderId
      await db
        .update(orders)
        .set({ centralOrderId: centralData.centralOrderId })
        .where(eq(orders.id, order.id));

      // 9b. Update user with centralUserId
      if (orderUser && centralData.centralUserId) {
        await db
          .update(user)
          .set({ centralUserId: centralData.centralUserId })
          .where(eq(user.id, order.userId));
      }

      // 9c. Insert license record
      await db.insert(licenses).values({
        userId: order.userId,
        orderId: order.id,
        productId: order.productId,
        plan: order.plan,
        licenseKey: centralData.licenseKey,
        status: "active",
        centralLicenseId: centralData.centralLicenseId,
      });

      // 9d. Audit log: license created
      await createAuditLog({
        actorId: "system",
        actorRole: "system",
        action: "license.created",
        targetType: "license",
        targetId: order.id,
        details: {
          licenseKey: centralData.licenseKey,
          centralLicenseId: centralData.centralLicenseId,
          centralOrderId: centralData.centralOrderId,
        },
      });
    } else {
      // 10. Central API failed: order stays completed but no central mapping
      // This is the "pending_sync" state (D-14)
      console.error(
        `[IPN] Central API sync failed for order ${order.id}: ${centralResult.error}`
      );
      // Order is completed, centralOrderId remains null
      // Admin can retry sync later via admin dashboard
    }

    // 11. Send confirmation email (T-04-23: wrapped in try/catch, email failure does not block)
    try {
      if (orderUser?.email) {
        const licenseResult = await db
          .select({ licenseKey: licenses.licenseKey })
          .from(licenses)
          .where(eq(licenses.orderId, order.id))
          .limit(1);
        await sendOrderConfirmationEmail({
          to: orderUser.email,
          orderNumber: order.id.slice(0, 8),
          planName: order.plan,
          amount: order.amount,
          currency: order.currency,
          paymentMethod: order.paymentMethod ?? "ssl_commerz",
          licenseKey: licenseResult[0]?.licenseKey,
          status: "completed",
        });
      }
    } catch (emailError) {
      console.error(`[IPN] Failed to send confirmation email for order ${order.id}:`, emailError);
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
