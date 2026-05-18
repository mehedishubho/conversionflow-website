import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, user, licenses, settings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { InvoiceHTML } from "@/components/invoice/InvoiceHTML";
import type { OrderWithUser } from "@/components/invoice/InvoiceHTML";

export default async function InvoiceDetailPage({
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

  const { id: orderId } = await params;
  const userRole = (session.user as Record<string, unknown>).role as string;
  const isAdmin = userRole === "admin" || userRole === "super_admin" || userRole === "support_staff";
  const userId = session.user.id;

  // Admin can view any order; customers only their own
  const whereCondition = isAdmin
    ? eq(orders.id, orderId)
    : and(eq(orders.id, orderId), eq(orders.userId, userId));

  const [orderRow] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      centralOrderId: orders.centralOrderId,
      productId: orders.productId,
      plan: orders.plan,
      amount: orders.amount,
      currency: orders.currency,
      paymentMethod: orders.paymentMethod,
      paymentRef: orders.paymentRef,
      status: orders.status,
      couponCode: orders.couponCode,
      discountAmount: orders.discountAmount,
      taxAmount: orders.taxAmount,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .where(whereCondition);

  if (!orderRow) {
    return (
      <div>
        <PageBreadcrumb
          pageTitle={`Invoice ${orderId.slice(0, 8)}`}
          basePath="/dashboard"
        />
        <ComponentCard title="Invoice Not Found">
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Invoice not found. If you believe this is an error, please contact
              support.
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  // Query license linked to this order (optional, for display)
  const [license] = await db
    .select({
      licenseKey: licenses.licenseKey,
      status: licenses.status,
    })
    .from(licenses)
    .where(eq(licenses.orderId, orderId))
    .limit(1);

  // Get VAT rate from settings
  const settingsRows = await db.select().from(settings);
  const vatRateRow = settingsRows.find((s) => s.key === "vat_rate");
  const vatRate = vatRateRow ? parseInt(vatRateRow.value, 10) : 15;

  const order: OrderWithUser = {
    id: orderRow.id,
    userId: orderRow.userId,
    centralOrderId: orderRow.centralOrderId,
    productId: orderRow.productId,
    plan: orderRow.plan,
    amount: orderRow.amount,
    currency: orderRow.currency,
    paymentMethod: orderRow.paymentMethod,
    paymentRef: orderRow.paymentRef,
    status: orderRow.status,
    couponCode: orderRow.couponCode,
    discountAmount: orderRow.discountAmount,
    taxAmount: orderRow.taxAmount,
    createdAt: orderRow.createdAt,
    updatedAt: orderRow.updatedAt,
    userName: orderRow.userName ?? "Unknown",
    userEmail: orderRow.userEmail ?? "",
    userPhone: orderRow.userPhone ?? "",
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Invoice ${orderId.slice(0, 8).toUpperCase()}`}
        basePath={isAdmin ? "/admin/invoices" : "/dashboard"}
      />
      <ComponentCard title={`Invoice ${orderId.slice(0, 8).toUpperCase()}`}>
        <InvoiceHTML order={order} vatRate={isNaN(vatRate) ? 15 : vatRate} />
      </ComponentCard>

      {/* Show license key if available */}
      {license && (
        <ComponentCard title="License Key" className="mt-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your license key for this order:
            </p>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
              <code className="font-mono text-sm text-gray-800 dark:text-white/90 break-all">
                {license.licenseKey}
              </code>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
