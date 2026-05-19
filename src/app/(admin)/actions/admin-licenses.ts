"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, orders, user } from "@/lib/db/schema";
import { eq, isNull, desc, sql, inArray } from "drizzle-orm";
import { licenseSyncQueue } from "@/jobs/queues";
import { createAuditLog } from "@/lib/audit";
import type { ActivationDomain } from "@/lib/webhook-types";
import {
  evaluatePiracyTriggers,
  checkCrossSiteMatch,
  type PiracyFlag,
} from "@/lib/piracy-detection";

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

  const nowStr = now.toISOString();
  const sevenStr = sevenDaysFromNow.toISOString();
  const thirtyStr = thirtyDaysFromNow.toISOString();

  const [result] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'active')`,
      expired: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'expired')`,
      revoked: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'revoked')`,
      suspended: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'suspended')`,
      expiringSoon7d: sql<number>`COUNT(*) FILTER (WHERE ${licenses.expiresAt} <= ${sevenStr}::timestamptz AND ${licenses.expiresAt} > ${nowStr}::timestamptz AND ${licenses.status} = 'active')`,
      expiringSoon30d: sql<number>`COUNT(*) FILTER (WHERE ${licenses.expiresAt} <= ${thirtyStr}::timestamptz AND ${licenses.expiresAt} > ${sevenStr}::timestamptz AND ${licenses.status} = 'active')`,
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

// ──────────────────────────────────────────────
// 5. License Detail (D-06, D-07, D-08, LINT-02)
// ──────────────────────────────────────────────

export interface LicenseDetail {
  id: string;
  licenseKey: string;
  userId: string;
  userName: string | null;
  productId: string;
  plan: string;
  status: string;
  activationDomains: ActivationDomain[];
  maxActivations: number | null;
  currentActivations: number | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  centralLicenseId: string | null;
  orderId: string | null;
  centralOrderId: string | null;
  orderStatus: string | null;
  piracyFlags: PiracyFlag[];
}

export async function getLicenseDetail(
  id: string
): Promise<{ license: LicenseDetail } | { error: string }> {
  const { session } = await requireAdmin();

  const [row] = await db
    .select({
      id: licenses.id,
      licenseKey: licenses.licenseKey,
      userId: licenses.userId,
      userName: user.name,
      productId: licenses.productId,
      plan: licenses.plan,
      status: licenses.status,
      activationDomains: licenses.activationDomains,
      maxActivations: licenses.maxActivations,
      currentActivations: licenses.currentActivations,
      expiresAt: licenses.expiresAt,
      createdAt: licenses.createdAt,
      updatedAt: licenses.updatedAt,
      centralLicenseId: licenses.centralLicenseId,
      orderId: licenses.orderId,
      centralOrderId: orders.centralOrderId,
      orderStatus: orders.status,
    })
    .from(licenses)
    .leftJoin(user, eq(licenses.userId, user.id))
    .leftJoin(orders, eq(licenses.orderId, orders.id))
    .where(eq(licenses.id, id))
    .limit(1);

  if (!row) {
    return { error: "License not found. It may have been removed or the ID is invalid." };
  }

  // Cast jsonb to typed array (Drizzle jsonb does not enforce inner type)
  const domains = (row.activationDomains ?? []) as unknown as ActivationDomain[];

  // Evaluate piracy triggers (3 inline checks)
  const flags = evaluatePiracyTriggers({
    currentActivations: row.currentActivations ?? 0,
    maxActivations: row.maxActivations ?? 1,
    domains,
    licenseKey: row.licenseKey,
  });

  // Cross-site match detection (requires DB query)
  try {
    const crossSiteFlag = await checkCrossSiteMatch(db, domains, row.id, row.userId);
    if (crossSiteFlag) {
      flags.push(crossSiteFlag);
    }
  } catch (err) {
    // Cross-site check failure should not block detail page
    console.error("[LicenseDetail] Cross-site check failed:", err);
  }

  return {
    license: {
      id: row.id,
      licenseKey: row.licenseKey,
      userId: row.userId,
      userName: row.userName,
      productId: row.productId,
      plan: row.plan,
      status: row.status,
      activationDomains: domains,
      maxActivations: row.maxActivations,
      currentActivations: row.currentActivations,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      centralLicenseId: row.centralLicenseId,
      orderId: row.orderId,
      centralOrderId: row.centralOrderId,
      orderStatus: row.orderStatus,
      piracyFlags: flags,
    },
  };
}

