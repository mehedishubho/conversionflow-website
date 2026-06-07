import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { orders, user, licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type OrderStatus = "pending" | "completed" | "failed" | "refunded";

const statusBadgeMap: Record<OrderStatus, { color: "warning" | "success" | "error" | "light"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  completed: { color: "success", label: "Completed" },
  failed: { color: "error", label: "Failed" },
  refunded: { color: "light", label: "Refunded" },
};

const paymentMethodLabels: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
  ssl_commerz: "SSL Commerce",
};

const licenseStatusBadge: Record<string, { color: "success" | "warning" | "error" | "light"; label: string }> = {
  active: { color: "success", label: "Active" },
  expired: { color: "warning", label: "Expired" },
  revoked: { color: "error", label: "Revoked" },
  suspended: { color: "light", label: "Suspended" },
};

function formatBDT(amount: number) {
  return amount.toLocaleString("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  });
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  // Fetch order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Order Not Found" basePath="/admin/orders" />
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-12 text-center">
          <p className="text-sm text-error-500 mb-4">Order not found.</p>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Fetch customer info
  const [orderUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, order.userId))
    .limit(1);

  // Fetch linked license
  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.orderId, id))
    .limit(1);

  const statusBadge = statusBadgeMap[order.status as OrderStatus] ?? statusBadgeMap.pending;

  return (
    <div>
      <PageBreadcrumb pageTitle={`Order ${id.substring(0, 8).toUpperCase()}`} basePath="/admin/orders" />

      {/* Back link */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <ComponentCard title="Order Information" desc="Order details and payment info.">
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Order ID</dt>
              <dd className="text-sm font-mono font-medium text-gray-800 dark:text-white/90">{order.id}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
              <dd>
                <Badge variant="light" color={statusBadge.color} size="sm">
                  {statusBadge.label}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Plan</dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-white/90">
                {order.plan.charAt(0).toUpperCase() + order.plan.slice(1)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Amount</dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatBDT(order.amount)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Payment Method</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300">
                {order.paymentMethod
                  ? paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod
                  : "N/A"}
              </dd>
            </div>
            {order.paymentRef && (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</dt>
                <dd className="text-sm font-mono text-gray-700 dark:text-gray-300">{order.paymentRef}</dd>
              </div>
            )}
            {order.couponCode && (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Coupon Code</dt>
                <dd className="text-sm font-mono text-gray-700 dark:text-gray-300">{order.couponCode}</dd>
              </div>
            )}
            {(order.discountAmount ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Discount</dt>
                <dd className="text-sm text-success-600 dark:text-success-400">-{formatBDT(order.discountAmount)}</dd>
              </div>
            )}
            {(order.taxAmount ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Tax (VAT)</dt>
                <dd className="text-sm text-gray-700 dark:text-gray-300">{formatBDT(order.taxAmount)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300">{formatDate(order.createdAt)}</dd>
            </div>
          </dl>
        </ComponentCard>

        {/* Customer Information */}
        <div className="space-y-6">
          <ComponentCard title="Customer Information" desc="Customer who placed this order.">
            {orderUser ? (
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="text-sm font-medium text-gray-800 dark:text-white/90">{orderUser.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">{orderUser.email}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Role</dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 capitalize">{orderUser.role ?? "customer"}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer data not found.</p>
            )}
          </ComponentCard>

          {/* License Information */}
          {license && (
            <ComponentCard title="Linked License" desc="License generated for this order.">
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">License Key</dt>
                  <dd className="text-sm font-mono font-medium text-gray-800 dark:text-white/90 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                    {license.licenseKey}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                  <dd>
                    <Badge
                      variant="light"
                      color={(licenseStatusBadge[license.status] ?? licenseStatusBadge.active).color}
                      size="sm"
                    >
                      {(licenseStatusBadge[license.status] ?? licenseStatusBadge.active).label}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Activations</dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    {license.currentActivations ?? 0} / {license.maxActivations ?? 1}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Expires At</dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    {license.expiresAt ? formatDate(license.expiresAt) : "Lifetime"}
                  </dd>
                </div>
              </dl>
            </ComponentCard>
          )}
        </div>
      </div>
    </div>
  );
}
