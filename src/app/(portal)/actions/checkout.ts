"use server";

import { db } from "@/lib/db";
import {
  orders,
  coupons,
  paymentAccounts,
  settings,
  paymentMethodEnum,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";

// ── Server-side price map (authoritative, never trust client) ──
// Plan names must match pricingTiers[].plan in @/data/pricing.ts
const PLAN_PRICES: Record<string, { amount: number; productId: string }> = {
  Starter: { amount: 2150, productId: "conversionflow-wp" },
  Professional: { amount: 3000, productId: "conversionflow-wp" },
  Agency: { amount: 8000, productId: "conversionflow-wp" },
};

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
 */
export async function validateCoupon(
  code: string,
  orderAmount: number
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
  const planPrice = PLAN_PRICES[plan];
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
 */
export async function getOrderDetails(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)));

  return order ?? null;
}
