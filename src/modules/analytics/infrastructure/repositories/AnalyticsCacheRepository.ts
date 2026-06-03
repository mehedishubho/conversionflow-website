import { db } from "@/lib/db";
import { licenseAnalyticsCache } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export interface AnalyticsSnapshot {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  suspendedLicenses: number;
  gracePeriodLicenses: number;
  activationRate: number;
  productBreakdown: Record<string, Record<string, number>>;
  geoDistribution: Record<string, number>;
}

export class AnalyticsCacheRepository {
  async getLatestSnapshot(): Promise<typeof licenseAnalyticsCache.$inferSelect | null> {
    const rows = await db
      .select()
      .from(licenseAnalyticsCache)
      .orderBy(desc(licenseAnalyticsCache.snapshotDate))
      .limit(1);
    return rows.length > 0 ? rows[0] : null;
  }

  async writeSnapshot(data: AnalyticsSnapshot): Promise<void> {
    await db.insert(licenseAnalyticsCache).values({
      snapshotDate: new Date(),
      totalLicenses: data.totalLicenses,
      activeLicenses: data.activeLicenses,
      expiredLicenses: data.expiredLicenses,
      revokedLicenses: data.revokedLicenses,
      suspendedLicenses: data.suspendedLicenses,
      gracePeriodLicenses: data.gracePeriodLicenses,
      activationRate: data.activationRate,
      productBreakdown: data.productBreakdown,
      geoDistribution: data.geoDistribution,
    });
  }
}
