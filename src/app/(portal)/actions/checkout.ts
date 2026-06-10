"use server";

import { db } from "@/lib/db";
import {
  orders,
  coupons,
  couponApplicablePlans,
  paymentAccounts,
  settings,
  paymentMethodEnum,
  licenses,
  productPlans,
  products,
  paymentGateways,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";
import { PaymentService } from "@/modules/payments/application/PaymentService";
import { GatewayRegistry } from "@/modules/payments/application/GatewayRegistry";

// ── Server-side price map (authoritative, never trust client) ──
// Dynamically resolved from product_plans table at first call.
// Fallback to hardcoded values if DB lookup fails.
const FALLBACK_PRICES: Record<string, { amount: number; productId: string }> = {
  Starter: { amount: 2150, productId: "conversionflow-wp" },
  Professional: { amount: 3000, productId: "conversionflow-wp" },
  Agency: { amount: 8000, productId: "conversionflow-wp" },
};

let cachedPlanPrices: Record<string, { amount: number; productId: string }> | null = null;

/**
 * Resolve plan prices from the database.
 * JOINs product_plans with products to get the product slug.
 * Caches result for the process lifetime.
 */
export async function getPlanPrices(): Promise<Record<string, { amount: number; productId: string }>> {
  if (cachedPlanPrices) return cachedPlanPrices;

  try {
    const rows = await db
      .select({
        planName: productPlans.name,
        planSlug: productPlans.slug,
        priceBDT: productPlans.priceBDT,
        productSlug: products.slug,
      })
      .from(productPlans)
      .innerJoin(products, eq(productPlans.productId, products.id))
      .where(eq(productPlans.active, true));

    if (rows.length > 0) {
      cachedPlanPrices = {};
      for (const row of rows) {
        // Key by plan name (matches checkout form values like "Starter", "Professional", "Agency")
        cachedPlanPrices[row.planName] = {
          amount: row.priceBDT,
          productId: row.productSlug,
        };
      }
      return cachedPlanPrices;
    }
  } catch (error) {
    console.error("[Checkout] Failed to resolve plan prices from DB, using fallback:", error);
  }

  return FALLBACK_PRICES;
}

/** Invalidate cached plan prices. Call after admin plan mutations. */
export async function clearPlanPricesCache(): Promise<void> {
  cachedPlanPrices = null;
}

/**
 * Get checkout prices as a simple name→amount map for the client.
 * Used by checkout page to avoid hardcoded price values.
 */
export async function getCheckoutPrices(): Promise<Record<string, number>> {
  const prices = await getPlanPrices();
  const result: Record<string, number> = {};
  for (const [name, data] of Object.entries(prices)) {
    result[name.toLowerCase()] = data.amount;
  }
  return result;
}

// ── Types ──

type CouponResult =
  | { success: true; discount: number; type: string; value: number }
  | { error: string };

type OrderResult =
  | { success: true; orderId: string }
  | { error: string };

type VatResult = {
  taxAmount: number;
  total: number;
  rate: number;
  mode: string;
};

// ── Server Actions ──

/**
 * Validate a coupon code and reserve its usage within a transaction.
 * Prevents race conditions on currentUses exceeding maxUses (T-04-03).
 * Also checks scope applicability (all / product / plan).
 */
export async function validateCoupon(
  code: string,
  orderAmount: number,
  planName?: string
): Promise<CouponResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  if (!code || typeof code !== "string") {
    return { error: "Invalid coupon code" };
  }

  if (!orderAmount || orderAmount <= 0) {
    return { error: "Invalid order amount" };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [coupon] = await tx
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, code.trim().toUpperCase()), eq(coupons.active, true)));

      if (!coupon) {
        return { error: "Invalid coupon code" };
      }

      // Check expiry
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return { error: "This coupon has expired" };
      }

      // Check usage limit
      const currentUses = coupon.currentUses ?? 0;
      if (coupon.maxUses !== null && currentUses >= coupon.maxUses) {
        return { error: "This coupon has reached its usage limit" };
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        return {
          error: `Minimum order amount for this coupon is ${coupon.minOrderAmount} BDT`,
        };
      }

      // ── Scope applicability check ──
      const scope = (coupon as Record<string, unknown>).scope as string | undefined;

      if (scope === "product" && (coupon as Record<string, unknown>).applicableProductId) {
        if (!planName) {
          return { error: "Cannot verify coupon applicability without a plan" };
        }
        const planPrices = await getPlanPrices();
        const checkoutPlan = planPrices[planName];
        if (!checkoutPlan) {
          return { error: "Invalid plan for coupon check" };
        }
        const [applicableProduct] = await tx
          .select({ slug: products.slug })
          .from(products)
          .where(eq(products.id, (coupon as Record<string, unknown>).applicableProductId as string))
          .limit(1);
        if (!applicableProduct || applicableProduct.slug !== checkoutPlan.productId) {
          return { error: "This coupon does not apply to the selected product" };
        }
      }

      if (scope === "plan") {
        if (!planName) {
          return { error: "Cannot verify coupon applicability without a plan" };
        }
        const applicablePlanRows = await tx
          .select({ planName: productPlans.name })
          .from(couponApplicablePlans)
          .innerJoin(productPlans, eq(couponApplicablePlans.planId, productPlans.id))
          .where(eq(couponApplicablePlans.couponId, coupon.id));
        const applicablePlanNames = applicablePlanRows.map((r) => r.planName);
        if (!applicablePlanNames.includes(planName)) {
          return { error: "This coupon does not apply to the selected plan" };
        }
      }
      // scope === "all" or undefined → no check needed

      // Calculate discount
      let discount: number;
      if (coupon.type === "percentage") {
        discount = Math.round((orderAmount * coupon.value) / 100);
        // Cap discount at order amount
        discount = Math.min(discount, orderAmount);
      } else {
        // flat discount
        discount = Math.min(coupon.value, orderAmount);
      }

      // Increment currentUses within the same transaction
      await tx
        .update(coupons)
        .set({ currentUses: (coupon.currentUses ?? 0) + 1 })
        .where(eq(coupons.id, coupon.id));

      return {
        success: true as const,
        discount,
        type: coupon.type,
        value: coupon.value,
      };
    });

    return result;
  } catch (error) {
    console.error("[validateCoupon] Error:", error);
    return { error: "Failed to validate coupon. Please try again." };
  }
}

