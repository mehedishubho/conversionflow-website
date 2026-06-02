/**
 * Product Domain Events
 *
 * Defines event types and factory function for the Products bounded context.
 * Uses BaseEvent interface from Phase 14 shared infrastructure.
 */

import type { BaseEvent } from "@/shared/infrastructure/eventBus";
import { nanoid } from "nanoid";

/**
 * Product event type constants.
 * Used for event routing and handler registration.
 */
export const PRODUCT_EVENTS = {
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
  VERSION_CREATED: "product.version.created",
  VERSION_RELEASED: "product.version.released",
  PLAN_CREATED: "product.plan.created",
  PLAN_UPDATED: "product.plan.updated",
  PLAN_DELETED: "product.plan.deleted",
} as const;

/**
 * Create a product domain event.
 * @param type - Event type from PRODUCT_EVENTS
 * @param aggregateId - ID of the aggregate (product, version, or plan)
 * @param payload - Event-specific data
 * @returns BaseEvent ready for publishing
 */
export function createProductEvent(
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
    metadata: { source: "products-context", version: 1 },
  };
}
