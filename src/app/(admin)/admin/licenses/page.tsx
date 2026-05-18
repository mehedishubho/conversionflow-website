import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import LicenseIntelligenceKPIs from "@/components/admin/LicenseIntelligenceKPIs";
import LicensePlanChart from "@/components/admin/LicensePlanChart";
import LicenseIntelligenceClient from "@/components/admin/LicenseIntelligenceClient";
import {
  getLicenseKPIs,
  getPlanDistribution,
  getLicenses,
} from "@/app/(admin)/actions/admin-licenses";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/dashboard");
  }

  // Fetch all data in parallel
  const [kpis, planDistribution, allLicenses, syncFailures] = await Promise.all([
    getLicenseKPIs(),
    getPlanDistribution(),
    getLicenses("all"),
    getLicenses("sync_failures"),
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="License Intelligence" basePath="/admin/dashboard" />

      {/* KPI Cards */}
      <LicenseIntelligenceKPIs kpis={kpis} />

      {/* Plan Distribution Chart */}
      <ComponentCard title="Plan Distribution" desc="License count by plan type.">
        <LicensePlanChart plans={planDistribution} />
      </ComponentCard>

      {/* License Management with Tab Filters */}
      <ComponentCard
        title="License Management"
        desc="All license keys and their activation status."
        className="mt-6"
      >
        <LicenseIntelligenceClient
          allLicenses={allLicenses}
          syncFailures={syncFailures}
        />
      </ComponentCard>
    </div>
  );
}
