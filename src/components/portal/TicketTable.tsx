import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type TicketRow = {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  updatedAt: Date;
};

const statusBadgeMap: Record<
  TicketRow["status"],
  "warning" | "primary" | "success" | "light"
> = {
  open: "warning",
  in_progress: "primary",
  resolved: "success",
  closed: "light",
};

const priorityBadgeMap: Record<
  TicketRow["priority"],
  "success" | "warning" | "error" | "primary"
> = {
  low: "success",
  medium: "warning",
  high: "error",
  urgent: "primary",
};

export function TicketTable({
  tickets: ticketList,
  emptyMessage = "No support tickets found.",
}: {
  tickets: TicketRow[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow className="border-b border-gray-100 dark:border-gray-800">
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Ticket ID
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Subject
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Priority
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Status
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Updated
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ticketList.length === 0 ? (
            <TableRow className="border-b border-gray-100 dark:border-gray-800">
              <TableCell
                colSpan={5}
                className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            ticketList.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <TableCell className="px-5 py-4">
                  <Link
                    href={`/dashboard/support/${ticket.id}`}
                    className="font-mono text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {ticket.id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {ticket.subject.length > 40
                    ? ticket.subject.slice(0, 40) + "..."
                    : ticket.subject}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    variant="light"
                    color={priorityBadgeMap[ticket.priority]}
                    size={ticket.priority === "urgent" ? "sm" : "md"}
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    variant="light"
                    color={statusBadgeMap[ticket.status]}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(ticket.updatedAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
