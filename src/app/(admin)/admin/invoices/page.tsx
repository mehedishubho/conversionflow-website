import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import InvoiceActions from "@/components/admin/InvoiceActions";

export const dynamic = "force-dynamic";

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
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" basePath="/admin/dashboard" />
      <ComponentCard title="Invoices" desc="All orders across statuses. Filter, approve, or send reminders.">
        <InvoiceActions orders={invoiceOrders} />
      </ComponentCard>
    </div>
  );
}
