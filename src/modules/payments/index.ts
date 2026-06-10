/**
 * Payments Bounded Context
 *
 * Public API for the Payments module.
 * This is the only entry point for other modules to import Payments functionality.
 *
 * Module initialization registers gateway adapters in the GatewayRegistry.
 * Adapters are registered in Plans 02/03/04 (SSL Commerz, Paddle, bKash).
 */

import { GatewayRegistry } from "./application/GatewayRegistry";

/**
 * Initialize the Payments module.
 *
 * Adapters register themselves when imported.
 * Individual adapter files are imported here.
 * For Phase 34 Plan 01, only the registry is initialized.
 * Adapter registration happens in Plans 02/03/04.
 */
export function initializePaymentsModule(): void {
  const registry = GatewayRegistry.getInstance();
  // Adapters will be registered here in Plans 02-04:
  // registry.register(new SSLCommerzAdapter());
  // registry.register(new PaddleAdapter());
  // registry.register(new BKashAdapter());
  console.log("[Payments] Module initialized (adapters register in Plans 02-04)");
}

// Re-export public API
export { GatewayRegistry } from "./application/GatewayRegistry";
export { PaymentService } from "./application/PaymentService";
export type { IPaymentGateway } from "./domain/IPaymentGateway";
export { PaymentError } from "./domain/PaymentError";
