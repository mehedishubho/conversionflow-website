import { licenseSyncQueue, notificationQueue } from "@/jobs/queues";
import { startLicenseSyncWorker } from "@/jobs/workers/license-sync";
import { startNotificationWorker } from "@/jobs/workers/notification";

/**
 * Start background jobs: register schedulers and start workers.
 *
 * Called from Next.js instrumentation hook (src/instrumentation.ts).
 * All operations are wrapped in try/catch so startup never crashes.
 * Gracefully degrades when Redis is not available.
 */
export async function startJobs(): Promise<void> {
  try {
    // Guard: skip everything if Redis is not available
    if (!licenseSyncQueue) {
      console.warn("[Jobs] No Redis, skipping job scheduler registration");
      return;
    }

    // Register the 15-minute repeatable sync job using BullMQ upsertJobScheduler
    // This replaces the deprecated queue.add() with repeat option
    await licenseSyncQueue.upsertJobScheduler(
      "license-sync-cron",
      {
        every: 900000, // 15 minutes in milliseconds
      },
      {
        name: "license-sync",
        data: { type: "full_sync" },
        opts: {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
        },
      }
    );

    // Start the worker to process jobs from the license-sync queue
    startLicenseSyncWorker();

    console.log("[Jobs] License sync scheduler registered (every 15 min)");

    // Start the notification worker if the notification queue is available
    if (notificationQueue) {
      startNotificationWorker();
      console.log("[Jobs] Notification worker started");
    }
  } catch (error) {
    // Startup should never crash due to job registration failure
    console.error(
      "[Jobs] Failed to start background jobs:",
      error instanceof Error ? error.message : error
    );
  }
}