/**
 * Create a manual payment order with transaction ID dedup check (D-21).
 * Server-side price validation from PLAN_PRICES (T-04-01).
 */
export async function createManualOrder(
  formData: FormData
): Promise<OrderResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  // Extract form fields
  const plan = formData.get("plan") as string;
  const paymentMethodRaw = formData.get("paymentMethod") as string;
  const paymentRef = (formData.get("paymentRef") as string)?.trim();
  const couponCode = (formData.get("couponCode") as string)?.trim() || null;
  const clientAmount = formData.get("amount") as string;
  const clientTaxAmount = formData.get("taxAmount") as string;
  const clientDiscountAmount = formData.get("discountAmount") as string;

  // Validate plan exists and get server-side price (T-04-01)
  const planPrices = await getPlanPrices();
  const planPrice = planPrices[plan];
  if (!planPrice) {
    return { error: "Invalid plan selected" };
  }

  // Validate payment method against enum values
  const validMethods = paymentMethodEnum.enumValues;
  if (!validMethods.includes(paymentMethodRaw as typeof validMethods[number])) {
    return { error: "Invalid payment method" };
  }
  const paymentMethod = paymentMethodRaw as typeof validMethods[number];

  // Manual methods require payment reference (transaction ID)
  const manualMethods = ["bkash", "nagad", "rocket", "bank_transfer"];
  if (manualMethods.includes(paymentMethod)) {
    if (!paymentRef || paymentRef.length < 4) {
      return {
        error:
          "Transaction ID is required for manual payments (minimum 4 characters)",
      };
    }
  }

  // Dedup check on paymentRef (D-21 / T-04-02)
  if (paymentRef) {
    const [existing] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.paymentRef, paymentRef));
    if (existing) {
      return { error: "This transaction ID has already been used." };
    }
  }

  // Use server-computed amount (never trust client amount)
  const amount = planPrice.amount;
  const discountAmount = clientDiscountAmount ? parseInt(clientDiscountAmount, 10) : 0;
  const taxAmount = clientTaxAmount ? parseInt(clientTaxAmount, 10) : 0;

  // Insert order with pending status
  const [order] = await db
    .insert(orders)
    .values({
      userId,
      productId: planPrice.productId,
      plan,
      amount,
      paymentMethod,
      paymentRef: paymentRef || null,
      status: "pending",
      couponCode,
      discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
      taxAmount: isNaN(taxAmount) ? 0 : taxAmount,
    })
    .returning({ id: orders.id });

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: session.user.role,
    action: "order.created",
    targetType: "order",
    targetId: order.id,
  });

  return { success: true, orderId: order.id };
}

/**
 * Calculate VAT based on settings table values.
 * Defaults to 15% exclusive if settings not found (D-15, D-16).
 */
