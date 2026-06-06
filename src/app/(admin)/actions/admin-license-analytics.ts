"use server";

import { db } from "@/lib/db";
import { licenses, licenseActivations, products, productPlans, user } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsCacheRepository } from "@/modules/analytics/infrastructure/repositories/AnalyticsCacheRepository";

// ──────────────────────────────────────────────
// Admin Role Guard
// ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface LicenseKPIData {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  gracePeriodLicenses: number;
  activationRate: number;
}

export interface GeoRow {
  code: string;
  name: string;
  count: number;
}

export interface LicenseAnalyticsData {
  kpis: LicenseKPIData;
  geo: GeoRow[];
  cacheEmpty: boolean;
}

export interface LicenseChartData {
  categories: string[];
  trendSeries: {
    name: string;
    data: number[];
  }[];
  productSeries: {
    name: string;
    data: number[];
  }[];
  productCategories: string[];
}

// ──────────────────────────────────────────────
// 1. Get License Analytics Data (KPIs + Geo)
// ──────────────────────────────────────────────

export async function getLicenseAnalyticsData(): Promise<LicenseAnalyticsData> {
  await requireAdmin();

  const cacheRepo = new AnalyticsCacheRepository();
  const snapshot = await cacheRepo.getLatestSnapshot();

  // Default zeroed KPIs
  const emptyKPIs: LicenseKPIData = {
    totalLicenses: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    revokedLicenses: 0,
    gracePeriodLicenses: 0,
    activationRate: 0,
  };

  if (!snapshot) {
    return {
      kpis: emptyKPIs,
      geo: [],
      cacheEmpty: true,
    };
  }

  const kpis: LicenseKPIData = {
    totalLicenses: snapshot.totalLicenses,
    activeLicenses: snapshot.activeLicenses,
    expiredLicenses: snapshot.expiredLicenses,
    revokedLicenses: snapshot.revokedLicenses,
    gracePeriodLicenses: snapshot.gracePeriodLicenses,
    activationRate: snapshot.activationRate,
  };

  // Build geo table from licenseActivations with non-null geo column
  const geoRows = await db
    .select({
      geo: licenseActivations.geo,
    })
    .from(licenseActivations)
    .where(sql`${licenseActivations.geo} IS NOT NULL`);

  // Aggregate by country
  const countryMap = new Map<string, { code: string; name: string; count: number }>();
  for (const row of geoRows) {
    if (row.geo && row.geo.country_code) {
      const code = row.geo.country_code;
      const existing = countryMap.get(code);
      if (existing) {
        existing.count++;
      } else {
        countryMap.set(code, {
          code,
          name: row.geo.country_name || code,
          count: 1,
        });
      }
    }
  }

  // Also merge geoDistribution from cache snapshot for completeness
  if (snapshot.geoDistribution && typeof snapshot.geoDistribution === "object") {
    for (const [code, cnt] of Object.entries(snapshot.geoDistribution)) {
      if (!countryMap.has(code)) {
        countryMap.set(code, { code, name: code, count: cnt });
      }
    }
  }

  // Sort by count descending
  const geo = Array.from(countryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 countries

  return {
    kpis,
    geo,
    cacheEmpty: false,
  };
}

// ──────────────────────────────────────────────
// 2. Get License Chart Data (Trend + Product Breakdown)
// ──────────────────────────────────────────────

const allowedRanges = ["7d", "30d", "90d", "year"] as const;
type DateRange = (typeof allowedRanges)[number];

function getDateRangeDays(range: DateRange): number {
  const map: Record<DateRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    year: 365,
  };
  return map[range];
}

