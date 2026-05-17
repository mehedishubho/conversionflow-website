import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";

export const dynamic = "force-dynamic";

const roleBadgeVariant: Record<string, "success" | "light" | "warning" | "error"> = {
  super_admin: "error",
  admin: "warning",
  support_staff: "light",
  customer: "success",
};

export default async function AdminUsersPage() {
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

  const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(user);
  const [customerCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(user).where(eq(user.role, "customer"));
  const [adminCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(user).where(sql`${user.role} IN ('admin', 'super_admin')`);

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Users" basePath="/admin/dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">{totalUsers.count}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400 mt-1">{customerCount.count}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
            <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-1">{adminCount.count}</p>
          </div>
        </div>
      </div>

      <ComponentCard title="All Users" desc="Registered user accounts with roles and status.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-white/90">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.phone || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant="light" color={roleBadgeVariant[u.role || "customer"] || "light"}>
                        {u.role || "customer"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="light" color={u.banned ? "error" : "success"}>
                        {u.banned ? "Banned" : "Active"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/users/${u.id}`} className="text-sm font-medium text-brand-500 hover:text-brand-600">
                        View
                      </Link>
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
