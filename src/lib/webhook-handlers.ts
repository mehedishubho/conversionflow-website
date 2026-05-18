/**
 * Webhook Event Handlers
 *
 * Four event-specific handler functions for processing license events
 * from the central licensing API. Each handler:
 * - Receives WebhookEventData parsed from the webhook payload
 * - Performs an idempotency check (find existing license, skip if in target state)
 * - Mutates the database using Drizzle ORM (parameterized queries)
 * - Creates an audit log entry via createAuditLog
 * - Never logs full license keys (truncate to first 8 chars)
 */

import { db } from "@/lib/db";
import { licenses, orders, licenseStatusEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import type { WebhookEventData } from "@/lib/webhook-types";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Truncate a license key to first 8 chars for safe logging.
 */
function maskKey(key: string): string {
  return key.slice(0, 8) + "...";
}

/**
 * Valid license status values from the database enum.
 */
const VALID_LICENSE_STATUSES = licenseStatusEnum.enumValues;

// ──────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────

/**
 * Handle license.created event.
 * Inserts a new license row. Idempotent: skips if centralLicenseId already exists.
 */
export async function handleLicenseCreated(
  data: WebhookEventData
): Promise<void> {
  try {
    // Idempotency: check if license already exists by centralLicenseId
    const existing = await db
      .select({ id: licenses.id })
      .from(licenses)
      .where(eq(licenses.centralLicenseId, data.centralLicenseId))
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `[Webhook] license.created: already exists for centralId=${data.centralLicenseId}, skipping`
      );
      return;
    }

    // Insert new license
    await db.insert(licenses).values({
      userId: data.userId,
      centralLicenseId: data.centralLicenseId,
      productId: data.productId,
      plan: data.plan,
      licenseKey: data.licenseKey,
      status: "active",
      activationDomains: data.activationDomains,
      currentActivations: data.currentActivations,
      maxActivations: data.maxActivations,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    await createAuditLog({
      actorId: "system",
      actorRole: "system/webhook",
      action: "license.created",
      targetType: "license",
      targetId: data.centralLicenseId,
      details: {
        licenseKey: maskKey(data.licenseKey),
        plan: data.plan,
        userId: data.userId,
      },
    });

    console.log(
      `[Webhook] license.created: ${maskKey(data.licenseKey)} for user ${data.userId}`
    );
  } catch (error) {
    console.error(
      `[Webhook] handleLicenseCreated failed for ${data.centralLicenseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle license.updated event.
 * Updates existing license fields. Skips if license not found.
 * Only updates status if the value is a valid enum member.
 */
export async function handleLicenseUpdated(
  data: WebhookEventData
): Promise<void> {
  try {
    const existing = await db
      .select({
        id: licenses.id,
        status: licenses.status,
      })
      .from(licenses)
      .where(eq(licenses.centralLicenseId, data.centralLicenseId))
      .limit(1);

    if (existing.length === 0) {
      console.warn(
        `[Webhook] license.updated: license not found for centralId=${data.centralLicenseId}, skipping`
      );
      return;
    }

    const license = existing[0];

    // Build update object - only include status if it's a valid enum value
    const updateData: Record<string, unknown> = {
      plan: data.plan,
      activationDomains: data.activationDomains,
      currentActivations: data.currentActivations,
      maxActivations: data.maxActivations,
    };

    if (data.expiresAt) {
      updateData.expiresAt = new Date(data.expiresAt);
    }

    // Validate status against enum before updating (T-06-03)
    if (
      data.status &&
      VALID_LICENSE_STATUSES.includes(
        data.status as (typeof VALID_LICENSE_STATUSES)[number]
      )
    ) {
      updateData.status = data.status;
    }

    await db
      .update(licenses)
      .set(updateData)
      .where(eq(licenses.id, license.id));

    await createAuditLog({
      actorId: "system",
      actorRole: "system/webhook",
      action: "license.updated",
      targetType: "license",
      targetId: data.centralLicenseId,
      details: {
        licenseKey: maskKey(data.licenseKey),
        plan: data.plan,
        statusFrom: license.status,
        statusTo: data.status,
      },
    });

    console.log(
      `[Webhook] license.updated: ${maskKey(data.licenseKey)}`
    );
  } catch (error) {
    console.error(
      `[Webhook] handleLicenseUpdated failed for ${data.centralLicenseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle license.expired event.
 * Sets status to "expired" if currently "active". Idempotent: skips if already expired.
 */
export async function handleLicenseExpired(
  data: WebhookEventData
): Promise<void> {
  try {
    const existing = await db
      .select({
        id: licenses.id,
        status: licenses.status,
      })
      .from(licenses)
      .where(eq(licenses.centralLicenseId, data.centralLicenseId))
      .limit(1);

    if (existing.length === 0) {
      console.warn(
        `[Webhook] license.expired: license not found for centralId=${data.centralLicenseId}, skipping`
      );
      return;
    }

    const license = existing[0];

    // Idempotency: skip if already expired
    if (license.status === "expired") {
      console.log(
        `[Webhook] license.expired: already expired for ${maskKey(data.licenseKey)}, skipping`
      );
      return;
    }

    await db
      .update(licenses)
      .set({ status: "expired" })
      .where(eq(licenses.id, license.id));

    await createAuditLog({
      actorId: "system",
      actorRole: "system/webhook",
      action: "license.status_changed",
      targetType: "license",
      targetId: data.centralLicenseId,
      details: {
        licenseKey: maskKey(data.licenseKey),
        from: license.status,
        to: "expired",
      },
    });

    console.log(
      `[Webhook] license.expired: ${maskKey(data.licenseKey)}`
    );
  } catch (error) {
    console.error(
      `[Webhook] handleLicenseExpired failed for ${data.centralLicenseId}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle license.payment_refunded event.
 * Sets license status to "revoked" and related order status to "refunded".
 */
export async function handlePaymentRefunded(
  data: WebhookEventData
): Promise<void> {
  try {
    const existing = await db
      .select({
        id: licenses.id,
        status: licenses.status,
        orderId: licenses.orderId,
      })
      .from(licenses)
      .where(eq(licenses.centralLicenseId, data.centralLicenseId))
      .limit(1);

    if (existing.length === 0) {
      console.warn(
        `[Webhook] license.payment_refunded: license not found for centralId=${data.centralLicenseId}, skipping`
      );
      return;
    }

    const license = existing[0];

    // Idempotency: skip if already revoked
    if (license.status === "revoked") {
      console.log(
        `[Webhook] license.payment_refunded: already revoked for ${maskKey(data.licenseKey)}, skipping`
      );
      return;
    }

    // Revoke the license
    await db
      .update(licenses)
      .set({ status: "revoked" })
      .where(eq(licenses.id, license.id));

    // Refund the related order if linked
    if (license.orderId) {
      await db
        .update(orders)
        .set({ status: "refunded" })
        .where(eq(orders.id, license.orderId));
    }

    await createAuditLog({
      actorId: "system",
      actorRole: "system/webhook",
      action: "license.status_changed",
      targetType: "license",
      targetId: data.centralLicenseId,
      details: {
        licenseKey: maskKey(data.licenseKey),
        from: license.status,
        to: "revoked",
        reason: data.refundReason || "payment_refunded",
        orderId: license.orderId,
      },
    });

    console.log(
      `[Webhook] license.payment_refunded: ${maskKey(data.licenseKey)} revoked`
    );
  } catch (error) {
    console.error(
      `[Webhook] handlePaymentRefunded failed for ${data.centralLicenseId}:`,
      error
    );
    throw error;
  }
}
