import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { createSSLSession } from "@/lib/ssl-commerz";
import { createAuditLog } from "@/lib/audit";
import { platformPricing } from "@/data/pricing";

// ──────────────────────────────────────────────
// Server-side price map (T-04-07: authoritative source of truth)
// Amounts in BDT (integer) matching pricing.ts values
// ──────────────────────────────────────────────

const PLAN_PRICES_BDT: Record<string, number> = {
  "woocommerce:1 Year": 2150,
  "woocommerce:2 Years": 3000,
  "woocommerce:Lifetime": 8000,
  "laravel:1 Year": 5000,
  "laravel:2 Years": 8000,
  "laravel:Lifetime": 20000,
  "nextjs:1 Year": 8000,
  "nextjs:2 Years": 12000,
  "nextjs:Lifetime": 25000,
};

const PRODUCT_IDS: Record<string, string> = {
  woocommerce: "conversionflow-wp",
  laravel: "conversionflow-laravel",
  nextjs: "conversionflow-nextjs",
};

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
    const { plan, platform, couponCode, discountAmount, taxAmount } = body as {
      plan: string;
      platform?: string;
      couponCode?: string;
      discountAmount?: number;
      taxAmount?: number;
    };

    const platformKey = platform || "woocommerce";
    const priceKey = `${platformKey}:${plan}`;

    if (!plan || !PLAN_PRICES_BDT[priceKey]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // 3. Validate plan exists in pricing tiers
    const pricingPlatform = platformPricing.find((p) => p.key === platformKey);
    const tier = pricingPlatform?.plans.find((p) => p.name === plan);
    if (!tier) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 400 }
      );
    }

    // 4. Compute authoritative price server-side (T-04-07)
    const baseAmount = PLAN_PRICES_BDT[priceKey];
    const discount = Math.max(0, Number(discountAmount) || 0);
    const tax = Math.max(0, Number(taxAmount) || 0);
    const totalAmount = Math.max(baseAmount - discount + tax, 0);

    // 5. Create a pending order in DB (to get order ID as tranId)
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.id,
        productId: PRODUCT_IDS[platformKey] || "conversionflow-wp",
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

    // 6. Build SSL Commerz session
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const sslResponse = await createSSLSession({
      totalAmount,
      currency: "BDT",
      tranId: order.id,
      successUrl: `${appUrl}/api/ssl-commerz/success`,
      failUrl: `${appUrl}/api/ssl-commerz/fail`,
      cancelUrl: `${appUrl}/api/ssl-commerz/cancel`,
      ipnUrl: `${appUrl}/api/ssl-commerz/ipn`,
      productName: `ConversionFlow ${pricingPlatform?.name || plan}`,
      productCategory: "Software License",
      cusName: user.name,
      cusEmail: user.email,
      cusPhone: user.phone || "",
      cusAdd1: "Dhaka",
      cusCity: "Dhaka",
      cusCountry: "Bangladesh",
      valueA: order.id,
      valueB: user.id,
      valueC: `${platformKey}:${plan}`,
      valueD: couponCode || "",
    });

    if (!sslResponse.GatewayPageURL) {
      return NextResponse.json(
        {
          error: "Failed to create payment session",
          detail: sslResponse.failedreason,
        },
        { status: 502 }
      );
    }

    // 7. Return GatewayPageURL and orderId to client
    return NextResponse.json({
      url: sslResponse.GatewayPageURL,
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
