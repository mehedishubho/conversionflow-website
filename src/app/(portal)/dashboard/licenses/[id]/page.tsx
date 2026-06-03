import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, settings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import { LicenseKeyCopy } from "@/components/portal/LicenseKeyCopy";
import ActivateDomainForm from "@/components/portal/ActivateDomainForm";
import SubscriptionStatus from "@/components/portal/SubscriptionStatus";
import TransferSection from "@/components/portal/TransferSection";
import TransferCodeInput from "@/components/portal/TransferCodeInput";
import { deactivateDomain } from "@/app/(portal)/actions/portal-licenses";
import { getTransferHistory } from "@/app/(portal)/actions/portal-transfers";

type LicenseStatus = "active" | "expired" | "revoked" | "suspended" | "grace_period";

const statusBadgeMap: Record<LicenseStatus, "success" | "warning" | "error" | "light" | "info"> = {
  active: "success",
  expired: "warning",
  revoked: "error",
  suspended: "light",
  grace_period: "info",
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

  // Fetch transfer history (server-side, license-ownership-verified in action)
  const transferHistoryResult = await getTransferHistory(id);
  const transferHistory = Array.isArray(transferHistoryResult)
    ? transferHistoryResult
    : [];

  // Fetch monthly transfer limit from settings
  const settingsRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "max_transfers_per_month"))
    .limit(1);
  const monthlyLimit =
    settingsRow.length > 0
      ? parseInt(settingsRow[0].value, 10) || 1
      : 1;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={maskedBreadcrumbKey} basePath="/dashboard" />

      {/* Claim a transfer code (standalone section) */}
      <ComponentCard title="Claim a License">
        <TransferCodeInput onClaimSuccess={() => {}} />
      </ComponentCard>

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
              {domains.map((domainName: string) => (
                <li
                  key={domainName}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3"
                >
                  <span className="text-sm text-gray-800 dark:text-white/90">
                    {domainName}
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await deactivateDomain(license.id, domainName);
                      revalidatePath(`/dashboard/licenses/${license.id}`);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Deactivate
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {/* Activate New Domain */}
          <ActivateDomainForm
            licenseId={license.id}
            maxActivations={license.maxActivations ?? 1}
            currentActivations={license.currentActivations ?? 0}
          />
        </div>
      </ComponentCard>

      {/* Subscription Status */}
      <ComponentCard title="Subscription Status">
        <SubscriptionStatus
          expiresAt={license.expiresAt}
          status={license.status}
        />
      </ComponentCard>

      {/* Transfer License (only for active licenses) */}
      {license.status === "active" && (
        <ComponentCard title="Transfer License">
          <TransferSection
            licenseId={license.id}
            licenseStatus={license.status}
            transferHistory={transferHistory as any[]}
            monthlyLimit={monthlyLimit}
          />
        </ComponentCard>
      )}
    </div>
  );
}
