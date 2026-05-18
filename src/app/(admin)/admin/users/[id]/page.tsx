import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/app/(admin)/actions/admin-users";
import UserDetailClient from "@/components/admin/UserDetailClient";
import ActivityFeed from "@/components/admin/ActivityFeed";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";

export const dynamic = "force-dynamic";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

const orderStatusBadge: Record<string, { color: "warning" | "success" | "error" | "light"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  completed: { color: "success", label: "Completed" },
  failed: { color: "error", label: "Failed" },
  refunded: { color: "light", label: "Refunded" },
};

const licenseStatusBadge: Record<string, { color: "success" | "warning" | "error" | "light"; label: string }> = {
  active: { color: "success", label: "Active" },
  expired: { color: "warning", label: "Expired" },
  revoked: { color: "error", label: "Revoked" },
  suspended: { color: "light", label: "Suspended" },
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
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
  const result = await getUserDetail(id);

  if ("error" in result) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User Not Found" basePath="/admin/dashboard" />
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{result.error}</p>
          <Link href="/admin/users" className="text-brand-500 hover:text-brand-600 text-sm mt-2 inline-block">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const { user: userData, orders: userOrders, licenses: userLicenses, activity: userActivity } = result;

  return (
    <div>
      <PageBreadcrumb pageTitle={userData.name} basePath="/admin/dashboard" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComponentCard title="Profile" desc="User account information.">
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-500 text-xl font-bold">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{userData.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Phone</span>
                <p className="text-gray-800 dark:text-white/90">{userData.phone || "—"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Role</span>
                <p className="text-gray-800 dark:text-white/90 capitalize">{userData.role || "customer"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Joined</span>
                <p className="text-gray-800 dark:text-white/90">
                  {new Date(userData.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <p>
                  {userData.banned ? (
                    <Badge variant="light" color="error" size="sm">Banned</Badge>
                  ) : (
                    <Badge variant="light" color="success" size="sm">Active</Badge>
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">2FA</span>
                <p>
                  <Badge variant="light" color={userData.twoFactorEnabled ? "success" : "light"} size="sm">
                    {userData.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        <UserDetailClient
          userId={userData.id}
          userName={userData.name}
          currentRole={userData.role || "customer"}
          isBanned={!!userData.banned}
          banReason={userData.banReason}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComponentCard title="Order History" desc="Recent orders (last 10).">
          {userOrders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Order</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Plan</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order) => {
                    const badge = orderStatusBadge[order.status] ?? { color: "light" as const, label: order.status };
                    return (
                      <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <td className="py-2 px-3 font-mono text-xs">{order.id.toString().slice(0, 8).toUpperCase()}</td>
                        <td className="py-2 px-3 capitalize">{order.plan}</td>
                        <td className="py-2 px-3 font-semibold">{order.amount.toLocaleString("en-BD")} BDT</td>
                        <td className="py-2 px-3">
                          <Badge variant="light" color={badge.color} size="sm">{badge.label}</Badge>
                        </td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>

        <ComponentCard title="Licenses" desc="Active and past licenses.">
          {userLicenses.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No licenses.</p>
          ) : (
            <div className="space-y-3">
              {userLicenses.map((lic) => {
                const badge = licenseStatusBadge[lic.status] ?? { color: "light" as const, label: lic.status };
                return (
                  <div key={lic.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="font-mono text-xs text-gray-800 dark:text-white/90">{lic.licenseKey.slice(0, 8)}...</p>
                      <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{lic.plan}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString("en-BD") : "No expiry"}
                      </span>
                      <Badge variant="light" color={badge.color} size="sm">{badge.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ComponentCard>
      </div>

      <ComponentCard title="Recent Activity" desc="Last 10 actions by this user.">
        <ActivityFeed events={userActivity} />
      </ComponentCard>
    </div>
  );
}
