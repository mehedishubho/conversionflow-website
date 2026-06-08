import { requireAdmin } from "@/lib/auth-guard";
import {
  getAdminWebhooks,
  getWebhookDeliveries,
} from "@/app/(admin)/actions/admin-webhooks";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import WebhooksTable from "@/components/admin/WebhooksTable";
import WebhookDeliveriesTable from "@/components/admin/WebhookDeliveriesTable";

export const dynamic = "force-dynamic";

export default async function WebhooksSettingsPage() {
  await requireAdmin();

  const [webhookList, deliveries] = await Promise.all([
    getAdminWebhooks(),
    getWebhookDeliveries(50),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Webhooks" basePath="/admin/settings" />
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
