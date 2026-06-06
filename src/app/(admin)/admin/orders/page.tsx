import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import OrdersTable from "@/components/admin/OrdersTable";
import { verifyOrder, rejectOrder, issueRefund } from "@//app/(admin)/actions/admin-orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  // Query all orders with user join
  const orderRows = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: user.name,
      userEmail: user.email,
      plan: orders.plan,
      amount: orders.amount,
      paymentMethod: orders.paymentMethod,
      status: orders.status,
      paymentRef: orders.paymentRef,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" basePath="/admin/dashboard" />

      <ComponentCard title="Order Management" desc="View and manage all customer orders. Verify payments, reject suspicious orders, or issue refunds.">
        <OrdersTable
          orders={orderRows.map((row) => ({
            id: row.id,
            userName: row.userName,
            userEmail: row.userEmail,
            plan: row.plan,
            amount: row.amount,
            paymentMethod: row.paymentMethod,
            status: row.status,
            paymentRef: row.paymentRef,
            createdAt: row.createdAt,
          }))}
          onVerify={verifyOrder}
          onReject={rejectOrder}
          onRefund={issueRefund}
        />
      </ComponentCard>
    </div>
  );
}
