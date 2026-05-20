import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export const dynamic = "force-dynamic";

function formatBDT(amount: number): string {
  return amount.toLocaleString("en-BD") + " BDT";
}

export default async function AdminInvoicesPage() {
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

  const invoiceOrders = await db
    .select({
      id: orders.id,
      userName: user.name,
      userEmail: user.email,
      plan: orders.plan,
      amount: orders.amount,
      currency: orders.currency,
      paymentMethod: orders.paymentMethod,
      couponCode: orders.couponCode,
      discountAmount: orders.discountAmount,
      taxAmount: orders.taxAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .where(eq(orders.status, "completed"))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" basePath="/admin/dashboard" />

      <ComponentCard title="Invoices" desc="Completed order invoices. Click to view full details.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Discount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">VAT</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No completed orders yet.
                  </td>
                </tr>
              ) : (
                invoiceOrders.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{inv.id.toString().slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">{inv.userName || "—"}</p>
                        <p className="text-xs text-gray-400">{inv.userEmail || ""}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">{inv.plan}</td>
                    <td className="py-3 px-4 font-semibold">{formatBDT(inv.amount)}</td>
                    <td className="py-3 px-4 text-gray-500">{inv.discountAmount ? formatBDT(inv.discountAmount) : "—"}</td>
                    <td className="py-3 px-4 text-gray-500">{inv.taxAmount ? formatBDT(inv.taxAmount) : "—"}</td>
                    <td className="py-3 px-4 capitalize">{inv.paymentMethod?.replace(/_/g, " ") || "—"}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/billing/${inv.id}`}
                        className="text-sm font-medium text-brand-500 hover:text-brand-600"
                      >
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
