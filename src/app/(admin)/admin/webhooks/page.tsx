import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminWebhooks,
  getWebhookDeliveries,
} from "@/app/(admin)/actions/admin-webhooks";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import WebhooksTable from "@/components/admin/WebhooksTable";
import WebhookDeliveriesTable from "@/components/admin/WebhookDeliveriesTable";

export const dynamic = "force-dynamic";

export default async function AdminWebhooksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const [webhookList, deliveries] = await Promise.all([
    getAdminWebhooks(),
    getWebhookDeliveries(50),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Webhooks" basePath="/admin/dashboard" />
      <ComponentCard
        title="Webhook Endpoints"
        desc="Manage webhook endpoints to receive real-time event notifications when things happen in your system."
      >
        <WebhooksTable webhooks={webhookList} />
      </ComponentCard>
      <ComponentCard
        title="Recent Deliveries"
        desc="Recent webhook delivery attempts and their status."
      >
        <WebhookDeliveriesTable deliveries={deliveries} />
      </ComponentCard>
    </div>
  );
}
