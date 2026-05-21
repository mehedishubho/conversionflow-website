import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SettingsOverviewCards from "@/components/admin/SettingsOverviewCards";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Auth check + admin role check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" basePath="/admin/dashboard" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your application settings and configurations
        </p>
      </div>

      <SettingsOverviewCards />
    </div>
  );
}
