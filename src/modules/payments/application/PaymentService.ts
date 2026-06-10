/**
 * PaymentService - Orchestrates order creation + gateway session (D-41)
 *
 * Main application service for the Payments bounded context.
 * All payment flows converge through this service:
 *   Automatic: createPendingOrder -> initiatePayment -> [gateway] -> webhook -> completePaymentFromWebhook
 *   Manual: createPendingOrder -> [admin verify] -> completePaymentFromWebhook
 *
 * Both paths call OrderService.completeOrder() to finalize the order.
 */

import { GatewayRegistry } from "./GatewayRegistry";
import { OrderService } from "@/modules/billing/application/services/OrderService";
import { GatewayConfigRepository } from "../infrastructure/repositories/GatewayConfigRepository";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type {
  CreateSessionParams,
  CreateSessionResult,
  RefundParams,
  RefundResult,
} from "../domain/IPaymentGateway";
import { PaymentError } from "../domain/PaymentError";

export class PaymentService {
  private registry: GatewayRegistry;
  private orderService: OrderService;
  private configRepo: GatewayConfigRepository;

  constructor() {
    this.registry = GatewayRegistry.getInstance();
    this.orderService = new OrderService();
    this.configRepo = new GatewayConfigRepository();
  }

  /**
   * Create a pending order in the database.
   * Called by checkout action before delegating to a gateway.
   * Returns the orderId for use in gateway session creation.
   */
  async createPendingOrder(params: {
    userId: string;
    productId: string;
    plan: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    gatewayId: string;
    couponCode?: string;
    discountAmount?: number;
    taxAmount?: number;
  }): Promise<string> {
    const [order] = await db
      .insert(orders)
      .values({
        userId: params.userId,
        productId: params.productId,
        plan: params.plan,
        amount: params.amount,
        currency: params.currency,
        paymentMethod: params.paymentMethod,
        gatewayId: params.gatewayId,
        couponCode: params.couponCode,
        discountAmount: params.discountAmount,
        taxAmount: params.taxAmount,
        status: "pending",
      })
      .returning({ id: orders.id });

    return order.id;
  }

  /**
   * Initiate a payment through a specific gateway.
   * Gets the adapter, reads gateway config, calls createSession,
   * and updates the order with the gatewayTransactionId.
   */
  async initiatePayment(
    orderId: string,
    gatewayId: string,
    sessionParams: CreateSessionParams
  ): Promise<CreateSessionResult> {
    const adapter = this.registry.get(gatewayId);
    if (!adapter) {
      throw new PaymentError(
        "INVALID_CONFIG",
        `No gateway adapter registered for '${gatewayId}'`,
        gatewayId
      );
    }

    // Validate gateway config exists and is live
    const gatewayConfig = await this.configRepo.getByGatewayId(gatewayId);
    if (!gatewayConfig) {
      throw new PaymentError(
        "INVALID_CONFIG",
        `Gateway '${gatewayId}' is not configured`,
        gatewayId
      );
    }

    if (!gatewayConfig.active) {
      throw new PaymentError(
        "INVALID_CONFIG",
        `Gateway '${gatewayId}' is not active`,
        gatewayId
      );
    }

    // Create session with the gateway adapter
    const result = await adapter.createSession(sessionParams);

    // Update order with gateway transaction ID if available
    if (result.transactionId) {
      await db
        .update(orders)
        .set({
          gatewayTransactionId: result.transactionId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }

    return result;
  }

  /**
   * Complete a payment from webhook processing.
   * Called by webhook routes after the adapter verifies the payment.
   * This is the convergence point for all payment flows (D-41).
   */
  async completePaymentFromWebhook(
    orderId: string,
    userId: string
  ): Promise<void> {
    await this.orderService.completeOrder(orderId, userId);
  }

  /**
   * Process a refund through a specific gateway.
   * Gets the adapter, calls processRefund, and updates order status.
   */
  async refundPayment(
    orderId: string,
    gatewayId: string,
    params: RefundParams
  ): Promise<RefundResult> {
    const adapter = this.registry.get(gatewayId);
    if (!adapter) {
      throw new PaymentError(
        "INVALID_CONFIG",
        `No gateway adapter registered for '${gatewayId}'`,
        gatewayId
      );
    }

    const result = await adapter.processRefund(params);

    if (result.success) {
      await db
        .update(orders)
        .set({
          status: "refunded",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }

    return result;
  }

  /**
   * Test the connection to a gateway by validating its current config.
   * Used by the "Test Connection" button in admin UI (D-30).
   */
  async testConnection(gatewayId: string): Promise<boolean> {
    const adapter = this.registry.get(gatewayId);
    if (!adapter) {
      return false;
    }

    const config = await this.configRepo.getConfig(gatewayId);
    if (!config) {
      return false;
    }

    return adapter.validateConfig(config);
  }
}