// ──────────────────────────────────────────────
// 6. Piracy Flag Dismissal (D-05)
// ──────────────────────────────────────────────

export async function dismissPiracyFlag(
  licenseId: string,
  flagType: string
): Promise<{ success: boolean }> {
  const { userId, role } = await requireAdmin();

  // Dismissal is logged via audit trail -- flag is re-evaluated on next page load from live data
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "piracy.flag_dismissed",
    targetType: "license",
    targetId: licenseId,
    details: { licenseId, flagType, dismissedBy: userId },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 7. Suspend License (D-05)
// ──────────────────────────────────────────────

export async function suspendLicense(
  licenseId: string,
  reason: string
): Promise<{ success: boolean }> {
  const { userId, role } = await requireAdmin();

  // Get current status for audit trail
  const [current] = await db
    .select({ status: licenses.status })
    .from(licenses)
    .where(eq(licenses.id, licenseId))
    .limit(1);

  const previousStatus = current?.status ?? "unknown";

  await db
    .update(licenses)
    .set({ status: "suspended" })
    .where(eq(licenses.id, licenseId));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "license.status_changed",
    targetType: "license",
    targetId: licenseId,
    details: { from: previousStatus, to: "suspended", reason, suspendedBy: userId },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 8. Revoke License (D-05)
// ──────────────────────────────────────────────

export async function revokeLicense(
  licenseId: string,
  reason: string
): Promise<{ success: boolean }> {
  const { userId, role } = await requireAdmin();

  // Get current status for audit trail
  const [current] = await db
    .select({ status: licenses.status })
    .from(licenses)
    .where(eq(licenses.id, licenseId))
    .limit(1);

  const previousStatus = current?.status ?? "unknown";

  await db
    .update(licenses)
    .set({ status: "revoked" })
    .where(eq(licenses.id, licenseId));

  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "license.status_changed",
    targetType: "license",
    targetId: licenseId,
    details: { from: previousStatus, to: "revoked", reason, revokedBy: userId },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 9. Flagged Licenses (D-04, D-05, LINT-03)
// ──────────────────────────────────────────────

export interface FlaggedLicense {
  licenseId: string;
  licenseKey: string;
  userName: string | null;
  plan: string;
  status: string;
  flags: PiracyFlag[];
}

export async function getFlaggedLicenses(): Promise<FlaggedLicense[]> {
  await requireAdmin();

  // Only check active/suspended licenses -- expired/revoked are not piracy candidates
  const allLicenses = await db
    .select({
      id: licenses.id,
      licenseKey: licenses.licenseKey,
      userId: licenses.userId,
      userName: user.name,
      plan: licenses.plan,
      status: licenses.status,
      activationDomains: licenses.activationDomains,
      currentActivations: licenses.currentActivations,
      maxActivations: licenses.maxActivations,
    })
    .from(licenses)
    .leftJoin(user, eq(licenses.userId, user.id))
    .where(inArray(licenses.status, ["active", "suspended"]));

  const flagged: FlaggedLicense[] = [];

  for (const license of allLicenses) {
    const domains = (license.activationDomains ?? []) as unknown as ActivationDomain[];

    // Evaluate inline triggers
    const flags = evaluatePiracyTriggers({
      currentActivations: license.currentActivations ?? 0,
      maxActivations: license.maxActivations ?? 1,
      domains,
      licenseKey: license.licenseKey,
    });

    // Cross-site match check
    try {
      const crossSiteFlag = await checkCrossSiteMatch(db, domains, license.id, license.userId);
      if (crossSiteFlag) {
        flags.push(crossSiteFlag);
      }
    } catch {
      // Non-blocking: skip cross-site check on failure
    }

    if (flags.length > 0) {
      flagged.push({
        licenseId: license.id,
        licenseKey: license.licenseKey,
        userName: license.userName,
        plan: license.plan,
        status: license.status,
        flags,
      });
    }
  }

  return flagged;
}
