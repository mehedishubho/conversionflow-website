/**
 * OrderCompletedHandler - Event handler for OrderCompleted domain events
 *
 * Orchestrates the post-order-completion pipeline (D-01):
 * 1. Fetch order details from database
 * 2. Idempotency check — skip if license already exists for this order
 * 3. Resolve plan details (maxActivations, expiresAt) from ProductPlanRepository
 * 4. Generate license via GenerateLicenseHandler
 * 5. Create audit log entry
 * 6. Send confirmation email with license key
 *
 * Error handling (D-03, T-17-03):
 * - Email and audit failures are caught and logged — never block the main flow
 * - License generation failure is logged but does not throw
 */

import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { GenerateLicenseHandler } from "@/modules/licensing/application/commands/GenerateLicenseHandler";
import { ProductPlanRepository } from "@/modules/products/infrastructure/repositories/ProductPlanRepository";
import { db } from "@/lib/db";
import { orders, user, licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail } from "@/lib/emails/order-confirmation";

export class OrderCompletedHandler {
  private planRepo = new ProductPlanRepository();

  /**
   * Handle an OrderCompleted event.
   *
   * Orchestrates: plan resolution -> license generation -> audit -> email.
   * Idempotent: duplicate calls return existing license without error.
   */
  async handle(event: BaseEvent): Promise<void> {
    const { orderId, userId } = event.payload as {
      orderId: string;
      userId: string;
    };

    // 1. Fetch order from DB
    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderRows.length === 0) {
      console.error(
        `[Billing] OrderCompletedHandler: Order ${orderId} not found, skipping`,
      );
      return;
    }

    const order = orderRows[0];

    // 2. Idempotency check — query licenses by orderId
    const existingLicenses = await db
      .select()
      .from(licenses)
      .where(eq(licenses.orderId, orderId))
      .limit(1);

    let licenseKey: string | undefined;

    if (existingLicenses.length > 0) {
      // License already exists for this order — skip generation
      licenseKey = existingLicenses[0].licenseKey;
      console.log(
        `[Billing] OrderCompletedHandler: License already exists for order ${orderId}, key=${licenseKey}`,
      );
    } else {
      // 3. Resolve plan details
      const { maxActivations, expiresAt } = await this.resolvePlanDetails(
        order.productId,
        order.plan,
      );

      // 4. Generate license
      const result = await GenerateLicenseHandler.execute({
        userId,
        productId: order.productId,
        plan: order.plan,
        maxActivations,
        expiresAt,
        orderId,
      });

      if (result.success && result.license) {
        licenseKey = result.license.licenseKey;

        // 5. Create audit log
        try {
          await createAuditLog({
            action: "license.created",
            targetType: "license",
            targetId: result.license.id,
            details: {
              orderId,
              licenseKey: result.license.licenseKey,
              source: "order_completed_event",
            },
          });
        } catch (auditError) {
          console.error(
            `[Billing] OrderCompletedHandler: Audit log failed for order ${orderId}:`,
            auditError,
          );
        }
      } else {
        console.error(
          `[Billing] OrderCompletedHandler: License generation failed for order ${orderId}: ${result.error}`,
        );
      }
    }

    // 6. Send confirmation email (wrapped in try/catch — never blocks)
    try {
      const userRows = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (userRows.length > 0) {
        const orderUser = userRows[0];

        await sendOrderConfirmationEmail({
          to: orderUser.email,
          orderNumber: orderId.slice(0, 8),
          planName: order.plan,
          amount: order.amount,
          currency: order.currency,
          paymentMethod: order.paymentMethod ?? "unknown",
          licenseKey,
          status: "completed",
        });
      } else {
        console.error(
          `[Billing] OrderCompletedHandler: User ${userId} not found for email`,
        );
      }
    } catch (emailError) {
      console.error(
        `[Billing] OrderCompletedHandler: Email failed for order ${orderId}:`,
        emailError,
      );
    }
  }

  /**
   * Resolve maxActivations and expiresAt from the product plan.
   *
   * Falls back to safe defaults if plan not found (T-17-04):
   * - maxActivations = 1 (minimum, admin can fix)
   * - expiresAt = null (lifetime, no accidental expiration)
   */
  private async resolvePlanDetails(
    productId: string,
    planName: string,
  ): Promise<{ maxActivations: number; expiresAt: Date | null }> {
    const plan = await this.planRepo.findBySlug(
      productId,
      planName.toLowerCase(),
    );

    if (!plan) {
      console.warn(
        `[Billing] OrderCompletedHandler: Plan "${planName}" not found for product ${productId}, using safe defaults`,
      );
      return { maxActivations: 1, expiresAt: null };
    }

    const maxActivations = plan.maxActivations ?? 1;
    const expiresAt =
      plan.licenseType === "lifetime"
        ? null
        : new Date(
            Date.now() +
              (plan.billingDurationMonths ?? 12) *
                30 *
                24 *
                60 *
                60 *
                1000,
          );

    return { maxActivations, expiresAt };
  }
}

/**
 * Register billing event handlers with the central event registry.
 *
 * Call once at application startup to wire up the OrderCompleted handler.
 */
export function registerBillingHandlers(): void {
  // Import here to avoid circular dependency at module load time
  const { eventRegistry } = require("@/shared/infrastructure/eventBus/EventBus");
  const { ORDER_EVENTS } = require("../../domain/events/OrderEvents");

  const handler = new OrderCompletedHandler();
  eventRegistry.subscribe(ORDER_EVENTS.ORDER_COMPLETED, (event: BaseEvent) =>
    handler.handle(event),
  );

  console.log("[Billing] Registered OrderCompleted handler");
}