export async function calculateVAT(amount: number): Promise<VatResult> {
  if (!amount || amount <= 0) {
    return { taxAmount: 0, total: 0, rate: 0, mode: "exclusive" };
  }

  // Read rate, mode, and enabled flag from settings table
  const settingsRows = await db.select().from(settings);

  const enabledRow = settingsRows.find((s) => s.key === "vat_enabled");
  const isEnabled = enabledRow ? enabledRow.value !== "false" : true;

  if (!isEnabled) {
    return { taxAmount: 0, total: amount, rate: 0, mode: "exclusive" };
  }

  const rateRow = settingsRows.find((s) => s.key === "vat_rate");
  const modeRow = settingsRows.find((s) => s.key === "vat_mode");

  const rate = rateRow ? parseInt(rateRow.value, 10) : 15;
  const mode = modeRow?.value || "exclusive";

  // Handle NaN from parseInt
  const safeRate = isNaN(rate) ? 15 : rate;

  let taxAmount: number;
  let total: number;

  if (mode === "inclusive") {
    // Tax is already included in the amount
    taxAmount = Math.round((amount * safeRate) / (100 + safeRate));
    total = amount;
  } else {
    // Tax is added on top (exclusive)
    taxAmount = Math.round((amount * safeRate) / 100);
    total = amount + taxAmount;
  }

  return { taxAmount, total, rate: safeRate, mode };
}

/**
 * Get all active payment accounts grouped by method.
 * No auth required -- used on the public checkout page to display instructions.
 */
export async function getPaymentAccounts() {
  const accounts = await db
    .select()
    .from(paymentAccounts)
    .where(eq(paymentAccounts.active, true));

  // Check if SSL Commerce is enabled
  const [sslEnabledRow] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "ssl_commerz_enabled"))
    .limit(1);
  const sslEnabled = sslEnabledRow ? sslEnabledRow.value !== "false" : true;

  // Group by method
  const grouped: Record<
    string,
    Array<{
      accountName: string;
      accountNumber: string;
      bankName: string | null;
      branch: string | null;
      routingNumber: string | null;
      instructions: string | null;
    }>
  > = {};

  for (const account of accounts) {
    const method = account.method;
    if (!grouped[method]) {
      grouped[method] = [];
    }
    grouped[method].push({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      branch: account.branch,
      routingNumber: account.routingNumber,
      instructions: account.instructions,
    });
  }

  return { accounts: grouped, sslEnabled };
}

/**
 * Get order details by ID for the success page.
 * Only returns orders belonging to the authenticated user.
 * Includes the license key when order status is completed.
 */
export async function getOrderDetails(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)));

  if (!order) return null;

  // Fetch license key for completed orders
  let licenseKey: string | null = null;
  if (order.status === "completed") {
    const [license] = await db
      .select({ licenseKey: licenses.licenseKey })
      .from(licenses)
      .where(eq(licenses.orderId, orderId))
      .limit(1);
    licenseKey = license?.licenseKey ?? null;
  }

  return { ...order, licenseKey };
}

// ──────────────────────────────────────────────
// Gateway Checkout Actions (Phase 34)
// ──────────────────────────────────────────────

/**
 * Create an order through an automatic gateway.
 * Server-side price resolution (T-34-20, T-34-21).
 * Returns redirectUrl from gateway session or error.
 */
export async function createGatewayOrder(params: {
  plan: string;
  gatewayId: string;
  currency: string;
  couponCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}): Promise<{ orderId: string; redirectUrl?: string; transactionId?: string; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  // Validate plan (T-34-20: server-side price resolution)
  const planPrices = await getPlanPrices();
  const planPrice = planPrices[params.plan];
  if (!planPrice) {
    return { error: "Invalid plan selected.", orderId: "" };
  }

  // Resolve currency-specific price
  const planRow = await db
    .select({
      id: productPlans.id,
      priceBDT: productPlans.priceBDT,
      priceUSD: productPlans.priceUSD,
      productId: productPlans.productId,
    })
    .from(productPlans)
    .innerJoin(products, eq(productPlans.productId, products.id))
    .where(eq(productPlans.name, params.plan))
    .limit(1);

  if (!planRow.length) {
    return { error: "Plan not found.", orderId: "" };
  }

  const amount = params.currency === "USD"
    ? planRow[0].priceUSD
    : planRow[0].priceBDT;

  // Validate gateway is active (T-34-21)
  const registry = GatewayRegistry.getInstance();
  const adapter = registry.get(params.gatewayId);
  if (!adapter) {
    return { error: "Invalid payment gateway.", orderId: "" };
  }

  // Check gateway supports selected currency
  if (!adapter.supportedCurrencies.includes(params.currency)) {
    return { error: `Gateway does not support ${params.currency}.`, orderId: "" };
  }

  // Check gateway is active in DB
  const [gatewayRow] = await db
    .select()
    .from(paymentGateways)
    .where(eq(paymentGateways.gatewayId, params.gatewayId))
    .limit(1);

  if (!gatewayRow || !gatewayRow.active) {
    return { error: "Payment gateway is not available.", orderId: "" };
  }

  try {
    const paymentService = new PaymentService();

    // Validate discount server-side if coupon provided (WR-02: never trust client amounts)
    let validatedDiscount = 0;
    if (params.couponCode) {
      const couponResult = await validateCoupon(params.couponCode, amount, params.plan);
      if ("success" in couponResult && couponResult.success) {
        validatedDiscount = couponResult.discount;
      }
    }

    // Create pending order
    const orderId = await paymentService.createPendingOrder({
      userId,
      productId: planPrice.productId,
      plan: params.plan,
      amount,
      currency: params.currency,
      paymentMethod: params.gatewayId,
      gatewayId: params.gatewayId,
      couponCode: params.couponCode,
      discountAmount: validatedDiscount,
      taxAmount: params.taxAmount,
    });

    // Get user info from existing session (no redundant fetch)
    const userEmail = session.user.email ?? "";
    const userName = session.user.name ?? "";

    // Create gateway session
    const sessionResult = await paymentService.initiatePayment(orderId, params.gatewayId, {
      orderId,
      userId,
      amount,
      currency: params.currency,
      productId: planPrice.productId,
      plan: params.plan,
      couponCode: params.couponCode,
      customerEmail: userEmail,
      customerName: userName,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/checkout/success?order=${orderId}`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/checkout?plan=${params.plan.toLowerCase()}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/checkout?plan=${params.plan.toLowerCase()}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/webhooks/${params.gatewayId === "ssl_commerz" ? "sslcommerz" : params.gatewayId}`,
    });

    // Audit log
    await createAuditLog({
      actorId: userId,
      actorRole: session.user.role,
      action: "order.gateway_created",
      targetType: "order",
      targetId: orderId,
    });

    return {
      orderId,
      redirectUrl: sessionResult.redirectUrl,
      transactionId: sessionResult.transactionId,
    };
  } catch (err) {
    console.error("[createGatewayOrder] Error:", err);
    return { error: "Payment session creation failed. Please try again.", orderId: "" };
  }
}

