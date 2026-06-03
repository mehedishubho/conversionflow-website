/**
 * Deactivation Service - Shared deactivation logic
 *
 * Contains the core deactivation logic used by both DeactivateLicenseHandler
 * (public API) and the portal deactivation action. Ensures identical behavior:
 * atomic decrement, JSONB domain removal, activation history logging, and
 * event emission for cache invalidation.
 *
 * No code duplication between API route and portal action (D-29).
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ActivationRepository } from "@/modules/licensing/infrastructure/repositories/ActivationRepository";
import { Activation } from "@/modules/licensing/domain/entities/Activation";
import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import {
  LICENSE_EVENTS,
  createLicenseEvent,
} from "@/modules/licensing/domain/events/LicenseEvents";

export interface DeactivateResult {
  success: boolean;
  error?: string;
  currentActivations?: number;
  maxActivations?: number;
}

// Shared repository instances (matching handler pattern)
const licenseRepo = new LicenseRepository();
const activationRepo = new ActivationRepository();

/**
 * Perform deactivation of a domain from a license.
 *
 * This function is shared between the public API handler and the portal action.
 * Both paths must produce identical side effects:
 * 1. Atomic decrement of activation count + JSONB domain removal
 * 2. Insert into license_activations history table
 * 3. Publish LicenseDeactivated event for cache invalidation
 *
 * @param licenseId - UUID of the license
 * @param licenseKey - Raw license key value (for cache key derivation)
 * @param domain - Domain to deactivate (already normalized)
 * @param ipAddress - Client IP address (nullable)
 * @param userAgent - Client user agent (nullable)
 * @returns DeactivateResult with success status
 */
export async function performDeactivation(
  licenseId: string,
  licenseKey: string,
  domain: string,
  ipAddress: string | null = null,
  userAgent: string | null = null,
): Promise<DeactivateResult> {
  // 1. Atomic decrement + JSONB domain removal (D-16 inverse)
  const updated = await licenseRepo.atomicDecrement(licenseId, domain);
  if (!updated) {
    return { success: false, error: "DOMAIN_NOT_ACTIVE" };
  }

  // 2. Log to license_activations history
  await activationRepo.create(
    new Activation(
      "",
      licenseId,
      domain,
      "deactivate",
      ipAddress,
      userAgent,
      null, // No verification method for deactivation
      [], // No suspicious flags for deactivation
      new Date(),
    ),
  );

  // 3. Publish event for cache invalidation (D-20)
  await inProcessPublisher.publish(
    createLicenseEvent(LICENSE_EVENTS.LICENSE_DEACTIVATED, licenseId, {
      licenseId,
      licenseKey,
      domain,
      currentActivations: updated.currentActivations,
    }),
  );

  return {
    success: true,
    currentActivations: updated.currentActivations,
    maxActivations: updated.maxActivations,
  };
}
