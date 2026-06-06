import { requireAdmin } from "@/lib/auth-guard";
import { getBackupDashboardData, getBackupList } from "@/app/(admin)/actions/admin-backup";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BackupDashboard from "@/components/admin/BackupDashboard";

export const dynamic = "force-dynamic";

export default async function AdminBackupPage() {
  await requireAdmin();

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
