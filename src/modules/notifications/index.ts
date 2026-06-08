/**
 * Notifications Bounded Context - Module Entry Point
 *
 * Initializes the notification engine:
 * 1. Creates NotificationService and subscribes to EventBus events
 * 2. Starts the email BullMQ worker
 * 3. Starts the notification BullMQ worker
 *
 * Called from module-init.ts during application startup.
 */

import { NotificationService } from "./application/services/NotificationService";
import { startEmailWorker } from "@/jobs/workers/email.worker";
import { startNotificationWorker } from "@/jobs/workers/notification.worker";

let initialized = false;

/**
 * Initialize the notifications module.
 * Call once at application startup.
 * Idempotent — safe to call multiple times.
 */
export function initializeNotificationsModule(): void {
  if (initialized) return;

  // Create and initialize the notification service (subscribes to EventBus)
  const service = new NotificationService();
  service.initialize();

  // Start BullMQ workers for async processing
  startEmailWorker();
  startNotificationWorker();

  initialized = true;
}
