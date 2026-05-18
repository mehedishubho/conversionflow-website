"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auditLogs, user } from "@/lib/db/schema";
import { desc, sql, and, gte } from "drizzle-orm";

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

type DateRange = "7d" | "30d" | "90d" | "year";

const eventTypeMap: Record<string, string[]> = {
  order: ["order."],
  license: ["license."],
  refund: ["order.refunded", "order.status_changed"],
  ticket: ["ticket."],
  user: ["user."],
};

function getDateStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "7d":
      now.setDate(now.getDate() - 7);
      return now;
    case "30d":
      now.setDate(now.getDate() - 30);
      return now;
    case "90d":
      now.setDate(now.getDate() - 90);
      return now;
    case "year":
      return new Date(now.getFullYear(), 0, 1);
  }
}

export interface ActivityEvent {
  id: string;
  action: string;
  actorId: string | null;
  actorName: string | null;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ActivityPageData {
  events: ActivityEvent[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getFullActivity(params: {
  page?: number;
  limit?: number;
  eventType?: string;
  dateRange?: string;
}): Promise<ActivityPageData> {
  await requireAdmin();

  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.eventType && params.eventType !== "all") {
    const prefixes = eventTypeMap[params.eventType];
    if (prefixes && prefixes.length > 0) {
      const likeClauses = prefixes.map(
        (p) => sql`${auditLogs.action} LIKE ${p + "%"}`
      );
      if (likeClauses.length === 1) {
        conditions.push(likeClauses[0]);
      } else {
        conditions.push(sql`(${sql.join(likeClauses, sql` OR `)})`);
      }
    }
  }

  if (params.dateRange) {
    const start = getDateStart(params.dateRange as DateRange);
    conditions.push(gte(auditLogs.createdAt, start));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(auditLogs)
    .where(whereClause);

  const totalCount = countResult.count;
  const totalPages = Math.ceil(totalCount / limit);

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      actorId: auditLogs.actorId,
      actorName: user.name,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(user, sql`${auditLogs.actorId} = ${user.id}`)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    events: rows.map((r) => ({
      id: r.id,
      action: r.action,
      actorId: r.actorId,
      actorName: r.actorName,
      targetType: r.targetType,
      targetId: r.targetId,
      details: r.details as Record<string, unknown> | null,
      createdAt: r.createdAt,
    })),
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export async function getActivityForExport(params: {
  eventType?: string;
  dateRange?: string;
}): Promise<ActivityEvent[]> {
  await requireAdmin();

  const conditions = [];

  if (params.eventType && params.eventType !== "all") {
    const prefixes = eventTypeMap[params.eventType];
    if (prefixes && prefixes.length > 0) {
      const likeClauses = prefixes.map(
        (p) => sql`${auditLogs.action} LIKE ${p + "%"}`
      );
      if (likeClauses.length === 1) {
        conditions.push(likeClauses[0]);
      } else {
        conditions.push(sql`(${sql.join(likeClauses, sql` OR `)})`);
      }
    }
  }

  if (params.dateRange) {
    const start = getDateStart(params.dateRange as DateRange);
    conditions.push(gte(auditLogs.createdAt, start));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      actorId: auditLogs.actorId,
      actorName: user.name,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(user, sql`${auditLogs.actorId} = ${user.id}`)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt));

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorId: r.actorId,
    actorName: r.actorName,
    targetType: r.targetType,
    targetId: r.targetId,
    details: r.details as Record<string, unknown> | null,
    createdAt: r.createdAt,
  }));
}
