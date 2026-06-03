/**
 * Subscription Lifecycle Worker
 *
 * Per D-08: Single combined daily worker handles all subscription tasks.
 * Per D-09: Processes all licenses in one query + loop.
 * Per D-11: BullMQ repeatable job with cron pattern.
 * Per D-12: Auto-retry with exponential backoff.
 * Per D-13: Continue on partial failure.
 */

import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { subscriptionQueue } from "@/jobs/queues";
import { db } from "@/lib/db";
import { settings, licenseReminders, licenses, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { LicenseStateMachine } from "@/modules/licensing/domain/services/LicenseStateMachine";
import { LICENSE_EVENTS, createLicenseEvent } from "@/modules/licensing/domain/events/LicenseEvents";
import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import { ValidationCache } from "@/modules/licensing/infrastructure/adapters/ValidationCache";
import { sendLicenseExpiryReminderEmail } from "@/lib/emails/license-expiry-reminder";
import { sendGracePeriodEmail } from "@/lib/emails/license-grace-period";
import { sendLicenseExpiredEmail } from "@/lib/emails/license-expired";

const QUEUE_NAME = "subscription-lifecycle";
const DEFAULT_GRACE_PERIOD_DAYS = 7;
const DEFAULT_REMINDER_MILESTONES = [30, 14, 7, 3, 1];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

let workerStarted = false;

/** Fetch subscription settings from settings table */
async function getSubscriptionSettings(): Promise<{
  gracePeriodDays: number;
  reminderMilestones: number[];
}> {
  const [graceRow, milestonesRow] = await Promise.all([
    db
      .select()
      .from(settings)
      .where(eq(settings.key, "grace_period_days"))
      .limit(1),
    db
      .select()
      .from(settings)
      .where(eq(settings.key, "reminder_milestones"))
      .limit(1),
  ]);

  const gracePeriodDays = (() => {
    if (graceRow.length > 0) {
      const v = parseInt(graceRow[0].value, 10);
      if (!isNaN(v) && v >= 7 && v <= 30) return v;
    }
    return DEFAULT_GRACE_PERIOD_DAYS;
  })();

  const reminderMilestones = (() => {
    if (milestonesRow.length > 0) {
      const parsed = milestonesRow[0].value
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
      if (parsed.length > 0) return parsed.sort((a, b) => b - a);
    }
    return DEFAULT_REMINDER_MILESTONES;
  })();

  return { gracePeriodDays, reminderMilestones };
}

/** Check if a reminder has already been sent for this license+milestone (D-21) */
async function hasReminderBeenSent(
  licenseId: string,
  milestone: string,
): Promise<boolean> {
  const rows = await db
    .select()
    .from(licenseReminders)
    .where(
      and(
        eq(licenseReminders.licenseId, licenseId),
        eq(licenseReminders.milestone, milestone),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

/** Record a sent reminder for dedup tracking (D-21) */
async function recordReminder(
  licenseId: string,
  milestone: string,
): Promise<void> {
  await db.insert(licenseReminders).values({
    licenseId,
    milestone,
  });
}

/** Mask license key for email display */
function maskLicenseKey(key: string): string {
  if (key.length <= 8) return key + "***";
  return key.substring(0, 8) + "***";
}

/** Main processing function */
async function processDailySubscriptionCheck(): Promise<void> {
  const now = new Date();
  const { gracePeriodDays, reminderMilestones } =
    await getSubscriptionSettings();
  const licenseRepo = new LicenseRepository();

  // Find all licenses that could need processing (D-09, D-16)
  const maxMilestone = Math.max(...reminderMilestones);
  const expiringLicenses = await licenseRepo.findExpiringLicenses(maxMilestone);

  console.log(
    `[Subscription] Processing ${expiringLicenses.length} licenses (grace=${gracePeriodDays}d, milestones=[${reminderMilestones}])`,
  );

  for (const license of expiringLicenses) {
    try {
      if (!license.expiresAt) continue; // D-16: skip lifetime

      // Fetch user email for this license
      const userRows = await db
        .select()
        .from(user)
        .where(eq(user.id, license.userId))
        .limit(1);
      if (userRows.length === 0) continue;
      const licenseUser = userRows[0];

      const msPerDay = 24 * 60 * 60 * 1000;
      const graceEnd = new Date(
        license.expiresAt.getTime() + gracePeriodDays * msPerDay,
      );

      if (license.expiresAt <= now) {
        // License is past its expires_at timestamp
        if (license.status === "active" && now <= graceEnd) {
          // D-23: active -> grace_period (validated by state machine)
          LicenseStateMachine.transition("active", "grace_period");
          const transitioned = await licenseRepo.updateStatus(
            license.id,
            "active",
            "grace_period",
          );
          if (transitioned) {
            // Send grace period entry email (D-06)
            try {
              if (
                !(await hasReminderBeenSent(license.id, "grace_entered"))
              ) {
                await sendGracePeriodEmail({
                  to: licenseUser.email,
                  licenseKey: maskLicenseKey(license.licenseKey),
                  planName: license.plan,
                  expiresAt: license.expiresAt,
                  gracePeriodEndsAt: graceEnd,
                  appUrl: APP_URL,
                });
                await recordReminder(license.id, "grace_entered");
              }
            } catch (emailErr) {
              console.error(
                `[Subscription] Grace email failed for license ${license.id}:`,
                emailErr,
              );
            }

            // Publish event (D-28, D-29)
            try {
              await inProcessPublisher.publish(
                createLicenseEvent(
                  LICENSE_EVENTS.LICENSE_GRACE_PERIOD_STARTED,
                  license.id,
                  {
                    previousStatus: "active",
                    newStatus: "grace_period",
                    expiresAt: license.expiresAt,
                    gracePeriodEndsAt: graceEnd,
                  },
                ),
              );
            } catch (eventErr) {
              console.error(
                `[Subscription] Event publish failed for license ${license.id}:`,
                eventErr,
              );
            }

            // Invalidate cache
            try {
              await ValidationCache.invalidateAll(license.licenseKey);
            } catch {}
          }
        } else if (
          (license.status === "grace_period" && now > graceEnd) ||
          (license.status === "active" && now > graceEnd)
        ) {
          // D-23: grace_period -> expired OR active -> expired (past grace, validated by state machine)
          const fromStatus = license.status;
          if (fromStatus !== "active" && fromStatus !== "grace_period") continue;
          LicenseStateMachine.transition(fromStatus, "expired");
          const transitioned = await licenseRepo.updateStatus(
            license.id,
            fromStatus,
            "expired",
          );
          if (transitioned) {
            // Send expired email (D-20)
            try {
              if (!(await hasReminderBeenSent(license.id, "expired"))) {
                await sendLicenseExpiredEmail({
                  to: licenseUser.email,
                  licenseKey: maskLicenseKey(license.licenseKey),
                  planName: license.plan,
                  expiresAt: license.expiresAt,
                  appUrl: APP_URL,
                });
                await recordReminder(license.id, "expired");
              }
            } catch (emailErr) {
              console.error(
                `[Subscription] Expired email failed for license ${license.id}:`,
                emailErr,
              );
            }

            // Publish event (D-28, D-29)
            try {
              await inProcessPublisher.publish(
                createLicenseEvent(LICENSE_EVENTS.LICENSE_EXPIRED, license.id, {
                  previousStatus: fromStatus,
                  newStatus: "expired",
                  expiresAt: license.expiresAt,
                }),
              );
            } catch (eventErr) {
              console.error(
                `[Subscription] Event publish failed for license ${license.id}:`,
                eventErr,
              );
            }

            // Invalidate cache
            try {
              await ValidationCache.invalidateAll(license.licenseKey);
            } catch {}
          }
        }
      } else {
        // Not yet expired -- check reminder milestones (D-18, D-19)
        const daysUntilExpiry = Math.ceil(
          (license.expiresAt.getTime() - now.getTime()) / msPerDay,
        );

        for (const milestone of reminderMilestones) {
          if (daysUntilExpiry <= milestone) {
            const milestoneStr = String(milestone);
            if (!(await hasReminderBeenSent(license.id, milestoneStr))) {
              try {
                await sendLicenseExpiryReminderEmail({
                  to: licenseUser.email,
                  licenseKey: maskLicenseKey(license.licenseKey),
                  planName: license.plan,
                  daysUntilExpiry,
                  expiresAt: license.expiresAt,
                  appUrl: APP_URL,
                });
                await recordReminder(license.id, milestoneStr);
              } catch (emailErr) {
                console.error(
                  `[Subscription] Reminder email failed for license ${license.id} milestone ${milestone}:`,
                  emailErr,
                );
              }
            }
          }
        }
      }
    } catch (err) {
      // D-13: Continue on partial failure
      console.error(
        `[Subscription] Error processing license ${license.id}:`,
        err,
      );
    }
  }

  console.log(`[Subscription] Daily check completed`);
}

/** Schedule the daily repeatable job (D-11) */
export async function scheduleSubscriptionJob(): Promise<void> {
  if (!subscriptionQueue) {
    console.warn(
      "[Subscription] Queue not available, skipping job scheduling",
    );
    return;
  }

  await subscriptionQueue.add(
    "daily-subscription-check",
    { runAt: new Date().toISOString() },
    {
      repeat: { pattern: "0 2 * * *" }, // 2:00 AM UTC daily
      jobId: "subscription-daily",
      attempts: 3, // D-12
      backoff: { type: "exponential", delay: 60000 }, // 1min, then exponential
    },
  );

  console.log("[Subscription] Daily job scheduled (cron: 0 2 * * *)");
}

/** Start the worker to process subscription jobs */
export function startSubscriptionWorker(): void {
  if (workerStarted) return;
  if (!redis) {
    console.warn("[Subscription] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      await processDailySubscriptionCheck();
    },
    {
      connection: redis,
      concurrency: 1,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[Subscription] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Subscription] Job ${job?.id} completed`);
  });

  workerStarted = true;
  console.log("[Subscription] Worker started");
}
