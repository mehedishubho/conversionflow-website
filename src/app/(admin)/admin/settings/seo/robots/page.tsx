import { getSeoSettings } from "@/app/(admin)/actions/admin-seo";
import RobotsEditor from "@/components/admin/seo/RobotsEditor";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SeoRobotsPage() {
  const seoSettings = await getSeoSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="Robots.txt" basePath="/admin/settings" />
      <RobotsEditor initialData={seoSettings} />
    </div>
  );
}
