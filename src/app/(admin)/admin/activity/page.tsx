import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getFullActivity } from "@/app/(admin)/actions/admin-activity";
import ActivityFeedFull from "@/components/admin/ActivityFeedFull";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export const dynamic = "force-dynamic";

interface ActivityPageProps {
  searchParams: Promise<{ eventType?: string; dateRange?: string }>;
}

export default async function AdminActivityPage({ searchParams }: ActivityPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const eventType = params.eventType || "all";
  const dateRange = params.dateRange || "30d";

  const data = await getFullActivity({
    page: 1,
    limit: 25,
    eventType,
    dateRange,
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Activity Log" basePath="/admin/dashboard" />
      <ComponentCard title="System Activity" desc="Full audit trail of all system events.">
        <ActivityFeedFull
          initialData={data}
          initialEventType={eventType}
          initialDateRange={dateRange}
        />
      </ComponentCard>
    </div>
  );
}
