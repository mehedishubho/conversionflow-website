import CoreWebVitalsCards from "@/components/admin/seo/CoreWebVitalsCards";
import PerformanceSeoForm from "@/components/admin/seo/PerformanceSeoForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

export default function SeoPerformancePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Performance" basePath="/admin/settings" />
      <div className="space-y-6">
        <CoreWebVitalsCards />
        <PerformanceSeoForm />
      </div>
    </div>
  );
}
