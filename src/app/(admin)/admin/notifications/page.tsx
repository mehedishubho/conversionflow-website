import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NotificationLogTable from "@/components/admin/NotificationLogTable";
import TemplateList from "@/components/admin/TemplateList";
import {
  getDeliveryLog,
  getTemplateList,
} from "@/app/(admin)/actions/admin-notif-settings";
import { TEMPLATE_REGISTRY } from "@/lib/notifications/templates";
import type { NotificationEvent } from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Auth check + admin role check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/dashboard");
  }

  // Read URL search params for filters
  const params = await searchParams;
  const filters = {
    event: typeof params.event === "string" ? params.event : undefined,
    channel: typeof params.channel === "string" ? params.channel : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    user: typeof params.user === "string" ? params.user : undefined,
    page: typeof params.page === "string" ? parseInt(params.page, 10) : 1,
  };

  // Fetch delivery log and template list in parallel
  const [deliveryData, templateList] = await Promise.all([
    getDeliveryLog(filters),
    getTemplateList(),
  ]);

  // Generate preview HTML for templates that have a registry entry
  const templatePreviews: {
    event: string;
    category: string;
    htmlContent: string | null;
  }[] = templateList.map((t) => {
    const generator = TEMPLATE_REGISTRY[t.event as NotificationEvent];
    let htmlContent: string | null = null;
    if (generator) {
      try {
        const template = generator({});
        htmlContent = template.html;
      } catch {
        htmlContent = null;
      }
    }
    return {
      event: t.event,
      category: t.category,
      htmlContent,
    };
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" basePath="/admin/dashboard" />

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Notification Delivery Log
        </h1>
      </div>

      {/* Delivery log table with filters */}
      <NotificationLogTable
        initialLogs={deliveryData.logs}
        initialTotal={deliveryData.total}
        initialPage={deliveryData.page}
        initialTotalPages={deliveryData.totalPages}
      />

      {/* Template list section */}
      <div className="mt-8">
        <TemplateList templates={templatePreviews} />
      </div>
    </div>
  );
}
