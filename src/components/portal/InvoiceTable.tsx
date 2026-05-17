import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { format } from "date-fns";

type OrderRow = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod:
    | "bkash"
    | "nagad"
    | "rocket"
    | "bank_transfer"
    | "ssl_commerz"
    | null;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
};

interface InvoiceTableProps {
  orders: OrderRow[];
  emptyMessage?: string;
}

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
};

export function InvoiceTable({
  orders,
  emptyMessage = "No invoices found.",
}: InvoiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px]">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <TableCell className="px-5 py-4">
                  <Link
                    href={`/dashboard/billing/${order.id}`}
                    className="font-mono text-sm text-[#465fff] hover:underline dark:text-[#465fff]"
                  >
                    {order.id.slice(0, 8)}...
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {order.plan}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat("en-BD", {
                    style: "currency",
                    currency: order.currency,
                  }).format(order.amount)}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {paymentMethodMap[order.paymentMethod ?? ""] ??
                    order.paymentMethod ??
                    "N/A"}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                  {format(new Date(order.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge variant="light" color={statusBadgeMap[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
