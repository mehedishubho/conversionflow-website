import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import { cn } from "@/lib/utils";
import {
  getActivationHistory,
  getLicenseForAdmin,
} from "@/app/(admin)/actions/admin-licenses";

export const dynamic = "force-dynamic";

export default async function ActivationHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin")
    redirect("/dashboard");

  const { id } = await params;

  // Get license details
  const license = await getLicenseForAdmin(id);
  if (!license) notFound();

  // Get activation history
  const activations = await getActivationHistory(id, 100);

  const maskedKey =
    license.licenseKey.length >= 12
      ? `${license.licenseKey.slice(0, 12)}...`
      : license.licenseKey;

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Activations: ${maskedKey}`}
        basePath="/admin/licenses"
      />

      <ComponentCard
        title="Activation History"
        desc={`All activate/deactivate events for license ${maskedKey}`}
      >
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <Badge
              variant="light"
              color={
                license.status === "active"
                  ? "success"
                  : license.status === "expired"
                    ? "warning"
                    : "error"
              }
            >
              {license.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Activations
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {license.currentActivations ?? 0} /{" "}
              {license.maxActivations ?? 1}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Domain
                </th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  IP
                </th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Verification
                </th>
                <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody>
              {activations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No activation history yet.
                  </td>
                </tr>
              ) : (
                activations.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 dark:border-gray-800/50"
                  >
                    <td className="py-3 text-gray-800 dark:text-white/90">
                      {format(new Date(row.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="py-3 text-gray-800 dark:text-white/90 font-mono text-xs">
                      {row.domain}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="light"
                        color={
                          row.action === "activate" ? "success" : "warning"
                        }
                      >
                        {row.action}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {row.ipAddress ?? "N/A"}
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {row.verificationMethod ?? "N/A"}
                    </td>
                    <td className="py-3">
                      {((row.suspiciousFlags as string[]) ?? []).length ===
                      0 ? (
                        <span className="text-gray-400 text-xs">None</span>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {(row.suspiciousFlags as string[]).map((flag) => (
                            <span
                              key={flag}
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                flag === "burst_ips_24h"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                                  : flag === "vpn_tor_exit" ||
                                      flag === "plan_limit_breach"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
                              )}
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}
