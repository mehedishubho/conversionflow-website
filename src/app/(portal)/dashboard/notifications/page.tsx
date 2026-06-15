import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { CustomerNotificationsList } from "@/components/portal/CustomerNotificationsList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
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

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" basePath="/dashboard" />
      <ComponentCard
        title="Your Notifications"
        desc="Review your license, billing, and support notifications. Mark them as read once you've seen them."
      >
        <CustomerNotificationsList />
      </ComponentCard>
    </div>
  );
}
