import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import { LicenseKeyCopy } from "@/components/portal/LicenseKeyCopy";

type LicenseStatus = "active" | "expired" | "revoked" | "suspended";

const statusBadgeMap: Record<LicenseStatus, "success" | "warning" | "error" | "light"> = {
  active: "success",
  expired: "warning",
  revoked: "error",
  suspended: "light",
};

export default async function LicenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const { id } = await params;

  // Query with both id and userId to prevent IDOR (T-03-03)
  const [license] = await db
    .select()
    .from(licenses)
    .where(and(eq(licenses.id, id), eq(licenses.userId, userId)));

  if (!license) {
    notFound();
  }

  const domains = (license.activationDomains ?? []) as string[];
  const maskedBreadcrumbKey =
    license.licenseKey.length >= 8
      ? `${license.licenseKey.slice(0, 8)}...`
      : license.licenseKey;

  return (
    <div>
      <PageBreadcrumb pageTitle={maskedBreadcrumbKey} basePath="/dashboard" />

      <ComponentCard title="License Details">
        {/* Header: license key + status */}
        <div className="flex items-center gap-3 mb-6">
          <LicenseKeyCopy licenseKey={license.licenseKey} />
          <Badge
            variant="light"
            color={statusBadgeMap[license.status as LicenseStatus]}
          >
            {license.status}
          </Badge>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {license.plan}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {license.productId}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {license.createdAt
                ? format(new Date(license.createdAt), "MMM d, yyyy")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expiry</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {license.expiresAt
                ? format(new Date(license.expiresAt), "MMM d, yyyy")
                : "Never"}
            </p>
          </div>
        </div>

        {/* Activation domains */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Activation Domains
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {license.currentActivations ?? 0} / {license.maxActivations ?? 1}
            </span>
          </div>

          {domains.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No domains activated yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {domains.map((domain: string) => (
                <li
                  key={domain}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3"
                >
                  <span className="text-sm text-gray-800 dark:text-white/90">
                    {domain}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}
