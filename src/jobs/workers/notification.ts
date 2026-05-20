/**
 * BullMQ notification worker.
 *
 * Processes jobs from the "notification" queue for async channel delivery
 * (WhatsApp, and future channels). Follows the exact pattern from
 * license-sync.ts with graceful Redis degradation.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/jobs/redis";

/**
 * Start the BullMQ worker for the notification queue.
 * Returns the Worker instance, or undefined if Redis is not available.
 *
 * Handles job types:
 * - "whatsapp-send": Processes WhatsApp notification delivery
 */
export function startNotificationWorker(): Worker | undefined {
  try {
    const worker = new Worker(
      "notification",
      async (job: Job) => {
        const { event, userId, notificationData } = job.data;

        if (job.name === "whatsapp-send") {
          await processWhatsAppSend(job, userId, event, notificationData);
        } else {
          console.warn(
            `[NotificationWorker] Unknown job name: ${job.name} (job ${job.id})`
          );
        }
      },
      {
        connection: redisConnection,
        concurrency: 5,
        limiter: { max: 10, duration: 1000 },
      }
    );

    worker.on("failed", (failedJob, err) => {
      console.error(
        `[NotificationWorker] Job ${failedJob?.id} failed: ${err.message}`
      );
    });

    worker.on("completed", (completedJob) => {
      console.log(`[NotificationWorker] Job ${completedJob.id} completed`);
    });

    console.log("[NotificationWorker] Worker started");
    return worker;
  } catch (error) {
    console.warn(
      "[NotificationWorker] Failed to start worker (Redis not available?):",
      error instanceof Error ? error.message : error
    );
    return undefined;
  }
}

/**
 * Process a WhatsApp send job.
 * Actual WhatsApp API integration is manual per D-03.
 * For now, log the attempt and mark as sent.
 */
async function processWhatsAppSend(
  job: Job,
  userId: string,
  event: string,
  _notificationData: Record<string, unknown>
): Promise<void> {
  // D-03: WhatsApp channel uses manual review for now.
  // Log the notification attempt; actual delivery wired when API is integrated.
  job.log(
    `WhatsApp notification: event=${event}, userId=${userId} (manual delivery pending)`
  );
}
