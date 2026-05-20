/**
 * License expiry check scheduler.
 *
 * BullMQ repeatable job that runs daily to detect licenses expiring
 * within 14 days. For each expiring license, sends a notification
 * to the license owner. Deduplicates against notification_log to
 * avoid sending repeated alerts for the same license in the same
 * expiry window.
 */

import { db } from "@/lib/db";
import { licenses, notificationLog } from "@/lib/db/schema";
import { and, gte, lte, eq, sql } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";
import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "@/jobs/redis";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const EXPIRY_WINDOW_DAYS = 14;
const QUEUE_NAME = "license-expiry-check";

// ──────────────────────────────────────────────
// Scheduler Registration
// ──────────────────────────────────────────────

/**
 * Register the daily license expiry check as a BullMQ repeatable job.
 * Returns the Queue instance, or undefined if Redis is not available.
 */
export function registerLicenseExpiryCheck(): Queue | undefined {
  try {
    if (!process.env.REDIS_URL) {
      console.warn("[LicenseExpiry] No Redis URL, skipping scheduler registration");
      return undefined;
    }

    const queue = new Queue(QUEUE_NAME, { connection: redisConnection });

    // Register daily repeatable job (every 24 hours)
    queue.upsertJobScheduler(
      "license-expiry-daily",
      {
        every: 86400000, // 24 hours in milliseconds
      },
      {
        name: "check-expiring-licenses",
        data: { type: "daily_check" },
        opts: {
          attempts: 3,
          backoff: { type: "exponential", delay: 10000 },
        },
      }
    );

    // Also register the worker inline since this is a lightweight check
    const worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        if (job.data.type === "daily_check") {
          await checkExpiringLicenses();
        }
      },
      {
        connection: redisConnection,
        concurrency: 1,
      }
    );

    worker.on("failed", (failedJob: Job | undefined, err: Error) => {
      console.error(
        `[LicenseExpiry] Job ${failedJob?.id} failed: ${err.message}`
      );
    });

    worker.on("completed", (completedJob: Job) => {
      console.log(`[LicenseExpiry] Job ${completedJob.id} completed`);
    });

    console.log("[LicenseExpiry] Scheduler registered (daily check)");
    return queue;
  } catch (error) {
    console.warn(
      "[LicenseExpiry] Failed to start scheduler (Redis not available?):",
      error instanceof Error ? error.message : error
    );
    return undefined;
  }
}

// ──────────────────────────────────────────────
// Core Logic
// ──────────────────────────────────────────────

/**
 * Query active licenses expiring within the next 14 days
 * and send notifications (deduped against notification_log).
 */
export async function checkExpiringLicenses(): Promise<void> {
  const now = new Date();
  const windowEnd = new Date();
  windowEnd.setDate(now.getDate() + EXPIRY_WINDOW_DAYS);

  // Find active licenses with an expiresAt date within the window
  const expiringLicenses = await db
    .select()
    .from(licenses)
    .where(
      and(
        eq(licenses.status, "active"),
        gte(licenses.expiresAt, now),
        lte(licenses.expiresAt, windowEnd)
      )
    );

  if (expiringLicenses.length === 0) {
    console.log("[LicenseExpiry] No expiring licenses found");
    return;
  }

  console.log(
    `[LicenseExpiry] Found ${expiringLicenses.length} expiring license(s)`
  );

  let notified = 0;
  let skipped = 0;

  for (const license of expiringLicenses) {
    // Dedup check: skip if we already sent an expiring_soon notification
    // for this license in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const existingNotification = await db
      .select({ id: notificationLog.id })
      .from(notificationLog)
      .where(
        and(
          eq(notificationLog.userId, license.userId),
          eq(notificationLog.event, "license.expiring_soon"),
          gte(notificationLog.createdAt, sevenDaysAgo),
          sql`${notificationLog.status} != 'failed'`
        )
      )
      .limit(1);

    if (existingNotification.length > 0) {
      skipped++;
      continue;
    }

    // Calculate days remaining
    const expiresAt = license.expiresAt!;
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    try {
      await sendNotification(license.userId, "license.expiring_soon", {
        licenseKey: license.licenseKey,
        productName: license.productId,
        planName: license.plan,
        daysRemaining,
        expiresAt: expiresAt.toISOString(),
      });
      notified++;
    } catch (notifError) {
      console.error(
        `[LicenseExpiry] Failed to notify user ${license.userId} for license ${license.id}:`,
        notifError instanceof Error ? notifError.message : notifError
      );
    }
  }

  console.log(
    `[LicenseExpiry] Check complete: ${notified} notified, ${skipped} skipped (already notified)`
  );
}
