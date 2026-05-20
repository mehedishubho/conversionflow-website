import { getSeoSettings } from "@/app/(admin)/actions/admin-seo";
import SitemapForm from "@/components/admin/seo/SitemapForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SeoSitemapsPage() {
  const seoSettings = await getSeoSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="Sitemaps" basePath="/admin/settings" />
      <SitemapForm initialData={seoSettings} />
    </div>
  );
}
