import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { FileDown, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type OrderRow = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  gatewayId: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
};

const statusBadgeMap: Record<
  OrderRow["status"],
  "success" | "warning" | "error" | "light"
> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "light",
};

const paymentMethodMap: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
  ssl_commerz: "SSL Commerce",
  bkash_api: "bKash (Auto)",
  paddle: "Paddle",
};

const gatewayDisplayNames: Record<string, string> = {
  ssl_commerz: "SSL Commerz",
  paddle: "Paddle",
  bkash_api: "bKash (Auto)",
};

export default async function BillingPage() {
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

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Billing" basePath="/dashboard" />
      <ComponentCard
        title="Payment History"
        desc="View your invoices, payment history, and refund status."
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Plan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Payment Method
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No invoices yet. Your payment history will appear here after your first purchase.
                  </TableCell>
                </TableRow>
              ) : (
                userOrders.map((order) => {
                  const row = order as unknown as OrderRow;
                  const gatewayId = row.gatewayId;

                  // Gateway-aware action (D-37)
                  let gatewayAction: React.ReactNode = null;
                  if (gatewayId === "paddle") {
                    gatewayAction = (
                      <Link
                        href={`/dashboard/billing/${row.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Receipt
                      </Link>
                    );
                  } else if (gatewayId === "ssl_commerz" || gatewayId === "bkash_api") {
                    gatewayAction = (
                      <Link
                        href={`/dashboard/billing/${row.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Download Invoice
                      </Link>
                    );
                  } else {
                    gatewayAction = (
                      <Link
                        href={`/dashboard/billing/${row.id}`}
                        className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        View Details
                      </Link>
                    );
                  }

                  // Gateway-aware payment method display
                  const displayMethod = gatewayId
                    ? gatewayDisplayNames[gatewayId] ?? paymentMethodMap[row.paymentMethod ?? ""] ?? row.paymentMethod ?? "N/A"
                    : paymentMethodMap[row.paymentMethod ?? ""] ?? row.paymentMethod ?? "N/A";

                  return (
                    <TableRow
                      key={row.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <TableCell className="px-5 py-4">
                        <Link
                          href={`/dashboard/billing/${row.id}`}
                          className="font-mono text-sm text-[#465fff] hover:underline dark:text-[#465fff]"
                        >
                          {row.id.slice(0, 8)}...
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                        {row.plan}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                        {new Intl.NumberFormat(row.currency === "USD" ? "en-US" : "en-BD", {
                          style: "currency",
                          currency: row.currency,
                        }).format(row.amount)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                        {displayMethod}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                        {format(new Date(row.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge variant="light" color={statusBadgeMap[row.status]}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {gatewayAction}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </ComponentCard>
    </div>
  );
}
