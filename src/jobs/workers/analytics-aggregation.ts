/**
 * Analytics Aggregation Worker
 *
 * Per D-05: Daily pre-aggregation of license analytics.
 * Per D-06: Snapshots for KPIs, direct queries for trend charts.
 * Per D-07/D-08: Geo-IP enrichment of un-enriched IPs.
 * Per JOB-03: BullMQ worker handles analytics aggregation for dashboard.
 */

import { Worker } from "bullmq";
import { bullRedis } from "@/lib/redis";
import { analyticsQueue } from "@/jobs/queues";
import { db } from "@/lib/db";
import { licenseActivations } from "@/lib/db/schema";
import { isNull, sql, not } from "drizzle-orm";
import { LicenseAnalyticsService } from "@/modules/analytics/application/services/LicenseAnalyticsService";
import { AnalyticsCacheRepository } from "@/modules/analytics/infrastructure/repositories/AnalyticsCacheRepository";
import { lookupCountry } from "@/lib/geoip/lookup";

const QUEUE_NAME = "analytics-aggregation";

let workerStarted = false;

/**
 * Batch enrich un-enriched IPs with geo data (D-07, D-08).
 * Processes IPs where geo column is NULL.
 */
async function enrichGeoIPs(): Promise<void> {
  // Find activations with NULL geo and non-null IP
  const unenriched = await db
    .select({
      id: licenseActivations.id,
      ipAddress: licenseActivations.ipAddress,
    })
    .from(licenseActivations)
    .where(isNull(licenseActivations.geo))
    .limit(500); // Process in batches of 500

  if (unenriched.length === 0) {
    console.log("[Analytics] No un-enriched IPs found. Skipping geo enrichment.");
    return;
  }

  console.log(`[Analytics] Enriching ${unenriched.length} IPs with geo data`);
  let enrichedCount = 0;

  for (const row of unenriched) {
    if (!row.ipAddress) continue;
    try {
      const countryCode = await lookupCountry(row.ipAddress);
      if (countryCode) {
        await db
          .update(licenseActivations)
          .set({
            geo: { country_code: countryCode },
          })
          .where(sql`${licenseActivations.id} = ${row.id}`);
        enrichedCount++;
      }
    } catch (enrichError) {
      console.warn(`[Analytics] Failed to enrich IP ${row.ipAddress}:`, enrichError);
    }
  }

  console.log(`[Analytics] Enriched ${enrichedCount}/${unenriched.length} IPs`);
}

/**
 * Main processing function: compute snapshot + enrich geo-IPs.
 */
async function processDailyAnalyticsAggregation(): Promise<void> {
  console.log("[Analytics] Starting daily aggregation...");

  // 1. Compute current snapshot from live data (D-05, D-06)
  const analyticsService = new LicenseAnalyticsService();
  const snapshot = await analyticsService.computeSnapshot();

  // 2. Enrich geo data and update geo distribution in snapshot
  await enrichGeoIPs();

  // 3. Compute geo distribution from enriched data
  const geoRows = await db
    .select({
      geo: licenseActivations.geo,
      count: sql<number>`count(*)`,
    })
    .from(licenseActivations)
    .where(not(isNull(licenseActivations.geo)))
    .groupBy(licenseActivations.geo);

  const geoDistribution: Record<string, number> = {};
  for (const row of geoRows) {
    const geo = row.geo as { country_code: string } | null;
    if (geo?.country_code) {
      geoDistribution[geo.country_code] = (geoDistribution[geo.country_code] || 0) + Number(row.count);
    }
  }
  snapshot.geoDistribution = geoDistribution;

  // 4. Write snapshot to cache
  const cacheRepo = new AnalyticsCacheRepository();
  await cacheRepo.writeSnapshot(snapshot);

  console.log("[Analytics] Daily aggregation completed", {
    total: snapshot.totalLicenses,
    active: snapshot.activeLicenses,
    activationRate: snapshot.activationRate + "%",
    countries: Object.keys(geoDistribution).length,
  });
}

/** Schedule the daily repeatable job (1:00 AM UTC, before subscription worker at 2 AM) */
export async function scheduleAnalyticsJob(): Promise<void> {
  if (!analyticsQueue) {
    console.warn("[Analytics] Queue not available, skipping job scheduling");
    return;
  }

  await analyticsQueue.add(
    "daily-analytics-aggregation",
    { runAt: new Date().toISOString() },
    {
      repeat: { pattern: "0 1 * * *" },
      jobId: "analytics-daily",
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 },
    },
  );

  console.log("[Analytics] Daily job scheduled (cron: 0 1 * * *)");
}

/** Start the worker to process analytics jobs */
export function startAnalyticsWorker(): void {
  if (workerStarted) return;
  if (!bullRedis) {
    console.warn("[Analytics] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      await processDailyAnalyticsAggregation();
    },
    {
      connection: bullRedis,
      concurrency: 1,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[Analytics] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Analytics] Job ${job?.id} completed`);
  });

  workerStarted = true;
  console.log("[Analytics] Worker started");
}