/**
 * Get active gateways and manual payment methods for a given currency.
 * Used by checkout GatewaySelector component.
 */
export async function getActiveGateways(currency: string): Promise<{
  automatic: Array<{ gatewayId: string; name: string; testMode: boolean }>;
  manual: Array<{ method: string; accountName: string }>;
}> {
  // Get automatic gateways that support this currency
  const registry = GatewayRegistry.getInstance();
  const adapters = registry.getForCurrency(currency);

  // Check which have active DB configs
  const activeGatewayRows = await db
    .select()
    .from(paymentGateways)
    .where(eq(paymentGateways.active, true));

  const activeGatewayIds = new Set(activeGatewayRows.map((r) => r.gatewayId));
  const activeGatewayMap = new Map(activeGatewayRows.map((r) => [r.gatewayId, r]));

  const automatic = adapters
    .filter((a) => activeGatewayIds.has(a.gatewayId))
    .map((a) => ({
      gatewayId: a.gatewayId,
      name: a.name,
      testMode: activeGatewayMap.get(a.gatewayId)?.testMode ?? true,
    }));

  // Get manual payment accounts (only for BDT)
  let manual: Array<{ method: string; accountName: string }> = [];
  if (currency === "BDT") {
    const accounts = await db
      .select()
      .from(paymentAccounts)
      .where(eq(paymentAccounts.active, true));

    manual = accounts.map((a) => ({
      method: a.method,
      accountName: a.accountName,
    }));
  }

  return { automatic, manual };
}

/**
 * Get order data for the unified success page.
 * Returns order + license + gateway-aware receipt info.
 */
export async function getOrderForSuccessPage(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)));

  if (!order) return null;

  // Fetch license key for completed orders
  let licenseKey: string | null = null;
  if (order.status === "completed") {
    const [license] = await db
      .select({ licenseKey: licenses.licenseKey })
      .from(licenses)
      .where(eq(licenses.orderId, orderId))
      .limit(1);
    licenseKey = license?.licenseKey ?? null;
  }

  // Gateway-aware receipt info
  const receiptInfo: {
    type: "paddle" | "download_invoice" | "pending_verification";
    url?: string;
    label: string;
  } = order.gatewayId === "paddle"
    ? { type: "paddle", label: "View Receipt" }
    : order.gatewayId === "ssl_commerz" || order.gatewayId === "bkash_api"
      ? { type: "download_invoice", label: "Download Invoice" }
      : { type: "pending_verification", label: "Pending admin verification" };

  return {
    ...order,
    licenseKey,
    receiptInfo,
    gatewayDisplayName: getGatewayDisplayName(order.gatewayId),
  };
}

/**
 * Get human-readable gateway display name.
 */
function getGatewayDisplayName(gatewayId: string | null): string {
  if (!gatewayId) return "Manual Payment";
  const names: Record<string, string> = {
    ssl_commerz: "SSL Commerz",
    paddle: "Paddle",
    bkash_api: "bKash (Auto)",
  };
  return names[gatewayId] ?? gatewayId;
}
