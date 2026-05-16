import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, downloads, tickets } from "@/lib/db/schema";
import { eq, and, sql, gt } from "drizzle-orm";
import { DashboardMetrics } from "@/components/portal/DashboardMetrics";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

async function getDashboardMetrics(userId: string) {
  const [activeLicenses] = await db
    .select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(and(eq(licenses.userId, userId), eq(licenses.status, "active")));

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [expiringSoon] = await db
    .select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(
      and(
        eq(licenses.userId, userId),
        eq(licenses.status, "active"),
        gt(licenses.expiresAt, new Date()),
        sql`${licenses.expiresAt} < ${thirtyDaysFromNow}`
      )
    );

  const [recentDownloads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(downloads)
    .where(eq(downloads.userId, userId));

  const [openTickets] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(
      and(
        eq(tickets.userId, userId),
        sql`${tickets.status} IN ('open', 'in_progress')`
      )
    );

  return {
    activeLicenses: activeLicenses?.count ?? 0,
    expiringSoon: expiringSoon?.count ?? 0,
    recentDownloads: recentDownloads?.count ?? 0,
    openTickets: openTickets?.count ?? 0,
  };
}

export default async function PortalDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Redirect admin roles to admin dashboard
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "support_staff"
  ) {
    redirect("/admin/dashboard");
  }

  const metrics = await getDashboardMetrics(session.user.id);

  const isEmpty =
    metrics.activeLicenses === 0 &&
    metrics.expiringSoon === 0 &&
    metrics.recentDownloads === 0 &&
    metrics.openTickets === 0;

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" basePath="/dashboard" />
      <DashboardMetrics metrics={metrics} />
      {isEmpty && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Welcome to ConversionFlow
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your dashboard is ready. Once you purchase a license or open a
            support ticket, your activity will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
