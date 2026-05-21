import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

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
