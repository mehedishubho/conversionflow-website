/**
 * Module Initialization
 *
 * Centralized initialization for all bounded context modules.
 * Called once at application startup to register event handlers,
 * background jobs, and other module-level side effects.
 */

import { initializeLicensingModule } from "@/modules/licensing";
import { registerBillingHandlers } from "@/modules/billing";
import { initializeNotificationsModule } from "@/modules/notifications";
import { startSubscriptionWorker, scheduleSubscriptionJob } from "@/jobs/workers/subscription-lifecycle";
import { startBackupWorker, scheduleBackupJob } from "@/jobs/workers/backup-worker";

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
  registerBillingHandlers();
  initializeNotificationsModule();

  // Register subscription lifecycle worker (D-10: BullMQ in same process)
  startSubscriptionWorker();
  scheduleSubscriptionJob().catch((err) => {
    console.error("[ModuleInit] Failed to schedule subscription job:", err);
  });

  // Register backup worker (Phase 21)
  startBackupWorker();
  scheduleBackupJob().catch((err) => {
    console.error("[ModuleInit] Failed to schedule backup job:", err);
  });
}
