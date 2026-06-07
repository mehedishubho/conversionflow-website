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
import { ProductRepository } from "@/modules/products/infrastructure/repositories/ProductRepository";
import { ExpiryCalculator } from "@/modules/licensing/application/services/ExpiryCalculator";
import { db } from "@/lib/db";
import { orders, user, licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail } from "@/lib/emails/order-confirmation";

export class OrderCompletedHandler {
  private planRepo = new ProductPlanRepository();
  private productRepo = new ProductRepository();

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

    console.log(`[Billing] OrderCompletedHandler: START — orderId=${orderId}, userId=${userId}`);

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
    console.log(`[Billing] OrderCompletedHandler: Found order — productId=${order.productId}, plan=${order.plan}, amount=${order.amount}`);

    // 2. Idempotency check — query licenses by orderId
    const existingLicenses = await db
      .select()
      .from(licenses)
      .where(eq(licenses.orderId, orderId))
      .limit(1);

    let licenseKey: string | undefined;
    let apiToken: string | undefined;

    if (existingLicenses.length > 0) {
      // License already exists for this order — skip generation
      licenseKey = existingLicenses[0].licenseKey;
      console.log(
        `[Billing] OrderCompletedHandler: License already exists for order ${orderId}, key=${licenseKey}`,
      );
    } else {
      // 3. Resolve plan details
      console.log(`[Billing] OrderCompletedHandler: Resolving plan — productId=${order.productId}, plan=${order.plan}`);
      const { maxActivations, expiresAt } = await this.resolvePlanDetails(
        order.productId,
        order.plan,
      );
      console.log(`[Billing] OrderCompletedHandler: Plan resolved — maxActivations=${maxActivations}, expiresAt=${expiresAt}`);

      // 4. Generate license
      const result = await GenerateLicenseHandler.execute({
        userId,
        productId: order.productId,
        plan: order.plan,
        maxActivations,
        expiresAt,
        orderId,
      });

      console.log(`[Billing] OrderCompletedHandler: Generate result — success=${result.success}, error=${result.error ?? 'none'}`);

      if (result.success && result.license) {
        licenseKey = result.license.licenseKey;
        apiToken = result.apiToken;

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
          apiToken,
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

    console.log(`[Billing] OrderCompletedHandler: COMPLETE — orderId=${orderId}, licenseKey=${licenseKey ?? 'NONE'}`);
  }

  /**
   * Resolve maxActivations and expiresAt from the product plan.
   *
   * Falls back to safe defaults if plan not found (T-17-04):
   * - maxActivations = 1 (minimum, admin can fix)
   * - expiresAt = null (lifetime, no accidental expiration)
   */
  private async resolvePlanDetails(
    productIdOrSlug: string,
    planName: string,
  ): Promise<{ maxActivations: number; expiresAt: Date | null }> {
    // productIdOrSlug may be a slug (e.g., "conversionflow-wp") since orders.productId is text.
    // ProductPlanRepository.findBySlug expects a UUID for productId.
    // Resolve: look up product by slug first, then use its UUID for the plan query.
    const product = await this.productRepo.findBySlug(productIdOrSlug);

    if (!product) {
      console.warn(
        `[Billing] OrderCompletedHandler: Product "${productIdOrSlug}" not found by slug, trying as UUID`,
      );
      // Fallback: try treating it as a UUID directly (in case it was already a UUID)
      return this.resolvePlanFromUUID(productIdOrSlug, planName);
    }

    return this.resolvePlanFromUUID(product.id, planName);
  }

  private async resolvePlanFromUUID(
    productUUID: string,
    planName: string,
  ): Promise<{ maxActivations: number; expiresAt: Date | null }> {
    const plan = await this.planRepo.findBySlug(
      productUUID,
      planName.toLowerCase(),
    );

    if (!plan) {
      console.warn(
        `[Billing] OrderCompletedHandler: Plan "${planName}" not found for product ${productUUID}, using safe defaults`,
      );
      return { maxActivations: 1, expiresAt: null };
    }

    const maxActivations = plan.maxActivations ?? 1;
    // Per D-14, D-17: Exact calendar date calculation instead of approximate 30-day months
    const expiresAt =
      plan.licenseType === "lifetime"
        ? null
        : ExpiryCalculator.calculateExpiry(
            new Date(),
            plan.billingCycle ?? "yearly",
            plan.billingDurationMonths,
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
  // Use inProcessSubscriber to match OrderService's inProcessPublisher (same pattern as licensing module)
  const { inProcessSubscriber } = require("@/shared/infrastructure/eventBus/EventBus");
  const { ORDER_EVENTS } = require("../../domain/events/OrderEvents");

  const handler = new OrderCompletedHandler();
  inProcessSubscriber.subscribe(ORDER_EVENTS.ORDER_COMPLETED, (event: BaseEvent) => {
    // Wrap async handler — EventEmitter.emit() doesn't await promises,
    // so unhandled rejections would be silently lost
    handler.handle(event).catch((err) => {
      console.error("[Billing] OrderCompletedHandler UNHANDLED ERROR:", err);
    });
  });

  console.log("[Billing] Registered OrderCompleted handler");
}
