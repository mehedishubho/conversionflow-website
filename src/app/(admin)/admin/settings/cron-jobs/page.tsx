import { requireAdmin } from "@/lib/auth-guard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CronJobsTable from "@/components/admin/CronJobsTable";
import { getCronJobs } from "@/app/(admin)/actions/admin-cron-jobs";

export const dynamic = "force-dynamic";

export default async function CronJobsSettingsPage() {
  await requireAdmin();

  const { jobs, redisAvailable } = await getCronJobs();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Cron Jobs" basePath="/admin/settings" />

      <ComponentCard
        title="Scheduled Jobs"
        desc="View and manage background scheduled jobs. Manually trigger jobs or enable/disable automatic scheduling."
      >
        <CronJobsTable jobs={jobs} redisAvailable={redisAvailable} />
      </ComponentCard>
    </div>
  );
}
