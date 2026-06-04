import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBackupDashboardData, getBackupList } from "@/app/(admin)/actions/admin-backup";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BackupDashboard from "@/components/admin/BackupDashboard";

export const dynamic = "force-dynamic";

export default async function AdminBackupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const [dashboardData, backupList] = await Promise.all([
    getBackupDashboardData(),
    getBackupList(),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Backups" basePath="/admin/dashboard" />
      <BackupDashboard
        dashboardData={dashboardData}
        initialBackups={backupList}
      />
    </div>
  );
}
