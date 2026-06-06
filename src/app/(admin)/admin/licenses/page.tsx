import { requireAdmin } from "@/lib/auth-guard";
import { getAdminLicenses } from "@/app/(admin)/actions/admin-licenses";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import LicensesTable from "@/components/admin/LicensesTable";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  await requireAdmin();

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
