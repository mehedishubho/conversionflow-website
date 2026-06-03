/**
 * Billing Domain Layer
 *
 * Exports domain models, value objects, and domain services
 * for the Billing bounded context.
 */

export { ORDER_EVENTS, createOrderEvent } from "./events/OrderEvents";
export type { OrderCompletedPayload } from "./events/OrderEvents";
