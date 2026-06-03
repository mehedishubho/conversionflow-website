/**
 * License Domain Events
 *
 * Defines event types and factory function for the Licensing bounded context.
 * Uses BaseEvent interface from Phase 14 shared infrastructure.
 */

import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { nanoid } from "nanoid";

/**
 * License event type constants.
 * Used for event routing and handler registration.
 */
export const LICENSE_EVENTS = {
  LICENSE_CREATED: "license.created",
  LICENSE_REVOKED: "license.revoked",
  LICENSE_SUSPENDED: "license.suspended",
  LICENSE_ACTIVATED: "license.activated",
  LICENSE_DEACTIVATED: "license.deactivated",
  LICENSE_GRACE_PERIOD_STARTED: "license.grace_period_started",
  LICENSE_EXPIRED: "license.expired",
  LICENSE_TRANSFERRED: "license.transferred",
} as const;

/**
 * Create a license domain event.
 * @param type - Event type from LICENSE_EVENTS
 * @param aggregateId - ID of the aggregate (license)
 * @param payload - Event-specific data
 * @returns BaseEvent ready for publishing
 */
export function createLicenseEvent(
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
    metadata: { source: "licensing-context", version: 1 },
  };
}
