import { getBackupSettings, getBackupDashboardData } from "@/app/(admin)/actions/admin-backup";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BackupSettingsForm from "@/components/admin/BackupSettingsForm";
import CloudSettingsForm from "@/components/admin/CloudSettingsForm";

export const dynamic = "force-dynamic";

export default async function BackupSettingsPage() {
  const [settings, dashboardData] = await Promise.all([
    getBackupSettings(),
    getBackupDashboardData(),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Backup Settings" basePath="/admin/settings" />
      <BackupSettingsForm
        initialData={settings}
        binaryAvailability={dashboardData.binaryAvailability}
      />
      <CloudSettingsForm initialData={settings} />
    </div>
  );
}
