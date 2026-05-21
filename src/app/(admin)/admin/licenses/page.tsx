import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminLicenses } from "@/app/(admin)/actions/admin-licenses";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import LicensesTable from "@/components/admin/LicensesTable";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const licenses = await getAdminLicenses();

  return (
    <div>
      <PageBreadcrumb pageTitle="Licenses" basePath="/admin/dashboard" />
      <ComponentCard
        title="License Management"
        desc="View and manage all customer licenses. Revoke, suspend, or reactivate license keys."
      >
        <LicensesTable licenses={licenses} />
      </ComponentCard>
    </div>
  );
}
