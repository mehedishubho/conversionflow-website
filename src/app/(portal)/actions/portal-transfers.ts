"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { licenses, settings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { TransferLicenseHandler } from "@/modules/licensing/application/commands/TransferLicenseHandler";
import { TransferRepository } from "@/modules/licensing/infrastructure/repositories/TransferRepository";

async function requireCustomer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

/**
 * Generate a transfer code for a license.
 * Customer-facing server action with IDOR protection (T-19-04, T-19-08).
 */
export async function generateTransferCode(licenseId: string) {
  const session = await requireCustomer();
  const userId = session.user.id;

  // Verify license ownership (IDOR protection - T-19-04)
  const [license] = await db
    .select({ id: licenses.id, userId: licenses.userId })
    .from(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.userId, userId)));

  if (!license) return { error: "License not found or not owned by you." };

  // Fetch transfer limit from settings (default 1)
  const settingsRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "max_transfers_per_month"))
    .limit(1);
  const maxTransfersPerMonth = settingsRow.length > 0
    ? parseInt(settingsRow[0].value, 10) || 1
    : 1;

  const handler = new TransferLicenseHandler();
  return handler.generateCode(licenseId, userId, maxTransfersPerMonth);
}

/**
 * Claim a transfer code to receive a license.
 * Customer-facing server action (T-19-05, T-19-07, T-19-08).
 */
export async function claimTransferCode(code: string) {
  const session = await requireCustomer();
  const userId = session.user.id;

  const handler = new TransferLicenseHandler();
  return handler.claimCode(code, userId);
}

/**
 * Get transfer history for a specific license.
 * IDOR protection: verifies the user owns the license or is a transfer party.
 */
export async function getTransferHistory(licenseId: string) {
  const session = await requireCustomer();
  const userId = session.user.id;

  // Verify license ownership (IDOR protection - T-19-08)
  const [license] = await db
    .select({ id: licenses.id, userId: licenses.userId })
    .from(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.userId, userId)));

  if (!license) return { error: "License not found or not owned by you." };

  const transferRepo = new TransferRepository();
  const transfers = await transferRepo.findByUserId(userId);

  // Filter to only transfers for this license
  return transfers.filter((t: any) => t.licenseId === licenseId);
}
