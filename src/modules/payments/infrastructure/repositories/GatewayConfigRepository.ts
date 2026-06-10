/**
 * GatewayConfigRepository - Drizzle repository for payment_gateways table
 *
 * Handles CRUD operations for gateway configurations with automatic
 * encryption/decryption of the config JSONB column.
 */

import { db } from "@/lib/db";
import { paymentGateways } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encryptConfig, decryptConfig } from "../crypto";
import type { GatewayConfig } from "../../domain/value-objects/GatewayConfig";

export class GatewayConfigRepository {
  /**
   * Get decrypted config object for a gateway.
   * Returns just the config JSON, not the full record.
   */
  async getConfig(gatewayId: string): Promise<Record<string, unknown> | null> {
    const row = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.gatewayId, gatewayId))
      .limit(1);

    if (!row.length) return null;

    const configStr = row[0].config as string;
    return JSON.parse(decryptConfig(configStr));
  }

  /**
   * Save gateway config. Encrypts the config and upserts the row.
   * Creates a new row if gatewayId doesn't exist, updates otherwise.
   */
  async saveConfig(
    gatewayId: string,
    config: Record<string, unknown>,
    name?: string
  ): Promise<void> {
    const encryptedConfig = encryptConfig(JSON.stringify(config));

    const existing = await db
      .select({ id: paymentGateways.id })
      .from(paymentGateways)
      .where(eq(paymentGateways.gatewayId, gatewayId))
      .limit(1);

    if (existing.length) {
      await db
        .update(paymentGateways)
        .set({
          config: encryptedConfig,
          ...(name !== undefined && { name }),
          updatedAt: new Date(),
        })
        .where(eq(paymentGateways.gatewayId, gatewayId));
    } else {
      await db.insert(paymentGateways).values({
        gatewayId,
        name: name || gatewayId,
        config: encryptedConfig,
      });
    }
  }

  /**
   * Get all active gateways with decrypted configs.
   */
  async getActiveGateways(): Promise<GatewayConfig[]> {
    const rows = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.active, true));

    return rows.map((row) => ({
      id: row.id,
      gatewayId: row.gatewayId,
      name: row.name,
      config: JSON.parse(decryptConfig(row.config as string)),
      active: row.active ?? false,
      testMode: row.testMode ?? true,
      status: row.status ?? "draft",
      priority: row.priority ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  /**
   * Get full gateway record by gatewayId with decrypted config.
   */
  async getByGatewayId(gatewayId: string): Promise<GatewayConfig | null> {
    const rows = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.gatewayId, gatewayId))
      .limit(1);

    if (!rows.length) return null;

    const row = rows[0];
    return {
      id: row.id,
      gatewayId: row.gatewayId,
      name: row.name,
      config: JSON.parse(decryptConfig(row.config as string)),
      active: row.active ?? false,
      testMode: row.testMode ?? true,
      status: row.status ?? "draft",
      priority: row.priority ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Update gateway status (Draft -> Test -> Live flow, D-42).
   */
  async updateStatus(
    gatewayId: string,
    status: "draft" | "test" | "live"
  ): Promise<void> {
    await db
      .update(paymentGateways)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentGateways.gatewayId, gatewayId));
  }

  /**
   * Toggle gateway active state.
   */
  async toggleActive(gatewayId: string, active: boolean): Promise<void> {
    await db
      .update(paymentGateways)
      .set({ active, updatedAt: new Date() })
      .where(eq(paymentGateways.gatewayId, gatewayId));
  }

  /**
   * Toggle gateway test mode.
   */
  async toggleTestMode(gatewayId: string, testMode: boolean): Promise<void> {
    await db
      .update(paymentGateways)
      .set({ testMode, updatedAt: new Date() })
      .where(eq(paymentGateways.gatewayId, gatewayId));
  }
}
