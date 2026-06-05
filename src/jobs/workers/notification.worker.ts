/**
 * Notification Queue Worker (D-13)
 *
 * Processes notification jobs from the BullMQ notification queue.
 * Currently reserved for admin broadcast and future direct-notification jobs.
 * Logs the job and returns for now.
 *
 * Follows the exact pattern from subscription-lifecycle.ts:
 * - Worker import, bullRedis guard, workerStarted flag
 * - worker.on("failed"/"completed") handlers
 */

import { Worker } from "bullmq";
import { bullRedis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/jobs/queues";

const QUEUE_NAME = QUEUE_NAMES.NOTIFICATION;
let workerStarted = false;

/**
 * Start the notification worker.
 * Safe to call multiple times (idempotent).
 * Requires Redis to be available.
 */
export function startNotificationWorker(): void {
  if (workerStarted) return;
  if (!bullRedis) {
    console.warn("[Notification] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      // Reserved for admin broadcast and future direct-notification jobs
      console.log(
        `[Notification] Processing job ${job.id}: ${job.name}`,
        job.data,
      );
    },
    {
      connection: bullRedis,
      concurrency: 1,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[Notification] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Notification] Job ${job?.id} completed`);
  });

  workerStarted = true;
  console.log("[Notification] Worker started");
}
