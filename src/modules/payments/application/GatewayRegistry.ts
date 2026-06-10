/**
 * GatewayRegistry - Singleton registry for payment gateway adapters (D-08)
 *
 * Gateway adapters register themselves at startup via module-init.ts.
 * New gateway = new adapter file + register call. Zero code changes to
 * checkout when adding a gateway.
 *
 * Pattern: Map<string, IPaymentGateway> keyed by gatewayId.
 */

import type { IPaymentGateway } from "../domain/IPaymentGateway";

export class GatewayRegistry {
  private static instance: GatewayRegistry;
  private adapters = new Map<string, IPaymentGateway>();

  private constructor() {}

  /**
   * Get the singleton instance of GatewayRegistry.
   */
  static getInstance(): GatewayRegistry {
    if (!GatewayRegistry.instance) {
      GatewayRegistry.instance = new GatewayRegistry();
    }
    return GatewayRegistry.instance;
  }

  /**
   * Register a gateway adapter.
   * Called during module initialization for each adapter.
   */
  register(adapter: IPaymentGateway): void {
    this.adapters.set(adapter.gatewayId, adapter);
  }

  /**
   * Get a specific gateway adapter by gatewayId.
   */
  get(gatewayId: string): IPaymentGateway | undefined {
    return this.adapters.get(gatewayId);
  }

  /**
   * Get all gateway adapters that support a given currency.
   * Used by checkout to filter available gateways based on selected currency.
   */
  getForCurrency(currency: string): IPaymentGateway[] {
    return Array.from(this.adapters.values()).filter((a) =>
      a.supportedCurrencies.includes(currency)
    );
  }

  /**
   * Get all registered gateway adapters.
   */
  getAll(): IPaymentGateway[] {
    return Array.from(this.adapters.values());
  }
}
