import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auditLogs, user } from "@/lib/db/schema";
import { desc, eq, ilike, and, or } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ActivityTable from "@/components/admin/ActivityTable";

export const dynamic = "force-dynamic";

export interface AuditLogRow {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
}

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; action?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const params = await searchParams;

  const conditions = [];
  if (params.search) {
    conditions.push(or(
      ilike(auditLogs.action, `%${params.search}%`),
      ilike(user.name, `%${params.search}%`)
    ));
  }
  if (params.action) {
    conditions.push(eq(auditLogs.action, params.action));
  }

  const rows = await db
    .select({
      id: auditLogs.id,
      actorId: auditLogs.actorId,
      actorName: user.name,
      actorRole: auditLogs.actorRole,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.actorId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  const logs: AuditLogRow[] = rows.map((r) => ({
    ...r,
    details: r.details as Record<string, unknown> | null,
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Activity Log" basePath="/admin/dashboard" />
      <ComponentCard
        title="Audit & Activity Log"
        desc="Track all system events including orders, user actions, license changes, and admin operations."
      >
        <ActivityTable logs={logs} />
      </ComponentCard>
    </div>
  );
}
