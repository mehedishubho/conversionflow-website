import { getSeoSettings } from "@/app/(admin)/actions/admin-seo";
import VerificationForm from "@/components/admin/seo/VerificationForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default async function SeoVerificationPage() {
  const seoSettings = await getSeoSettings();

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Search Verification"
        basePath="/admin/settings"
      />
      <VerificationForm initialData={seoSettings} />
    </div>
  );
}
