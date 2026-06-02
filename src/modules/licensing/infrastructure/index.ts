/**
 * Licensing Infrastructure Layer - Barrel Export
 *
 * Exports repository implementations, mappers, and external service adapters
 * for the Licensing bounded context.
 */

// Repositories
export { LicenseRepository } from "./repositories/LicenseRepository";
export { ActivationRepository } from "./repositories/ActivationRepository";

// Mappers
export { LicenseMapper } from "./repositories/mappers/LicenseMapper";
export { ActivationMapper } from "./repositories/mappers/ActivationMapper";

// Adapters
export { RateLimiter } from "./adapters/RateLimiter";
export { DnsVerifier } from "./adapters/DnsVerifier";
export { HttpProofFetcher } from "./adapters/HttpProofFetcher";
export { ValidationCache } from "./adapters/ValidationCache";
export { SuspiciousFlagDetector } from "./adapters/SuspiciousFlagDetector";
export type { SuspiciousFlagContext } from "./adapters/SuspiciousFlagDetector";
