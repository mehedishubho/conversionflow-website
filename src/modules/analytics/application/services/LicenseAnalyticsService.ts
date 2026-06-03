import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { sql, count } from "drizzle-orm";
import type { AnalyticsSnapshot } from "../../infrastructure/repositories/AnalyticsCacheRepository";

export class LicenseAnalyticsService {
  async computeSnapshot(): Promise<AnalyticsSnapshot> {
    // Count licenses by status
    const statusCounts = await db
      .select({
        status: licenses.status,
        count: count(),
      })
      .from(licenses)
      .groupBy(licenses.status);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of statusCounts) {
      counts[row.status] = row.count;
      total += row.count;
    }

    // Compute activation rate
    const activatedResult = await db
      .select({ count: count() })
      .from(licenses)
      .where(sql`${licenses.currentActivations} > 0`);
    const activatedCount = activatedResult[0]?.count ?? 0;
    const activationRate = total > 0 ? Math.round((activatedCount / total) * 100) : 0;

    // Compute product breakdown
    const productRows = await db
      .select({
        productId: licenses.productId,
        plan: licenses.plan,
        count: count(),
      })
      .from(licenses)
      .groupBy(licenses.productId, licenses.plan);

    const productBreakdown: Record<string, Record<string, number>> = {};
    for (const row of productRows) {
      if (!productBreakdown[row.productId]) {
        productBreakdown[row.productId] = {};
      }
      productBreakdown[row.productId][row.plan] = row.count;
    }

    return {
      totalLicenses: total,
      activeLicenses: counts["active"] ?? 0,
      expiredLicenses: counts["expired"] ?? 0,
      revokedLicenses: counts["revoked"] ?? 0,
      suspendedLicenses: counts["suspended"] ?? 0,
      gracePeriodLicenses: counts["grace_period"] ?? 0,
      activationRate,
      productBreakdown,
      geoDistribution: {},
    };
  }
}
