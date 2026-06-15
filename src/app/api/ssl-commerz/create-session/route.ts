/**
 * @deprecated Use PaymentService.createPendingOrder + initiatePayment via checkout actions instead.
 * This route creates orders without dedup checks and will be removed in a future release.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createSSLSession } from "@/lib/ssl-commerz";
import { createAuditLog } from "@/lib/audit";
import { GatewayRegistry } from "@/modules/payments/application/GatewayRegistry";
import { PaymentService } from "@/modules/payments/application/PaymentService";

// ──────────────────────────────────────────────
// Server-side price map (T-04-07: authoritative source of truth)
// Amounts in BDT (integer) matching pricing.ts values
// ──────────────────────────────────────────────

const PLAN_PRICES_BDT: Record<string, number> = {
  Starter: 2150,
  Professional: 3000,
  Agency: 8000,
};

const PRODUCT_ID = "conversionflow-wp-plugin";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user;

    // 2. Parse request body
    const body = await request.json();
    const { plan, couponCode, discountAmount, taxAmount } = body as {
      plan: string;
      couponCode?: string;
      discountAmount?: number;
      taxAmount?: number;
    };

    if (!plan || !PLAN_PRICES_BDT[plan]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // 3. Compute authoritative price server-side (T-04-07)
    const baseAmount = PLAN_PRICES_BDT[plan];
    const discount = Math.max(0, Number(discountAmount) || 0);
    const tax = Math.max(0, Number(taxAmount) || 0);
    const totalAmount = Math.max(baseAmount - discount + tax, 0);

    // 4b. Dedup check: prevent duplicate pending orders for same user+plan
    const existingOrder = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.userId, user.id), eq(orders.plan, plan), eq(orders.status, "pending")))
      .limit(1);
    if (existingOrder.length > 0) {
      return NextResponse.json(
        { error: "A pending order already exists for this plan. Please complete or cancel it first." },
        { status: 409 }
      );
    }

    // 5. Create a pending order in DB (to get order ID as tranId)
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.id,
        productId: PRODUCT_ID,
        plan,
        amount: baseAmount,
        currency: "BDT",
        paymentMethod: "ssl_commerz",
        status: "pending",
        couponCode: couponCode || null,
        discountAmount: discount,
        taxAmount: tax,
      })
      .returning();

    if (!order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Audit: order created
    await createAuditLog({
      actorId: user.id,
      action: "order.created",
      targetType: "order",
      targetId: order.id,
      details: { plan, amount: baseAmount, totalAmount, couponCode },
    });

    // 6. Build SSL Commerz session via adapter (with fallback to legacy)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const registry = GatewayRegistry.getInstance();
    const adapter = registry.get("ssl_commerz");

    let redirectUrl: string | undefined;

    if (adapter) {
      // Use the new adapter path via PaymentService
      const paymentService = new PaymentService();
      const sessionResult = await paymentService.initiatePayment(
        order.id,
        "ssl_commerz",
        {
          orderId: order.id,
          userId: user.id,
          amount: totalAmount,
          currency: "BDT",
          productId: PRODUCT_ID,
          plan,
          couponCode: couponCode || undefined,
          customerEmail: user.email,
          customerName: user.name,
          customerPhone: user.phone || undefined,
          successUrl: `${appUrl}/api/ssl-commerz/success`,
          failUrl: `${appUrl}/api/ssl-commerz/fail`,
          cancelUrl: `${appUrl}/api/ssl-commerz/cancel`,
          webhookUrl: `${appUrl}/api/webhooks/sslcommerz`,
        }
      );
      redirectUrl = sessionResult.redirectUrl;
    } else {
      // Fallback to legacy createSSLSession during migration
      const sslResponse = await createSSLSession({
        totalAmount,
        currency: "BDT",
        tranId: order.id,
        successUrl: `${appUrl}/api/ssl-commerz/success`,
        failUrl: `${appUrl}/api/ssl-commerz/fail`,
        cancelUrl: `${appUrl}/api/ssl-commerz/cancel`,
        ipnUrl: `${appUrl}/api/webhooks/sslcommerz`,
        productName: `ConversionFlow ${plan}`,
        productCategory: "WordPress Plugin",
        cusName: user.name,
        cusEmail: user.email,
        cusPhone: user.phone || "",
        cusAdd1: "Dhaka",
        cusCity: "Dhaka",
        cusCountry: "Bangladesh",
        valueA: order.id,
        valueB: user.id,
        valueC: plan,
        valueD: couponCode || "",
      });
      redirectUrl = sslResponse.GatewayPageURL;
    }

    if (!redirectUrl) {
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 502 }
      );
    }

    // 7. Return redirect URL and orderId to client
    return NextResponse.json({
      url: redirectUrl,
      orderId: order.id,
    });
  } catch (error) {
    console.error("[SSL create-session] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
