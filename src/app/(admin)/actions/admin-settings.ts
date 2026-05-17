"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { paymentAccounts, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

// ──────────────────────────────────────────────
// Admin Role Guard
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface PaymentAccountInput {
  method: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branch?: string;
  routingNumber?: string;
  instructions?: string;
  active: boolean;
}

// ──────────────────────────────────────────────
// 1. Save Payment Account (D-10, D-11)
// ──────────────────────────────────────────────

export async function savePaymentAccount(data: PaymentAccountInput) {
  const { userId, role } = await requireAdmin();

  if (!data.method) {
    return { error: "Payment method is required." };
  }

  if (!data.accountName || !data.accountNumber) {
    return { error: "Account name and number are required." };
  }

  // Check if account exists for this method
  const existing = await db
    .select()
    .from(paymentAccounts)
    .where(eq(paymentAccounts.method, data.method as "bkash" | "nagad" | "rocket" | "bank_transfer" | "ssl_commerz"))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(paymentAccounts)
      .set({
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName ?? null,
        branch: data.branch ?? null,
        routingNumber: data.routingNumber ?? null,
        instructions: data.instructions ?? null,
        active: data.active,
        updatedAt: new Date(),
      })
      .where(eq(paymentAccounts.id, existing[0].id));
  } else {
    // Insert new
    await db.insert(paymentAccounts).values({
      method: data.method as "bkash" | "nagad" | "rocket" | "bank_transfer" | "ssl_commerz",
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      bankName: data.bankName ?? null,
      branch: data.branch ?? null,
      routingNumber: data.routingNumber ?? null,
      instructions: data.instructions ?? null,
      active: data.active,
    });
  }

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.setup_completed",
    targetType: "payment_account",
    targetId: data.method,
    details: { action: "payment_account_updated", method: data.method },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 2. Save VAT Settings (D-15)
// ──────────────────────────────────────────────

export async function saveVATSettings(data: { rate: number; mode: "inclusive" | "exclusive" }) {
  const { userId, role } = await requireAdmin();

  // Validate rate
  if (typeof data.rate !== "number" || isNaN(data.rate) || data.rate < 0 || data.rate > 100) {
    return { error: "VAT rate must be a number between 0 and 100." };
  }

  // Validate mode
  if (data.mode !== "inclusive" && data.mode !== "exclusive") {
    return { error: "VAT mode must be 'inclusive' or 'exclusive'." };
  }

  // Upsert vat_rate
  const existingRate = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vat_rate"))
    .limit(1);

  if (existingRate.length > 0) {
    await db
      .update(settings)
      .set({ value: String(data.rate), updatedAt: new Date() })
      .where(eq(settings.key, "vat_rate"));
  } else {
    await db.insert(settings).values({
      key: "vat_rate",
      value: String(data.rate),
    });
  }

  // Upsert vat_mode
  const existingMode = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vat_mode"))
    .limit(1);

  if (existingMode.length > 0) {
    await db
      .update(settings)
      .set({ value: data.mode, updatedAt: new Date() })
      .where(eq(settings.key, "vat_mode"));
  } else {
    await db.insert(settings).values({
      key: "vat_mode",
      value: data.mode,
    });
  }

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.setup_completed",
    targetType: "settings",
    targetId: "vat",
    details: { action: "vat_settings_updated", rate: data.rate, mode: data.mode },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 3. Get Payment Settings
// ──────────────────────────────────────────────

export async function getPaymentSettings() {
  const { userId, role } = await requireAdmin();

  // Query all payment accounts
  const accounts = await db.select().from(paymentAccounts);

  // Query VAT settings
  const vatRateRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vat_rate"))
    .limit(1);

  const vatModeRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vat_mode"))
    .limit(1);

  return {
    paymentAccounts: accounts,
    vatRate: vatRateRow.length > 0 ? parseFloat(vatRateRow[0].value) : 0,
    vatMode: vatModeRow.length > 0 ? vatModeRow[0].value : "exclusive",
  };
}
