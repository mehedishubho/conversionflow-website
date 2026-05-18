"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, auditLogs, user } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { format, parseISO } from "date-fns";

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
    redirect("/admin/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type DateRange = "7d" | "30d" | "90d" | "year";

export interface KPIMetric {
  value: number;
  trend: number;
  trendDirection: "up" | "down" | "flat";
}

export interface DashboardKPIs {
  totalRevenue: KPIMetric;
  mrr: KPIMetric;
  activeCustomers: KPIMetric;
  totalOrders: KPIMetric;
}

export interface RevenueChartData {
  categories: string[];
  values: number[];
}

export interface AuditEvent {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface RecentOrder {
  id: string;
  plan: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: Date;
  userName: string;
}

// ──────────────────────────────────────────────
// Date Range Helper
// ──────────────────────────────────────────────

function getDateRange(range: DateRange, now: Date): { start: Date; prevStart: Date } {
  switch (range) {
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      return { start, prevStart };
    }
    case "30d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 30);
      return { start, prevStart };
    }
    case "90d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 90);
      return { start, prevStart };
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      const prevStart = new Date(now.getFullYear() - 1, 0, 1);
      return { start, prevStart };
    }
  }
}

function calcTrend(current: number, previous: number): KPIMetric {
  if (previous === 0) {
    if (current > 0) {
      return { value: current, trend: 100, trendDirection: "up" };
    }
    return { value: current, trend: 0, trendDirection: "flat" };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct * 10) / 10;
  return {
    value: current,
    trend: Math.abs(rounded),
    trendDirection: rounded > 0 ? "up" : rounded < 0 ? "down" : "flat",
  };
}

// ──────────────────────────────────────────────
// 1. Dashboard KPIs (D-02, D-03, D-04)
// ──────────────────────────────────────────────

export async function getDashboardKPIs(range: DateRange): Promise<DashboardKPIs> {
  await requireAdmin();

  const now = new Date();
  const { start, prevStart } = getDateRange(range, now);

  // Total Revenue: current period
  const [currentRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, start),
        lte(orders.createdAt, now)
      )
    );

  // Total Revenue: previous period
  const [prevRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, prevStart),
        lte(orders.createdAt, start)
      )
    );

  // MRR: completed orders in current calendar month (per D-04)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [currentMRR] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, monthStart)
      )
    );

  const [prevMRR] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, prevMonthStart),
        lte(orders.createdAt, monthStart)
      )
    );

  // Active Customers: current period
  const [currentCustomers] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${orders.userId})` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, start),
        lte(orders.createdAt, now)
      )
    );

  // Active Customers: previous period
  const [prevCustomers] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${orders.userId})` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, prevStart),
        lte(orders.createdAt, start)
      )
    );

  // Total Orders: current period
  const [currentOrders] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, start),
        lte(orders.createdAt, now)
      )
    );

  // Total Orders: previous period
  const [prevOrders] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, prevStart),
        lte(orders.createdAt, start)
      )
    );

  return {
    totalRevenue: calcTrend(currentRevenue.total, prevRevenue.total),
    mrr: calcTrend(currentMRR.total, prevMRR.total),
    activeCustomers: calcTrend(currentCustomers.count, prevCustomers.count),
    totalOrders: calcTrend(currentOrders.count, prevOrders.count),
  };
}

// ──────────────────────────────────────────────
// 2. Revenue Chart Data (D-08)
// ──────────────────────────────────────────────

function formatDateLabel(periodStr: string, range: DateRange): string {
  try {
    const date = parseISO(periodStr);
    switch (range) {
      case "7d":
        return format(date, "EEE"); // Mon, Tue, ...
      case "30d":
        return format(date, "MMM d"); // Jan 5, ...
      case "90d":
        return format(date, "MMM"); // Jan, Feb, ...
      case "year":
        return format(date, "MMM"); // Jan, Feb, ...
    }
  } catch {
    return periodStr.slice(0, 10);
  }
}

export async function getRevenueChartData(range: DateRange): Promise<RevenueChartData> {
  await requireAdmin();

  const now = new Date();
  const { start } = getDateRange(range, now);

  const truncMap: Record<DateRange, string> = {
    "7d": "day",
    "30d": "week",
    "90d": "month",
    "year": "month",
  };
  const truncUnit = truncMap[range];

  const rows = await db
    .select({
      period: sql<string>`date_trunc('${sql.raw(truncUnit)}', ${orders.createdAt})::text`,
      total: sql<number>`COALESCE(SUM(${orders.amount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, start),
        lte(orders.createdAt, now)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncUnit)}', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('${sql.raw(truncUnit)}', ${orders.createdAt})`);

  return {
    categories: rows.map((r) => formatDateLabel(r.period, range)),
    values: rows.map((r) => r.total),
  };
}

// ──────────────────────────────────────────────
// 3. Recent Activity (D-21)
// ──────────────────────────────────────────────

export async function getRecentActivity(limit = 15): Promise<AuditEvent[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    details: r.details as Record<string, unknown> | null,
    createdAt: r.createdAt,
  }));
}

// ──────────────────────────────────────────────
// 4. Recent Orders (D-05)
// ──────────────────────────────────────────────

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: orders.id,
      plan: orders.plan,
      amount: orders.amount,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
      userName: user.name,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    plan: r.plan,
    amount: r.amount,
    status: r.status,
    paymentMethod: r.paymentMethod,
    createdAt: r.createdAt,
    userName: r.userName ?? "Unknown",
  }));
}
