import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import UserManagementPanel from "./UserManagementPanel";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session: adminSession } = await requireAdmin();
  const { id } = await params;

  const [targetUser] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!targetUser) {
    notFound();
  }

  const isSuperAdmin = adminSession.user.role === "super_admin";
  const isSelf = adminSession.user.id === targetUser.id;

  const roleBadgeColor: Record<string, "success" | "light" | "warning" | "error"> = {
    super_admin: "error",
    admin: "warning",
    support_staff: "light",
    customer: "success",
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="User Details" basePath="/admin/dashboard" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <ComponentCard title="User Information" desc="Account details and status.">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl font-bold">
                {targetUser.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {targetUser.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{targetUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Role</p>
                <Badge variant="light" color={roleBadgeColor[targetUser.role || "customer"] || "light"}>
                  {targetUser.role || "customer"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <Badge variant="light" color={targetUser.banned ? "error" : "success"}>
                  {targetUser.banned ? "Banned" : "Active"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-800 dark:text-white/90">{targetUser.phone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Email Verified</p>
                <Badge variant="light" color={targetUser.emailVerified ? "success" : "warning"}>
                  {targetUser.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">2FA Enabled</p>
                <Badge variant="light" color={targetUser.twoFactorEnabled ? "success" : "light"}>
                  {targetUser.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Joined</p>
                <p className="text-gray-800 dark:text-white/90">
                  {new Date(targetUser.createdAt).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {targetUser.banned && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Ban Reason:</p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {targetUser.banReason || "No reason provided"}
                </p>
                {targetUser.banExpires && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Expires: {new Date(targetUser.banExpires).toLocaleDateString("en-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Management Panel — only for super_admin */}
        <div className="lg:col-span-2">
          {isSuperAdmin && !isSelf ? (
            <UserManagementPanel userId={targetUser.id} currentRole={targetUser.role || "customer"} isBanned={!!targetUser.banned} />
          ) : isSelf ? (
            <ComponentCard title="Management" desc="This is your own account.">
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                You cannot modify your own role or ban status. Ask another super admin if needed.
              </div>
            </ComponentCard>
          ) : (
            <ComponentCard title="Management" desc="Role and ban management requires super admin access.">
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Only super admins can change user roles and ban status.
              </div>
            </ComponentCard>
          )}
        </div>
      </div>
    </div>
  );
}
