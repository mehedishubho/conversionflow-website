import React from "react";
import Badge from "@/components/ui/badge/Badge";

type OrderStatus = "pending" | "completed" | "failed" | "refunded";

interface RecentOrderRow {
  id: string;
  plan: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: Date;
  userName: string;
}

const statusBadgeMap: Record<string, { color: "warning" | "success" | "error" | "light"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  completed: { color: "success", label: "Completed" },
  failed: { color: "error", label: "Failed" },
  refunded: { color: "light", label: "Refunded" },
};

interface RecentOrdersTableProps {
  orders: RecentOrderRow[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
        No recent orders.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Order</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Plan</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const badge = statusBadgeMap[order.status] ?? { color: "light" as const, label: order.status };
            return (
              <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                  {order.id.toString().slice(0, 8).toUpperCase()}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {order.userName}
                </td>
                <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">
                  {order.plan}
                </td>
                <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white/90">
                  {order.amount.toLocaleString("en-BD")} BDT
                </td>
                <td className="py-3 px-4">
                  <Badge variant="light" color={badge.color} size="sm">
                    {badge.label}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
