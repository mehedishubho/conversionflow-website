/**
 * Products Domain Layer
 *
 * Exports domain entities and domain events
 * for the Products bounded context.
 */

export { Product } from "./entities/Product";
export { ProductVersion } from "./entities/ProductVersion";
export type { VersionStatus } from "./entities/ProductVersion";
export { ProductPlan } from "./entities/ProductPlan";
export type { LicenseType, BillingCycle } from "./entities/ProductPlan";
export { PRODUCT_EVENTS, createProductEvent } from "./events/ProductEvents";
