import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { InvoiceTable } from "@/components/portal/InvoiceTable";

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
        <InvoiceTable
          orders={userOrders}
          emptyMessage="No invoices yet. Your payment history will appear here after your first purchase."
        />
      </ComponentCard>
    </div>
  );
}
