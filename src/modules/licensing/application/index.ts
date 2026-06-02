/**
 * Licensing Application Layer - Barrel Export
 *
 * Exports command handlers, query handlers, shared services,
 * and cache invalidation registration for the Licensing bounded context.
 */

// Command handlers
export { ValidateLicenseHandler } from "./commands/ValidateLicenseHandler";
export type { ValidateInput, ValidateResult } from "./commands/ValidateLicenseHandler";

export { ActivateLicenseHandler } from "./commands/ActivateLicenseHandler";
export type { ActivateInput, ActivateResult } from "./commands/ActivateLicenseHandler";

export { DeactivateLicenseHandler } from "./commands/DeactivateLicenseHandler";
export type { DeactivateInput, DeactivateHandlerResult } from "./commands/DeactivateLicenseHandler";

export { GenerateLicenseHandler } from "./commands/GenerateLicenseHandler";
export type { GenerateInput, GenerateResult } from "./commands/GenerateLicenseHandler";

export { performDeactivation } from "./commands/deactivationService";
export type { DeactivateResult } from "./commands/deactivationService";

// Query handlers
export { GetActivationHistoryHandler } from "./queries/GetActivationHistoryHandler";
export type { GetActivationHistoryInput } from "./queries/GetActivationHistoryHandler";

export { GetActiveDomainsHandler } from "./queries/GetActiveDomainsHandler";
export type { GetActiveDomainsInput, GetActiveDomainsResult } from "./queries/GetActiveDomainsHandler";

// Cache invalidation
export { registerCacheInvalidationHandlers } from "./cacheInvalidation";
