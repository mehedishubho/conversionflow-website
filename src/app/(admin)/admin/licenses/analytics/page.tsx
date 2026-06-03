import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LicenseAnalyticsClient from "@/components/admin/analytics/LicenseAnalyticsClient";
import {
  getLicenseAnalyticsData,
  getLicenseChartData,
} from "@/app/(admin)/actions/admin-license-analytics";

export const dynamic = "force-dynamic";

export default async function LicenseAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole !== "admin" &&
    userRole !== "super_admin" &&
    userRole !== "support_staff"
  ) {
    redirect("/dashboard");
  }

  // Fetch initial data in parallel
  const [analyticsData, chartData] = await Promise.all([
    getLicenseAnalyticsData(),
    getLicenseChartData("30d"),
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="License Analytics" />
      <LicenseAnalyticsClient
        initialKPIs={analyticsData.kpis}
        initialCharts={chartData}
        initialGeo={analyticsData.geo}
        initialRange="30d"
        cacheEmpty={analyticsData.cacheEmpty}
      />
    </div>
  );
}
