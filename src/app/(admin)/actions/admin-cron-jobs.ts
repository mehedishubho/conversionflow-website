"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";
import {
  subscriptionQueue,
  analyticsQueue,
  backupQueue,
} from "@/jobs/queues";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Auth guard (local — same pattern as admin-webhooks.ts)
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  return { session, userId: session.user.id, role };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CronJobInfo {
  id: string;
  name: string;
  description: string;
  cronPattern: string;
  cronHuman: string;
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  status: "idle" | "running" | "failed";
}

// ---------------------------------------------------------------------------
// Static job definitions
// ---------------------------------------------------------------------------

interface JobDefinition {
  id: string;
  name: string;
  description: string;
  defaultCron: string;
  cronHuman: string;
  queueKey: "subscriptionQueue" | "analyticsQueue" | "backupQueue";
}

const JOB_DEFINITIONS: JobDefinition[] = [
  {
    id: "subscription-lifecycle",
    name: "Subscription Lifecycle",
    description:
      "Processes license expirations, grace periods, and reminder emails",
    defaultCron: "0 2 * * *",
    cronHuman: "Daily at 2:00 AM UTC",
    queueKey: "subscriptionQueue",
  },
  {
    id: "analytics-aggregation",
    name: "Analytics Aggregation",
    description: "Pre-aggregates license analytics and enriches geo-IP data",
    defaultCron: "0 1 * * *",
    cronHuman: "Daily at 1:00 AM UTC",
    queueKey: "analyticsQueue",
  },
  {
    id: "backup",
    name: "Scheduled Backup",
    description: "Creates database backup and enforces retention policy",
    defaultCron: "0 2 * * *",
    cronHuman: "Configurable (see backup settings)",
    queueKey: "backupQueue",
  },
];

/** Interval label → cron (mirrors backup-worker's intervalToCron) */
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

function intervalToHuman(interval: string): string {
  switch (interval) {
    case "every_6_hours":
      return "Every 6 hours";
    case "daily":
      return "Daily at 2:00 AM UTC";
    case "weekly":
      return "Weekly on Sunday 3:00 AM UTC";
    case "monthly":
      return "Monthly on the 1st at 4:00 AM UTC";
    default:
      return "Not configured";
  }
}

// ---------------------------------------------------------------------------
// Helper: get queue from definition key
// ---------------------------------------------------------------------------

function getQueue(key: JobDefinition["queueKey"]) {
  const queues: Record<string, typeof subscriptionQueue> = {
    subscriptionQueue,
    analyticsQueue,
    backupQueue,
  };
  return queues[key];
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

export async function getCronJobs(): Promise<{
  jobs: CronJobInfo[];
  redisAvailable: boolean;
}> {
  await requireAdmin();

  // Check if any queue is available (they all require the same Redis)
  const redisAvailable =
    subscriptionQueue !== null &&
    analyticsQueue !== null &&
    backupQueue !== null;

  if (!redisAvailable) {
    // Return static metadata when Redis is not configured
    return {
      jobs: JOB_DEFINITIONS.map((def) => ({
        id: def.id,
        name: def.name,
        description: def.description,
        cronPattern: def.id === "backup" ? "N/A" : def.defaultCron,
        cronHuman:
          def.id === "backup"
            ? "Configure in backup settings"
            : def.cronHuman,
        enabled: false,
        lastRunAt: null,
        nextRunAt: null,
        status: "idle" as const,
      })),
      redisAvailable: false,
    };
  }

  const jobs: CronJobInfo[] = [];

  for (const def of JOB_DEFINITIONS) {
    const queue = getQueue(def.queueKey)!;

    // Get repeatable jobs for schedule info
    const repeatable = await queue.getRepeatableJobs();
    const matching = repeatable.find(
      (r) =>
        r.id === `${def.id}-daily` ||
        r.id === "subscription-daily" ||
        r.id === "analytics-daily" ||
        r.id === "backup-scheduled",
    );

    // Get job counts for status
    const counts = await queue.getJobCounts("active", "failed");
    const hasActive = counts.active > 0;
    const hasFailed = counts.failed > 0;

    // For backup, read actual cron from settings
    let cronPattern = def.defaultCron;
    let cronHuman = def.cronHuman;
    let enabled = !!matching;

    if (def.id === "backup") {
      const intervalRow = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "backup_interval"))
        .limit(1);

      const interval =
        intervalRow.length > 0 ? intervalRow[0].value : "disabled";
      enabled = interval !== "disabled";

      if (enabled) {
        cronPattern = intervalToCron(interval);
        cronHuman = intervalToHuman(interval);
      } else {
        cronPattern = "Disabled";
        cronHuman = "Disabled — configure in backup settings";
      }
    }

    // Get last run time from the most recent completed job
    let lastRunAt: Date | null = null;
    try {
      const completed = await queue.getCompleted(0, 0);
      if (completed.length > 0 && completed[0].finishedOn) {
        lastRunAt = new Date(completed[0].finishedOn);
      }
    } catch {
      // Best-effort — leave as null
    }

    jobs.push({
      id: def.id,
      name: def.name,
      description: def.description,
      cronPattern,
      cronHuman,
      enabled,
      lastRunAt,
      nextRunAt: matching?.next ? new Date(matching.next) : null,
      status: hasActive ? "running" : hasFailed ? "failed" : "idle",
    });
  }

  return { jobs, redisAvailable: true };
}

