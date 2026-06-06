import { requireAdmin } from "@/lib/auth-guard";
import { getAdminNotifications } from "@/app/(admin)/actions/admin-notifications";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import NotificationsTable from "@/components/admin/NotificationsTable";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const notifications = await getAdminNotifications(params.search, params.type);

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" basePath="/admin/dashboard" />
      <ComponentCard
        title="Notification Management"
        desc="View all user notifications and send messages to individual users or broadcast to everyone."
      >
        <NotificationsTable notifications={notifications} />
      </ComponentCard>
    </div>
  );
}
