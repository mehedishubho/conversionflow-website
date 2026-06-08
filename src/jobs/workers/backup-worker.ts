/**
 * Backup Worker
 *
 * Per D-09: BullMQ repeatable job with configurable cron patterns.
 * Processes scheduled database backups and enforces retention policy.
 */

import { Worker } from "bullmq";
import { bullRedis } from "@/lib/redis";
import { backupQueue } from "@/jobs/queues";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BackupService } from "@/lib/backup/BackupService";
import { BackupRotation } from "@/lib/backup/BackupRotation";

const QUEUE_NAME = "backup";
let workerStarted = false;

/** Interval to cron pattern mapping (per D-09) */
function intervalToCron(interval: string): string {
  switch (interval) {
    case "every_6_hours":
      return "0 */6 * * *";
    case "daily":
      return "0 2 * * *";
    case "weekly":
      return "0 3 * * 0";
    case "monthly":
      return "0 4 1 * *";
    default:
      return "0 2 * * *";
  }
}

/** Get backup interval from settings */
async function getBackupInterval(): Promise<string> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "backup_interval"))
    .limit(1);
  return row.length > 0 ? row[0].value : "disabled";
}

/** Process a scheduled backup */
async function processScheduledBackup(): Promise<void> {
  const backupService = new BackupService();
  const result = await backupService.createBackup("scheduled", "system");

  if (result.success) {
    const rotator = new BackupRotation();
    await rotator.enforceRetention();
  }
}

/** Schedule the backup repeatable job (per D-09) */
export async function scheduleBackupJob(): Promise<void> {
  if (!backupQueue) {
    console.warn(
      "[Backup] Queue not available, skipping job scheduling"
    );
    return;
  }

  const interval = await getBackupInterval();
  if (interval === "disabled") {
    // Remove existing repeatable job if interval is disabled
    try {
      const existingJobs = await backupQueue.getRepeatableJobs();
      for (const job of existingJobs) {
        await backupQueue.removeRepeatableByKey(job.key);
      }
    } catch {
      // Best-effort cleanup
    }
    console.log("[Backup] Scheduling disabled, removed existing repeatable jobs");
    return;
  }

  // Remove old repeatable jobs before scheduling new one
  try {
    const existingJobs = await backupQueue.getRepeatableJobs();
    for (const job of existingJobs) {
      await backupQueue.removeRepeatableByKey(job.key);
    }
  } catch {
    // Best-effort cleanup
  }

  const cronPattern = intervalToCron(interval);

  await backupQueue.add(
    "backup-scheduled",
    { runAt: new Date().toISOString() },
    {
      repeat: { pattern: cronPattern },
      jobId: "backup-scheduled",
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 },
    }
  );

  console.log(`[Backup] Scheduled job with cron: ${cronPattern}`);
}

/** Start the worker to process backup jobs */
export function startBackupWorker(): void {
  if (workerStarted) return;
  if (!bullRedis) {
    console.warn("[Backup] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      await processScheduledBackup();
    },
    {
      connection: bullRedis,
      concurrency: 1,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Backup] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Backup] Job ${job?.id} completed`);
  });

  workerStarted = true;
  console.log("[Backup] Worker started");
}

/**
 * Manually trigger a backup (admin use).
 * Returns a summary for verification.
 */
export async function triggerBackupJob(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await processScheduledBackup();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Backup] Manual trigger failed:", message);
    return { success: false, error: message };
  }
}
