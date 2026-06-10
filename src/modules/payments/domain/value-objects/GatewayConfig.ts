/**
 * GatewayConfig - Value object for gateway configuration from DB
 *
 * Represents a decrypted gateway configuration record.
 * The config field is the decrypted JSONB from the payment_gateways table.
 */

/**
 * Gateway status following D-42 activation flow: Draft -> Test -> Live
 */
export type GatewayStatus = "draft" | "test" | "live";

/**
 * Full gateway configuration record from payment_gateways table.
 * Config is decrypted by GatewayConfigRepository before returning.
 */
export interface GatewayConfig {
  id: string;
  gatewayId: string;
  name: string;
  /** Decrypted gateway credentials and settings */
  config: Record<string, unknown>;
  active: boolean;
  testMode: boolean;
  status: GatewayStatus;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
