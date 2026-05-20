import { getTrackingSettingsAdmin } from "@/app/(admin)/actions/admin-tracking";
import TrackingSettingsForm from "@/components/admin/TrackingSettingsForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage() {
  const trackingSettings = await getTrackingSettingsAdmin();

  return (
    <div>
      <PageBreadcrumb pageTitle="SEO Settings" basePath="/admin/settings" />
      <TrackingSettingsForm initialData={trackingSettings} />
    </div>
  );
}
