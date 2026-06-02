/**
 * Module Initialization
 *
 * Centralized initialization for all bounded context modules.
 * Called once at application startup to register event handlers,
 * background jobs, and other module-level side effects.
 */

import { initializeLicensingModule } from "@/modules/licensing";

/**
 * Initialize all application modules.
 *
 * Each module's initialization is idempotent (safe to call multiple times)
 * and registers its event handlers on the in-process event bus.
 *
 * Called from the root layout to ensure handlers are registered
 * before any requests are processed.
 */
export function initializeModules(): void {
  initializeLicensingModule();
}
