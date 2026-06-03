/**
 * Order Domain Events
 *
 * Defines event types and factory function for the Billing bounded context.
 * Uses BaseEvent interface from Phase 14 shared infrastructure.
 * Follows the same pattern as Licensing context's LicenseEvents.
 */

import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { nanoid } from "nanoid";

/**
 * Order event type constants.
 * Used for event routing and handler registration.
 */
export const ORDER_EVENTS = {
  ORDER_COMPLETED: "order.completed",
} as const;

/**
 * Payload for the OrderCompleted event.
 * Minimal payload per D-02: handler queries DB for full details at processing time.
 */
export interface OrderCompletedPayload {
  orderId: string;
  userId: string;
}

/**
 * Create an order domain event.
 * @param type - Event type from ORDER_EVENTS
 * @param aggregateId - ID of the aggregate (order)
 * @param payload - Event-specific data (OrderCompletedPayload)
 * @returns BaseEvent ready for publishing
 */
export function createOrderEvent(
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
    metadata: { source: "billing-context", version: 1 },
  };
}
