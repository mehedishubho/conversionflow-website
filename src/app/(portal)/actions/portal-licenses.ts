"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { VerificationTokenIssuer } from "@/modules/licensing/domain/services/VerificationTokenIssuer";
import { performDeactivation } from "@/modules/licensing/application/commands/deactivationService";

async function requireCustomer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role === "admin" || role === "super_admin" || role === "support_staff") {
    throw new Error("Admin cannot perform portal actions");
  }
  return session;
}

/**
 * Deactivate a domain from a license (D-29: instant, no admin approval).
 * Uses performDeactivation() shared service function (also used by DeactivateLicenseHandler)
 * for atomic decrement, JSONB removal, history logging, event emission, and cache invalidation.
 */
export async function deactivateDomain(licenseId: string, domain: string) {
  const session = await requireCustomer();
  const userId = session.user.id;

  // Verify license ownership (IDOR protection - T-16-14)
  const [license] = await db
    .select()
    .from(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.userId, userId)));

  if (!license) return { success: false, error: "License not found" };

  const normalizedDomain = domain.toLowerCase().trim();
  const domains = (license.activationDomains ?? []) as string[];

  if (!domains.includes(normalizedDomain)) {
    return { success: false, error: "Domain not activated" };
  }

  // Delegate to shared performDeactivation (no API token needed -- customer is session-authenticated)
  const result = await performDeactivation(
    licenseId,
    license.licenseKey,
    normalizedDomain,
  );

  return { success: result.success, error: result.error };
}

/**
 * Issue a verification token for domain activation.
 * Customer calls this before placing the token in DNS/file/meta.
 */
export async function issueVerificationToken(
  licenseId: string,
  domain: string,
) {
  const session = await requireCustomer();
  const userId = session.user.id;

  // Verify license ownership (IDOR protection - T-16-15)
  const [license] = await db
    .select({ id: licenses.id, userId: licenses.userId })
    .from(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.userId, userId)));

  if (!license) return { success: false, error: "License not found" };

  const normalizedDomain = domain.toLowerCase().trim();
  const token = await VerificationTokenIssuer.issue(licenseId, normalizedDomain);

  return { success: true, token };
}
