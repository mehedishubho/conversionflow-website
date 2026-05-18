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

export async function saveVATSettings(data: { rate: number; mode: "inclusive" | "exclusive"; enabled: boolean }) {
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

  // Upsert vat_enabled
  const existingEnabled = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vat_enabled"))
    .limit(1);

  if (existingEnabled.length > 0) {
    await db
      .update(settings)
      .set({ value: data.enabled ? "true" : "false", updatedAt: new Date() })
      .where(eq(settings.key, "vat_enabled"));
  } else {
    await db.insert(settings).values({
      key: "vat_enabled",
      value: data.enabled ? "true" : "false",
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

  const vatEnabledRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vat_enabled"))
    .limit(1);

  // Query SSL Commerce settings
  const sslStoreIdRow = await db.select().from(settings).where(eq(settings.key, "ssl_commerz_store_id")).limit(1);
  const sslPasswordRow = await db.select().from(settings).where(eq(settings.key, "ssl_commerz_store_password")).limit(1);
  const sslSandboxRow = await db.select().from(settings).where(eq(settings.key, "ssl_commerz_sandbox")).limit(1);
  const sslEnabledRow = await db.select().from(settings).where(eq(settings.key, "ssl_commerz_enabled")).limit(1);

  const sslDbStoreId = sslStoreIdRow[0]?.value ?? "";
  const sslDbPassword = sslPasswordRow[0]?.value ?? "";
  const sslDbSandbox = sslSandboxRow[0]?.value ?? "";

  return {
    paymentAccounts: accounts,
    vatRate: vatRateRow.length > 0 ? parseFloat(vatRateRow[0].value) : 0,
    vatMode: vatModeRow.length > 0 ? vatModeRow[0].value : "exclusive",
    vatEnabled: vatEnabledRow.length > 0 ? vatEnabledRow[0].value !== "false" : true,
    sslCommerzEnabled: sslEnabledRow.length > 0 ? sslEnabledRow[0].value !== "false" : true,
    sslCommerz: {
      storeIdConfigured: !!process.env.SSL_COMMERZ_STORE_ID && process.env.SSL_COMMERZ_STORE_ID !== "your_store_id",
      storePasswordConfigured: !!process.env.SSL_COMMERZ_STORE_PASSWORD && process.env.SSL_COMMERZ_STORE_PASSWORD !== "your_store_password",
      sandbox: process.env.SSL_COMMERZ_SANDBOX !== "false",
      storeId: sslDbStoreId,
      storePassword: sslDbPassword,
      dbSandbox: sslDbSandbox,
    },
    centralApi: {
      urlConfigured: !!process.env.CENTRAL_API_URL,
      keyConfigured: !!process.env.CENTRAL_API_KEY && process.env.CENTRAL_API_KEY !== "your_central_api_key",
    },
  };
}

// ──────────────────────────────────────────────
// 4. Save SSL Commerce Settings (to DB settings table)
// ──────────────────────────────────────────────

export async function saveSSLSettings(data: {
  storeId: string;
  storePassword: string;
  sandbox: boolean;
  enabled: boolean;
}) {
  const { userId, role } = await requireAdmin();

  const entries = [
    { key: "ssl_commerz_store_id", value: data.storeId },
    { key: "ssl_commerz_store_password", value: data.storePassword },
    { key: "ssl_commerz_sandbox", value: data.sandbox ? "true" : "false" },
    { key: "ssl_commerz_enabled", value: data.enabled ? "true" : "false" },
  ];

  for (const entry of entries) {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, entry.key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value: entry.value, updatedAt: new Date() })
        .where(eq(settings.key, entry.key));
    } else {
      await db.insert(settings).values({ key: entry.key, value: entry.value });
    }
  }

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.settings_updated",
    targetType: "settings",
    targetId: "ssl_commerz",
    details: { action: "ssl_commerz_settings_updated", sandbox: data.sandbox },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 5. Get SSL Commerce Settings (for gateway runtime)
// ──────────────────────────────────────────────

export async function getSSLSettings() {
  const rows = await db
    .select()
    .from(settings)
    .where(
      eq(settings.key, "ssl_commerz_store_id")
    );

  const passwordRows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "ssl_commerz_store_password"));

  const sandboxRows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "ssl_commerz_sandbox"));

  return {
    storeId: rows[0]?.value || process.env.SSL_COMMERZ_STORE_ID || "",
    storePassword: passwordRows[0]?.value || process.env.SSL_COMMERZ_STORE_PASSWORD || "",
    sandbox: sandboxRows[0]?.value !== "false" && (sandboxRows.length === 0 ? process.env.SSL_COMMERZ_SANDBOX !== "false" : true),
  };
}