export async function triggerCronJob(
  jobId: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await requireAdmin();

  try {
    switch (jobId) {
      case "subscription-lifecycle": {
        const { triggerSubscriptionCheck } = await import(
          "@/jobs/workers/subscription-lifecycle"
        );
        const result = await triggerSubscriptionCheck();
        if (!result.success) return { success: false, error: result.error };
        break;
      }
      case "analytics-aggregation": {
        const { triggerAnalyticsAggregation } = await import(
          "@/jobs/workers/analytics-aggregation"
        );
        const result = await triggerAnalyticsAggregation();
        if (!result.success) return { success: false, error: result.error };
        break;
      }
      case "backup": {
        const { triggerBackupJob } = await import(
          "@/jobs/workers/backup-worker"
        );
        const result = await triggerBackupJob();
        if (!result.success) return { success: false, error: result.error };
        break;
      }
      default:
        return { success: false, error: `Unknown job: ${jobId}` };
    }

    await createAuditLog({
      actorId: userId,
      actorRole: "admin",
      action: "cron.job_triggered",
      targetType: "cron_job",
      targetId: jobId,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[CronJobs] Trigger failed for ${jobId}:`, message);
    return { success: false, error: message };
  }
}

export async function toggleCronJob(
  jobId: string,
  enabled: boolean,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await requireAdmin();

  try {
    switch (jobId) {
      case "subscription-lifecycle": {
        const queue = subscriptionQueue;
        if (!queue) return { success: false, error: "Redis not available" };

        if (enabled) {
          const { scheduleSubscriptionJob } = await import(
            "@/jobs/workers/subscription-lifecycle"
          );
          await scheduleSubscriptionJob();
        } else {
          const existing = await queue.getRepeatableJobs();
          for (const job of existing) {
            await queue.removeRepeatableByKey(job.key);
          }
        }
        break;
      }
      case "analytics-aggregation": {
        const queue = analyticsQueue;
        if (!queue) return { success: false, error: "Redis not available" };

        if (enabled) {
          const { scheduleAnalyticsJob } = await import(
            "@/jobs/workers/analytics-aggregation"
          );
          await scheduleAnalyticsJob();
        } else {
          const existing = await queue.getRepeatableJobs();
          for (const job of existing) {
            await queue.removeRepeatableByKey(job.key);
          }
        }
        break;
      }
      case "backup": {
        // Backup enable/disable is managed via the backup_interval setting
        const interval = enabled ? "daily" : "disabled";
        await db
          .insert(settings)
          .values({ key: "backup_interval", value: interval })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: interval },
          });

        // Re-schedule (or remove) the backup job
        const { scheduleBackupJob } = await import(
          "@/jobs/workers/backup-worker"
        );
        await scheduleBackupJob();
        break;
      }
      default:
        return { success: false, error: `Unknown job: ${jobId}` };
    }

    await createAuditLog({
      actorId: userId,
      actorRole: "admin",
      action: enabled ? "cron.job_enabled" : "cron.job_disabled",
      targetType: "cron_job",
      targetId: jobId,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[CronJobs] Toggle failed for ${jobId}:`, message);
    return { success: false, error: message };
  }
}
