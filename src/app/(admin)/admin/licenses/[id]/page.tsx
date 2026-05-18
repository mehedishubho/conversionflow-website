import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLicenseDetail } from "@/app/(admin)/actions/admin-licenses";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import PiracyFlagBadge from "@/components/admin/PiracyFlagBadge";
import LicenseDomainTable from "@/components/admin/LicenseDomainTable";
import LicenseDetailActions from "@/components/admin/LicenseDetailActions";

export const dynamic = "force-dynamic";

const licenseStatusBadge: Record<
  string,
  { color: "success" | "warning" | "error" | "light"; label: string }
> = {
  active: { color: "success", label: "Active" },
  expired: { color: "warning", label: "Expired" },
  revoked: { color: "error", label: "Revoked" },
  suspended: { color: "light", label: "Suspended" },
};

interface LicenseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LicenseDetailPage({
  params,
}: LicenseDetailPageProps) {
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

  const { id } = await params;
  const result = await getLicenseDetail(id);

  if ("error" in result) {
    return (
      <div>
        <PageBreadcrumb
          pageTitle="License Not Found"
          basePath="/admin/dashboard"
        />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{result.error}</p>
          <Link
            href="/admin/licenses"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm mt-2 inline-block"
          >
            Back to Licenses
          </Link>
        </div>
      </div>
    );
  }

  const { license } = result;
  const statusBadge =
    licenseStatusBadge[license.status] ?? {
      color: "light" as const,
      label: license.status,
    };

  const syncStatus =
    license.centralLicenseId && license.orderStatus === "completed"
      ? { color: "success" as const, label: "Synced" }
      : { color: "warning" as const, label: "Pending" };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={license.licenseKey.slice(0, 12)}
        basePath="/admin/dashboard"
      />

      {/* Row 1: License Information + Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComponentCard
          title="License Information"
          desc="License key, plan, and status details."
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  License Key
                </span>
                <p className="font-mono text-xs text-gray-800 dark:text-white/90 mt-0.5">
                  {license.licenseKey.slice(0, 16)}...
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Plan</span>
                <p className="capitalize text-gray-800 dark:text-white/90 mt-0.5">
                  {license.plan}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <p className="mt-0.5">
                  <Badge
                    variant="light"
                    color={statusBadge.color}
                    size="sm"
                  >
                    {statusBadge.label}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Activations
                </span>
                <p className="text-gray-800 dark:text-white/90 mt-0.5">
                  {license.currentActivations ?? 0}/{license.maxActivations ?? 1}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Expires
                </span>
                <p className="text-gray-800 dark:text-white/90 mt-0.5">
                  {license.expiresAt
                    ? new Date(license.expiresAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "No expiry"}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Created
                </span>
                <p className="text-gray-800 dark:text-white/90 mt-0.5">
                  {new Date(license.createdAt).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Customer
                </span>
                <p className="text-gray-800 dark:text-white/90 mt-0.5">
                  {license.userName || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Sync Status" desc="Central API synchronization state.">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Sync Status
                </span>
                <p className="mt-0.5">
                  <Badge
                    variant="light"
                    color={syncStatus.color}
                    size="sm"
                  >
                    {syncStatus.label}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Central ID
                </span>
                <p className="font-mono text-xs text-gray-800 dark:text-white/90 mt-0.5">
                  {license.centralLicenseId || "Not synced"}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Order Status
                </span>
                <p className="text-gray-800 dark:text-white/90 mt-0.5 capitalize">
                  {license.orderStatus || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Last Updated
                </span>
                <p className="text-gray-800 dark:text-white/90 mt-0.5">
                  {new Date(license.updatedAt).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {license.orderId && !license.centralLicenseId && (
              <div className="pt-2">
                <Link
                  href="/admin/licenses"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Retry Sync from Licenses page
                </Link>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Row 2: Piracy Flags (conditional) */}
      {license.piracyFlags.length > 0 && (
        <ComponentCard
          title="Piracy Flags"
          desc="Detected suspicious activation patterns for this license."
          className="mb-6"
        >
          <LicenseDetailActions
            licenseId={license.id}
            licenseKey={license.licenseKey}
            flags={license.piracyFlags}
          />
        </ComponentCard>
      )}

      {/* Row 3: Domain Tracking */}
      <ComponentCard
        title="Domain Tracking"
        desc="Activation domains with metadata and verification status."
        className="mb-6"
      >
        <LicenseDomainTable domains={license.activationDomains} />
      </ComponentCard>

      {/* Row 4: Activation History */}
      {license.activationDomains.length > 0 && (
        <ComponentCard
          title="Activation History"
          desc="Event log of domain activations."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Event
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Domain
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    IP
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {license.activationDomains.map((domain) => (
                  <tr
                    key={domain.domain + domain.activatedAt}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      Activated
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                      {domain.domain}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {domain.ipAddress || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(domain.activatedAt).toLocaleDateString(
                        "en-BD",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {domain.isActive ? (
                        <Badge variant="light" color="success" size="sm">
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="light" color="light" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      )}

      {/* Back to Licenses link */}
      <div className="mt-4">
        <Link
          href="/admin/licenses"
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Back to Licenses
        </Link>
      </div>
    </div>
  );
}