export async function getLicenseChartData(range: DateRange = "30d"): Promise<LicenseChartData> {
  await requireAdmin();

  // Validate range parameter (T-19-12: mitigate tampering)
  if (!allowedRanges.includes(range)) {
    range = "30d";
  }

  const days = getDateRangeDays(range);
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  // ── Trend data: group licenses by date and status ──
  const trendRows = await db
    .select({
      date: sql<string>`DATE(${licenses.createdAt})`,
      status: licenses.status,
      count: count(),
    })
    .from(licenses)
    .where(gte(licenses.createdAt, startDate))
    .groupBy(sql`DATE(${licenses.createdAt})`, licenses.status)
    .orderBy(sql`DATE(${licenses.createdAt})`);

  // Build date buckets
  const dateMap = new Map<string, { active: number; expired: number; revoked: number; grace_period: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dateMap.set(key, { active: 0, expired: 0, revoked: 0, grace_period: 0 });
  }

  for (const row of trendRows) {
    const existing = dateMap.get(row.date);
    if (existing) {
      const statusKey = row.status as keyof typeof existing;
      if (statusKey in existing) {
        existing[statusKey] = row.count;
      }
    }
  }

  const categories: string[] = [];
  const activeData: number[] = [];
  const expiredData: number[] = [];
  const revokedData: number[] = [];
  const graceData: number[] = [];

  for (const [date, counts] of dateMap) {
    if (days <= 7) {
      const d = new Date(date);
      categories.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    } else if (days <= 30) {
      const d = new Date(date);
      categories.push(d.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    } else {
      const d = new Date(date);
      categories.push(d.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    }
    activeData.push(counts.active);
    expiredData.push(counts.expired);
    revokedData.push(counts.revoked);
    graceData.push(counts.grace_period);
  }

  const trendSeries = [
    { name: "Active", data: activeData },
    { name: "Expired", data: expiredData },
    { name: "Revoked", data: revokedData },
    { name: "Grace Period", data: graceData },
  ];

  // ── Product breakdown data ──
  const productRows = await db
    .select({
      productId: licenses.productId,
      plan: licenses.plan,
      count: count(),
    })
    .from(licenses)
    .where(gte(licenses.createdAt, startDate))
    .groupBy(licenses.productId, licenses.plan);

  // Resolve product names
  const allProducts = await db.select({ id: products.id, name: products.name }).from(products);
  const productNameMap = new Map(allProducts.map((p) => [p.id, p.name]));

  // Build product x plan matrix
  const productNames = new Set<string>();
  const planNames = new Set<string>();
  const matrix = new Map<string, Map<string, number>>();

  for (const row of productRows) {
    const pName = productNameMap.get(row.productId) || row.productId;
    const plName = row.plan;
    productNames.add(pName);
    planNames.add(plName);

    if (!matrix.has(pName)) {
      matrix.set(pName, new Map());
    }
    matrix.get(pName)!.set(plName, row.count);
  }

  const productCategories = Array.from(productNames);
  const planArray = Array.from(planNames);

  const productSeries = planArray.map((plan) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    data: productCategories.map((pName) => matrix.get(pName)?.get(plan) || 0),
  }));

  return {
    categories,
    trendSeries,
    productSeries,
    productCategories,
  };
}

// ──────────────────────────────────────────────
// 3. Get Customer Growth Data
// ──────────────────────────────────────────────

export interface CustomerGrowthData {
  categories: string[];
  newSignups: number[];
  cumulativeTotal: number[];
}

export async function getCustomerGrowthData(range: DateRange = "30d"): Promise<CustomerGrowthData> {
  await requireAdmin();

  // Validate range parameter (T-19-50: mitigate tampering)
  if (!allowedRanges.includes(range)) {
    range = "30d";
  }

  const days = getDateRangeDays(range);
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  // Get cumulative count of users before the start date
  const beforeStart = await db
    .select({ total: count() })
    .from(user)
    .where(lte(user.createdAt, startDate));

  const startingCount = beforeStart[0]?.total ?? 0;

  // Query signups grouped by date within range
  const signupRows = await db
    .select({
      date: sql<string>`DATE(${user.createdAt})`,
      count: count(),
    })
    .from(user)
    .where(gte(user.createdAt, startDate))
    .groupBy(sql`DATE(${user.createdAt})`)
    .orderBy(sql`DATE(${user.createdAt})`);

  // Build date buckets
  const dateMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dateMap.set(key, 0);
  }

  for (const row of signupRows) {
    const existing = dateMap.get(row.date);
    if (existing !== undefined) {
      dateMap.set(row.date, row.count);
    }
  }

  const categories: string[] = [];
  const newSignups: number[] = [];
  const cumulativeTotal: number[] = [];
  let runningTotal = startingCount;

  for (const [date, signups] of dateMap) {
    if (days <= 7) {
      const d = new Date(date);
      categories.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    } else if (days <= 30) {
      const d = new Date(date);
      categories.push(d.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    } else {
      const d = new Date(date);
      categories.push(d.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    }
    newSignups.push(signups);
    runningTotal += signups;
    cumulativeTotal.push(runningTotal);
  }

  return {
    categories,
    newSignups,
    cumulativeTotal,
  };
}
