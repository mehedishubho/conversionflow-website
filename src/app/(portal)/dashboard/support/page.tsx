import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { TicketTable } from "@/components/portal/TicketTable";
import { CreateTicketModal } from "@/components/portal/CreateTicketModal";

export default async function SupportPage() {
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

  const userTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.updatedAt));

  return (
    <div>
      <PageBreadcrumb pageTitle="Support" basePath="/dashboard" />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Support Tickets
        </h2>
        <CreateTicketModal />
      </div>
      <ComponentCard
        title="Support Tickets"
        desc="View and manage your support requests."
      >
        <TicketTable
          tickets={userTickets}
          emptyMessage="No support tickets. Click 'New Ticket' to get help from our team."
        />
      </ComponentCard>
    </div>
  );
}
