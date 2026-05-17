import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import OrdersTable from "@/components/admin/OrdersTable";
import { verifyOrder, rejectOrder, issueRefund } from "@//app/(admin)/actions/admin-orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // Auth check + admin role check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/dashboard");
  }

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
