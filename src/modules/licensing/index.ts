/**
 * Licensing Bounded Context - Module Entry Point
 *
 * Provides initialization function for registering event handlers
 * and exports all public domain types and services.
 */

// Domain exports
export { License } from "./domain/entities/License";
export { Activation, type ActivationAction, type VerificationMethod } from "./domain/entities/Activation";
export { LICENSE_EVENTS, createLicenseEvent } from "./domain/events/LicenseEvents";
export { LicenseKeyGenerator } from "./domain/services/LicenseKeyGenerator";
export { ApiTokenGenerator } from "./domain/services/ApiTokenGenerator";
export { VerificationTokenIssuer } from "./domain/services/VerificationTokenIssuer";
export { LicenseStateMachine } from "./domain/services/LicenseStateMachine";
export { ExpiryCalculator } from "./application/services/ExpiryCalculator";

// Application exports
export { ValidateLicenseHandler } from "./application/commands/ValidateLicenseHandler";
export { ActivateLicenseHandler } from "./application/commands/ActivateLicenseHandler";
export { DeactivateLicenseHandler } from "./application/commands/DeactivateLicenseHandler";
export { GenerateLicenseHandler } from "./application/commands/GenerateLicenseHandler";
export { performDeactivation } from "./application/commands/deactivationService";
export { GetActivationHistoryHandler } from "./application/queries/GetActivationHistoryHandler";
export { GetActiveDomainsHandler } from "./application/queries/GetActiveDomainsHandler";

// Infrastructure exports
export { LicenseRepository } from "./infrastructure/repositories/LicenseRepository";
export { ActivationRepository } from "./infrastructure/repositories/ActivationRepository";
export { RateLimiter } from "./infrastructure/adapters/RateLimiter";
export { ValidationCache } from "./infrastructure/adapters/ValidationCache";

/**
 * Initialize the licensing module.
 * Call once at application startup to register event handlers.
 *
 * Registers:
 * - Cache invalidation handlers for LicenseActivated/Deactivated/Revoked/Suspended events
 */
import { registerCacheInvalidationHandlers } from "./application/cacheInvalidation";

let initialized = false;

export function initializeLicensingModule(): void {
  if (initialized) return;

  // Register cache invalidation event handlers synchronously (D-20)
  // Static import ensures handlers are subscribed BEFORE any events fire.
  // cacheInvalidation.ts lives in the application layer with no circular deps
  // (it only imports from infrastructure/adapters and domain/events).
  registerCacheInvalidationHandlers();

  initialized = true;
  console.log("[Licensing] Module initialized with cache invalidation handlers");
}
