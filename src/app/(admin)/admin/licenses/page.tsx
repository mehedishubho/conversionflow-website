import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import CSVExportButton from "@/components/admin/CSVExportButton";

export const dynamic = "force-dynamic";

const statusBadgeMap: Record<string, { color: "success" | "warning" | "error" | "light"; label: string }> = {
  active: { color: "success", label: "Active" },
  expired: { color: "warning", label: "Expired" },
  revoked: { color: "error", label: "Revoked" },
  suspended: { color: "light", label: "Suspended" },
};

const csvColumns = [
  { header: "License Key", accessor: (r: Record<string, unknown>) => r.licenseKey as string },
  { header: "Customer", accessor: (r: Record<string, unknown>) => (r.userName as string) || "Unknown" },
  { header: "Plan", accessor: (r: Record<string, unknown>) => r.plan as string },
  { header: "Status", accessor: (r: Record<string, unknown>) => r.status as string },
  { header: "Activations", accessor: (r: Record<string, unknown>) => `${r.currentActivations}/${r.maxActivations}` },
  { header: "Created", accessor: (r: Record<string, unknown>) => new Date(r.createdAt as Date).toLocaleDateString("en-BD") },
];

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

  const licenseRows = await db
    .select({
      id: licenses.id,
      licenseKey: licenses.licenseKey,
      userName: user.name,
      plan: licenses.plan,
      status: licenses.status,
      currentActivations: licenses.currentActivations,
      maxActivations: licenses.maxActivations,
      createdAt: licenses.createdAt,
    })
    .from(licenses)
    .leftJoin(user, eq(licenses.userId, user.id))
    .orderBy(desc(licenses.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Licenses" basePath="/admin/dashboard" />

      <ComponentCard title="License Management" desc="All license keys and their activation status.">
        <div className="flex justify-end mb-4">
          <CSVExportButton
            columns={csvColumns}
            rows={licenseRows as unknown as Record<string, unknown>[]}
            filename="licenses"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">License Key</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Activations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Created</th>
              </tr>
            </thead>
            <tbody>
              {licenseRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No licenses yet. Licenses will appear here after purchases are completed.
                  </td>
                </tr>
              ) : (
                licenseRows.map((lic) => {
                  const badge = statusBadgeMap[lic.status] ?? { color: "light" as const, label: lic.status };
                  return (
                    <tr key={lic.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                        {lic.licenseKey.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {lic.userName || "Unknown"}
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">{lic.plan}</td>
                      <td className="py-3 px-4">
                        <Badge variant="light" color={badge.color} size="sm">
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {lic.currentActivations}/{lic.maxActivations}
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {new Date(lic.createdAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}
