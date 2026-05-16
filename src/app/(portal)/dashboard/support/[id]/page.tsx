import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tickets, ticketMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { TicketConversation } from "@/components/portal/TicketConversation";

const statusBadgeMap: Record<
  "open" | "in_progress" | "resolved" | "closed",
  "warning" | "primary" | "success" | "light"
> = {
  open: "warning",
  in_progress: "primary",
  resolved: "success",
  closed: "light",
};

const priorityBadgeMap: Record<
  "low" | "medium" | "high" | "urgent",
  "success" | "warning" | "error" | "primary"
> = {
  low: "success",
  medium: "warning",
  high: "error",
  urgent: "primary",
};

export default async function TicketDetailPage({
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
  const { id } = await params;

  // IDOR protection: query with both id and userId (T-03-10)
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, id), eq(tickets.userId, userId)));

  if (!ticket) {
    notFound();
  }

  type Attachment = {
    fileName: string;
    storedName: string;
    size: number;
    type: string;
  };

  const rawMessages = await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, id))
    .orderBy(asc(ticketMessages.createdAt));

  // Cast JSONB attachments to typed array (Drizzle JSONB returns unknown)
  const messages = rawMessages.map((msg) => ({
    ...msg,
    attachments: (msg.attachments ?? null) as Attachment[] | null,
  }));

  const isOpen =
    ticket.status === "open" || ticket.status === "in_progress";

  const breadcrumbTitle =
    ticket.subject.length > 30
      ? ticket.subject.slice(0, 30) + "..."
      : ticket.subject;

  return (
    <div>
      <PageBreadcrumb
        pageTitle={breadcrumbTitle}
        basePath="/dashboard"
      />

      {/* Ticket header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
          {ticket.subject}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span>
            <Badge
              variant="light"
              color={statusBadgeMap[ticket.status]}
            >
              {ticket.status.replace("_", " ")}
            </Badge>
          </span>
          <span>
            <Badge
              variant="light"
              color={priorityBadgeMap[ticket.priority]}
            >
              {ticket.priority}
            </Badge>
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Created {new Date(ticket.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Conversation */}
      <TicketConversation
        messages={messages}
        currentUserId={userId}
        ticketId={ticket.id}
        isTicketOpen={isOpen}
      />

      {/* Closed/resolved notice */}
      {!isOpen && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          This ticket is {ticket.status}. You cannot reply.
        </p>
      )}
    </div>
  );
}
