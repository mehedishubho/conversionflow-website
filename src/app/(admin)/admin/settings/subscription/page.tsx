import { getSubscriptionSettings } from "@/app/(admin)/actions/admin-settings";
import SubscriptionSettingsForm from "@/components/admin/SubscriptionSettingsForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SubscriptionSettingsPage() {
  const settings = await getSubscriptionSettings();

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Subscription Settings"
        basePath="/admin/settings"
      />
      <SubscriptionSettingsForm
        initialData={{
          gracePeriodDays: settings.gracePeriodDays,
          reminderMilestones: settings.reminderMilestones,
        }}
      />
    </div>
  );
}
