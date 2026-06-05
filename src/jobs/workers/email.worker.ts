/**
 * Email Queue Worker (D-13, D-14)
 *
 * Processes email jobs from the BullMQ email queue.
 * Sends emails via the unified EmailSender adapter and
 * updates notification_deliveries rows with delivery status.
 *
 * Follows the exact pattern from subscription-lifecycle.ts:
 * - Worker import, bullRedis guard, workerStarted flag
 * - worker.on("failed"/"completed") handlers
 */

import { Worker } from "bullmq";
import { bullRedis } from "@/lib/redis";
import { QUEUE_NAMES } from "@/jobs/queues";
import { db } from "@/lib/db";
import { notificationDeliveries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getEmailSender } from "@/modules/notifications/infrastructure/adapters/EmailSender";

const QUEUE_NAME = QUEUE_NAMES.EMAIL;
let workerStarted = false;

/**
 * Start the email worker.
 * Safe to call multiple times (idempotent).
 * Requires Redis to be available.
 */
export function startEmailWorker(): void {
  if (workerStarted) return;
  if (!bullRedis) {
    console.warn("[Email] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { to, subject, html, from, deliveryId } = job.data;

      // Get email adapter based on admin settings
      const sender = await getEmailSender();

      // Send the email
      const result = await sender.send({ to, subject, html, from });

      // Update delivery tracking row if deliveryId provided
      if (deliveryId) {
        if (result.error) {
          await db
            .update(notificationDeliveries)
            .set({
              status: "failed",
              error: result.error,
              attempts: job.attemptsMade + 1,
              updatedAt: new Date(),
            })
            .where(eq(notificationDeliveries.id, deliveryId));
        } else {
          await db
            .update(notificationDeliveries)
            .set({
              status: "sent",
              providerId: result.messageId,
              attempts: job.attemptsMade + 1,
              updatedAt: new Date(),
            })
            .where(eq(notificationDeliveries.id, deliveryId));
        }
      }

      // If there was an error, throw so BullMQ retries
      if (result.error) {
        throw new Error(result.error);
      }
    },
    {
      connection: bullRedis,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 },
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[Email] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Email] Job ${job?.id} completed`);
  });

  workerStarted = true;
  console.log("[Email] Worker started");
}
