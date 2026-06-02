"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, licenseActivations, user } from "@/lib/db/schema";
import { eq, desc, ilike, and, or } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/admin/dashboard");
  return { session, userId: session.user.id, role };
}

export interface LicenseRow {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  productId: string;
  plan: string;
  licenseKey: string;
  status: string;
  activationDomains: string[] | null;
  maxActivations: number | null;
  currentActivations: number | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export async function getAdminLicenses(search?: string): Promise<LicenseRow[]> {
  await requireAdmin();

  const conditions = search
    ? or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(licenses.licenseKey, `%${search}%`),
        ilike(licenses.productId, `%${search}%`)
      )
    : undefined;

  const rows = await db
    .select({
      id: licenses.id,
      userId: licenses.userId,
      userName: user.name,
      userEmail: user.email,
      productId: licenses.productId,
      plan: licenses.plan,
      licenseKey: licenses.licenseKey,
      status: licenses.status,
      activationDomains: licenses.activationDomains,
      maxActivations: licenses.maxActivations,
      currentActivations: licenses.currentActivations,
      expiresAt: licenses.expiresAt,
      createdAt: licenses.createdAt,
    })
    .from(licenses)
    .leftJoin(user, eq(licenses.userId, user.id))
    .where(conditions ? and(conditions) : undefined)
    .orderBy(desc(licenses.createdAt));

  return rows.map((r) => ({
    ...r,
    activationDomains: (r.activationDomains as string[] | null) ?? null,
  }));
}

export async function revokeLicense(licenseId: string): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  try {
    const [existing] = await db
      .select({ id: licenses.id, status: licenses.status })
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .limit(1);

    if (!existing) return { error: "License not found" };
    if (existing.status === "revoked") return { error: "License already revoked" };

    await db
      .update(licenses)
      .set({ status: "revoked" })
      .where(eq(licenses.id, licenseId));

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "license.status_changed",
      targetType: "license",
      targetId: licenseId,
      details: { from: existing.status, to: "revoked" },
    });

    return { success: true };
  } catch {
    return { error: "Failed to revoke license" };
  }
}

export async function activateLicense(licenseId: string): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  try {
    const [existing] = await db
      .select({ id: licenses.id, status: licenses.status })
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .limit(1);

    if (!existing) return { error: "License not found" };
    if (existing.status === "active") return { error: "License already active" };

    await db
      .update(licenses)
      .set({ status: "active" })
      .where(eq(licenses.id, licenseId));

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "license.status_changed",
      targetType: "license",
      targetId: licenseId,
      details: { from: existing.status, to: "active" },
    });

    return { success: true };
  } catch {
    return { error: "Failed to activate license" };
  }
}

export async function suspendLicense(licenseId: string): Promise<{ success?: boolean; error?: string }> {
  const { session } = await requireAdmin();

  try {
    const [existing] = await db
      .select({ id: licenses.id, status: licenses.status })
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .limit(1);

    if (!existing) return { error: "License not found" };

    await db
      .update(licenses)
      .set({ status: "suspended" })
      .where(eq(licenses.id, licenseId));

    await createAuditLog({
      actorId: session.user.id,
      actorRole: "admin",
      action: "license.status_changed",
      targetType: "license",
      targetId: licenseId,
      details: { from: existing.status, to: "suspended" },
    });

    return { success: true };
  } catch {
    return { error: "Failed to suspend license" };
  }
}

/**
 * Get activation history for a specific license (D-30).
 * Returns chronological rows from license_activations.
 */
export async function getActivationHistory(
  licenseId: string,
  limit: number = 50,
  offset: number = 0,
) {
  await requireAdmin();

  const rows = await db
    .select()
    .from(licenseActivations)
    .where(eq(licenseActivations.licenseId, licenseId))
    .orderBy(desc(licenseActivations.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}

/**
 * Get license details for admin view.
 */
export async function getLicenseForAdmin(licenseId: string) {
  await requireAdmin();

  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.id, licenseId));

  return license ?? null;
}
