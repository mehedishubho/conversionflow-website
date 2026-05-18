"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, orders, user } from "@/lib/db/schema";
import { eq, isNull, desc, sql } from "drizzle-orm";
import { licenseSyncQueue } from "@/jobs/queues";
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

export interface LicenseKPIs {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  suspended: number;
  expiringSoon7d: number;
  expiringSoon30d: number;
  activationRate: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
}

export interface LicenseRow {
  id: string;
  licenseKey: string;
  userName: string | null;
  plan: string;
  status: string;
  currentActivations: number | null;
  maxActivations: number | null;
  createdAt: Date;
  expiresAt: Date | null;
  centralLicenseId: string | null;
  orderId: string | null;
  syncError: string | null;
}

// ──────────────────────────────────────────────
// 1. License KPIs (LINT-01, D-01, D-02)
// ──────────────────────────────────────────────

export async function getLicenseKPIs(): Promise<LicenseKPIs> {
  await requireAdmin();

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [result] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'active')`,
      expired: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'expired')`,
      revoked: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'revoked')`,
      suspended: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'suspended')`,
      expiringSoon7d: sql<number>`COUNT(*) FILTER (WHERE ${licenses.expiresAt} <= ${sevenDaysFromNow} AND ${licenses.expiresAt} > ${now} AND ${licenses.status} = 'active')`,
      expiringSoon30d: sql<number>`COUNT(*) FILTER (WHERE ${licenses.expiresAt} <= ${thirtyDaysFromNow} AND ${licenses.expiresAt} > ${sevenDaysFromNow} AND ${licenses.status} = 'active')`,
      unused: sql<number>`COUNT(*) FILTER (WHERE ${licenses.currentActivations} = 0)`,
    })
    .from(licenses);

  const total = Number(result.total);
  const unused = Number(result.unused);
  const activationRate = total > 0 ? Math.round(((total - unused) / total) * 100) : 0;

  return {
    total,
    active: Number(result.active),
    expired: Number(result.expired),
    revoked: Number(result.revoked),
    suspended: Number(result.suspended),
    expiringSoon7d: Number(result.expiringSoon7d),
    expiringSoon30d: Number(result.expiringSoon30d),
    activationRate,
  };
}

// ──────────────────────────────────────────────
// 2. Plan Distribution (D-01)
// ──────────────────────────────────────────────

export async function getPlanDistribution(): Promise<PlanDistribution[]> {
  await requireAdmin();

  const rows = await db
    .select({
      plan: licenses.plan,
      count: sql<number>`COUNT(*)`,
    })
    .from(licenses)
    .groupBy(licenses.plan)
    .orderBy(desc(sql`COUNT(*)`));

  return rows.map((r) => ({
    plan: r.plan,
    count: Number(r.count),
  }));
}

// ──────────────────────────────────────────────
// 3. License Listing with Filter (D-03, D-09)
// ──────────────────────────────────────────────

export async function getLicenses(
  filter: "all" | "flagged" | "sync_failures" = "all"
): Promise<LicenseRow[]> {
  await requireAdmin();

  if (filter === "sync_failures") {
    // Find licenses where the associated order has no central mapping
    const rows = await db
      .select({
        id: licenses.id,
        licenseKey: licenses.licenseKey,
        userName: user.name,
        plan: licenses.plan,
        status: licenses.status,
        currentActivations: licenses.currentActivations,
        maxActivations: licenses.maxActivations,
        createdAt: licenses.createdAt,
        expiresAt: licenses.expiresAt,
        centralLicenseId: licenses.centralLicenseId,
        orderId: licenses.orderId,
        orderCentralId: orders.centralOrderId,
      })
      .from(licenses)
      .leftJoin(user, eq(licenses.userId, user.id))
      .leftJoin(orders, eq(licenses.orderId, orders.id))
      .where(isNull(orders.centralOrderId))
      .orderBy(desc(licenses.createdAt));

    return rows.map((r) => ({
      id: r.id,
      licenseKey: r.licenseKey,
      userName: r.userName,
      plan: r.plan,
      status: r.status,
      currentActivations: r.currentActivations,
      maxActivations: r.maxActivations,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      centralLicenseId: r.centralLicenseId,
      orderId: r.orderId,
      syncError: r.orderCentralId ? null : "Missing central order mapping",
    }));
  }

  // Default: all licenses (or flagged -- flagged is a placeholder until Plan 04 piracy detection)
  const rows = await db
    .select({
      id: licenses.id,
      licenseKey: licenses.licenseKey,
      userName: user.name,
      plan: licenses.plan,
      status: licenses.status,
      currentActivations: licenses.currentActivations,
      maxActivations: licenses.maxActivations,
      createdAt: licenses.createdAt,
      expiresAt: licenses.expiresAt,
      centralLicenseId: licenses.centralLicenseId,
      orderId: licenses.orderId,
    })
    .from(licenses)
    .leftJoin(user, eq(licenses.userId, user.id))
    .orderBy(desc(licenses.createdAt));

  return rows.map((r) => ({
    ...r,
    syncError: null,
  }));
}

// ──────────────────────────────────────────────
// 4. Sync Retry (D-09)
// ──────────────────────────────────────────────

export async function retryLicenseSync(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId, role } = await requireAdmin();

  if (!licenseSyncQueue) {
    return { success: false, error: "Job queue not available (Redis not configured)" };
  }

  await licenseSyncQueue.add(
    "single-retry",
    { type: "single_retry", orderId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  );

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "license.sync_retry",
    targetType: "order",
    targetId: orderId,
    details: { orderId },
  });

  return { success: true };
}
