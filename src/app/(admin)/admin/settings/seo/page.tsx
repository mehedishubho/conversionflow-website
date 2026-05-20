import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import { getSeoSettings } from "@/app/(admin)/actions/admin-seo";
import SeoOverviewCards from "@/components/admin/seo/SeoOverviewCards";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage() {
  const [trackingSettings, seoSettings] = await Promise.all([
    getTrackingSettings(),
    getSeoSettings(),
  ]);

  const combined: Record<string, string> = {
    ...seoSettings,
    ...trackingSettings,
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="SEO Settings" basePath="/admin/settings" />
      <SeoOverviewCards settingsData={combined} />
    </div>
  );
}
