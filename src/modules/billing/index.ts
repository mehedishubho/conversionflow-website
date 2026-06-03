/**
 * Billing Bounded Context
 *
 * Public API for the Billing module.
 * This is the only entry point for other modules to import Billing functionality.
 */

export { registerBillingHandlers } from "./application/handlers/OrderCompletedHandler";
export * from "./domain";
export * from "./infrastructure";
