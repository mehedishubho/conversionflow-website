/**
 * Licensing Domain - Barrel Export
 *
 * Exports all entities, events, and services from the licensing domain layer.
 */

// Entities
export { License } from "./entities/License";
export { Activation } from "./entities/Activation";
export type { ActivationAction, VerificationMethod } from "./entities/Activation";

// Events
export { LICENSE_EVENTS, createLicenseEvent } from "./events/LicenseEvents";

// Services
export { LicenseKeyGenerator } from "./services/LicenseKeyGenerator";
export { ApiTokenGenerator } from "./services/ApiTokenGenerator";
export { VerificationTokenIssuer } from "./services/VerificationTokenIssuer";
