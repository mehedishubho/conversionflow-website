import { getSeoSettings } from "@/app/(admin)/actions/admin-seo";
import GeneralSeoForm from "@/components/admin/seo/GeneralSeoForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SeoGeneralPage() {
  const seoSettings = await getSeoSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="General SEO" basePath="/admin/settings" />
      <GeneralSeoForm initialData={seoSettings} />
    </div>
  );
}
