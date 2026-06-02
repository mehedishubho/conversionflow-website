/**
 * DeactivateLicenseHandler - Application command handler for domain deactivation
 *
 * Public API handler that authenticates the request, then delegates
 * to the shared performDeactivation() service.
 *
 * Auth check: API token validation (constant-time comparison, D-05/D-06).
 * Business logic: delegated to deactivationService.ts (no duplication).
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { performDeactivation } from "./deactivationService";

export interface DeactivateInput {
  licenseKey: string;
  apiToken: string;
  domain: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface DeactivateResult {
  success: boolean;
  error?: string;
  licenseId?: string;
  plan?: string;
  expiresAt?: Date | null;
  maxActivations?: number;
  currentActivations?: number;
}

export class DeactivateLicenseHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Execute license deactivation for a domain.
   *
   * Authenticates the request via API token, then delegates to performDeactivation().
   */
  static async execute(input: DeactivateInput): Promise<DeactivateResult> {
    // 1. Parse and validate license key
    let key: LicenseKey;
    try {
      key = LicenseKey.create(input.licenseKey);
    } catch {
      return { success: false, error: "INVALID_LICENSE" };
    }

    const domain = input.domain.toLowerCase().trim();

    // 2. Look up license
    const license = await this.licenseRepo.findByKey(key.value);
    if (!license) return { success: false, error: "INVALID_LICENSE" };

    // 3. Validate API token (constant-time, per D-05/D-06)
    if (!license.apiTokenHash || !ApiTokenGenerator.validate(input.apiToken, license.apiTokenHash)) {
      return { success: false, error: "INVALID_LICENSE" };
    }

    // 4. Delegate to shared deactivation service
    const result = await performDeactivation(
      license.id,
      key.value,
      domain,
      input.ipAddress,
      input.userAgent,
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      licenseId: license.id,
      plan: license.plan,
      expiresAt: license.expiresAt,
      maxActivations: result.maxActivations,
      currentActivations: result.currentActivations,
    };
  }
}
