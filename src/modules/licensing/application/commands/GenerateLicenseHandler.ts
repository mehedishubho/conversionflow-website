/**
 * GenerateLicenseHandler - Application command handler for license generation
 *
 * Used by Phase 16 admin manual license creation and Phase 17 checkout event handler.
 * Generates a LicenseKey via LicenseKeyGenerator, creates an API token via
 * ApiTokenGenerator, persists the license, and publishes LicenseCreated event.
 *
 * The plaintext API token is returned once and never stored -- only the SHA-256
 * hash is persisted to the database (D-06).
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { LicenseKeyGenerator } from "@/modules/licensing/domain/services/LicenseKeyGenerator";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { License } from "@/modules/licensing/domain/entities/License";
import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import {
  LICENSE_EVENTS,
  createLicenseEvent,
} from "@/modules/licensing/domain/events/LicenseEvents";

export interface GenerateInput {
  userId: string;
  productId: string;
  plan: string;
  maxActivations: number;
  expiresAt: Date | null;
  orderId?: string;
}

export interface GenerateResult {
  success: boolean;
  error?: string;
  license?: License;
  apiToken?: string;
}

export class GenerateLicenseHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Generate a new license with API token.
   *
   * Creates a cryptographically secure license key, generates an API token,
   * persists the license with the token hash, and publishes a domain event.
   *
   * @returns The plaintext API token is returned exactly once -- the caller
   *          must deliver it to the customer and never store it in plaintext.
   */
  static async execute(input: GenerateInput): Promise<GenerateResult> {
    try {
      // 1. Generate license key
      const key = LicenseKeyGenerator.generate();

      // 2. Generate API token (plaintext + hash)
      const { plaintext: apiToken, hash: apiTokenHash } = ApiTokenGenerator.generate();

      // 3. Create License entity
      const license = License.create({
        userId: input.userId,
        productId: input.productId,
        plan: input.plan,
        licenseKey: key.value,
        status: "active",
        activationDomains: [],
        maxActivations: input.maxActivations,
        currentActivations: 0,
        apiTokenHash,
        expiresAt: input.expiresAt,
        orderId: input.orderId ?? null,
      });

      // 4. Persist via repository
      const saved = await this.licenseRepo.create(license);

      // 5. Publish LicenseCreated event
      await inProcessPublisher.publish(
        createLicenseEvent(LICENSE_EVENTS.LICENSE_CREATED, saved.id, {
          licenseId: saved.id,
          licenseKey: key.value,
          userId: input.userId,
          productId: input.productId,
          plan: input.plan,
        }),
      );

      return {
        success: true,
        license: saved,
        apiToken,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to generate license",
      };
    }
  }
}
