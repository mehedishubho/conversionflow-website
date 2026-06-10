/**
 * Payment Domain Events
 *
 * Defines event types and factory function for the Payments bounded context.
 * Follows the same pattern as Billing context's OrderEvents.
 */

import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { nanoid } from "nanoid";

/**
 * Payment event type constants.
 * Used for event routing and handler registration.
 */
export const PAYMENT_EVENTS = {
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_REFUNDED: "payment.refunded",
  PAYMENT_WEBHOOK_RECEIVED: "payment.webhook_received",
} as const;

/**
 * Payload for payment events.
 * Minimal payload: handlers query DB for full details at processing time.
 */
export interface PaymentEventPayload {
  orderId: string;
  userId: string;
  gatewayId: string;
  gatewayTransactionId?: string;
  amount?: number;
  currency?: string;
}

/**
 * Create a payment domain event.
 * @param type - Event type from PAYMENT_EVENTS
 * @param aggregateId - ID of the aggregate (order)
 * @param payload - Event-specific data (PaymentEventPayload)
 * @returns BaseEvent ready for publishing
 */
export function createPaymentEvent(
  type: string,
  aggregateId: string,
  payload: unknown,
): BaseEvent {
  return {
    id: nanoid(),
    type,
    aggregateId,
    payload,
    timestamp: new Date(),
    metadata: { source: "payments-context", version: 1 },
  };
}
