/**
 * Payments Bounded Context
 *
 * Public API for the Payments module.
 * This is the only entry point for other modules to import Payments functionality.
 *
 * Module initialization registers gateway adapters in the GatewayRegistry.
 * Adapters: SSL Commerz (Plan 02), Paddle (Plan 03), bKash (Plan 04).
 */

import { GatewayRegistry } from "./application/GatewayRegistry";
import { SSLCommerzAdapter } from "./infrastructure/adapters/SSLCommerzAdapter";
import { PaddleAdapter } from "./infrastructure/adapters/PaddleAdapter";
import { BKashAdapter } from "./infrastructure/adapters/BKashAdapter";

/**
 * Initialize the Payments module.
 *
 * Registers all gateway adapters in the GatewayRegistry.
 * Each adapter implements IPaymentGateway and handles its own
 * session creation, webhook processing, and credential management.
 */
export function initializePaymentsModule(): void {
  const registry = GatewayRegistry.getInstance();

  // Register SSL Commerz adapter (Plan 02)
  registry.register(new SSLCommerzAdapter());

  // Register Paddle adapter (Plan 03)
  registry.register(new PaddleAdapter());

  // Register bKash API adapter (Plan 04)
  registry.register(new BKashAdapter());

  console.log("[Payments] SSLCommerzAdapter + PaddleAdapter + BKashAdapter registered");
}

// Re-export public API
export { GatewayRegistry } from "./application/GatewayRegistry";
export { PaymentService } from "./application/PaymentService";
export type { IPaymentGateway } from "./domain/IPaymentGateway";
export { PaymentError } from "./domain/PaymentError";
