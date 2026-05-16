import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { LicenseTable } from "@/components/portal/LicenseTable";

export default async function LicensesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Redirect admin roles to admin dashboard
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "support_staff"
  ) {
    redirect("/admin/dashboard");
  }

  const userId = session.user.id;

  const userLicenses = await db
    .select()
    .from(licenses)
    .where(eq(licenses.userId, userId))
    .orderBy(desc(licenses.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Licenses" basePath="/dashboard" />
      <ComponentCard
        title="Your Licenses"
        desc="Manage your ConversionFlow license keys and activations."
      >
        <LicenseTable
          licenses={userLicenses}
          emptyMessage="No licenses yet. Your licenses will appear here after your first purchase."
        />
      </ComponentCard>
    </div>
  );
}
