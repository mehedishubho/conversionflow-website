"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import type { WebhookDeliveryRow } from "@/app/(admin)/actions/admin-webhooks";

export default function WebhookDeliveriesTable({
  deliveries,
}: {
  deliveries: WebhookDeliveryRow[];
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Endpoint
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Event
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Status Code
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Result
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Attempts
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Date
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                No webhook deliveries recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((del) => (
              <TableRow
                key={del.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <TableCell className="px-5 py-3 text-sm font-mono text-gray-800 dark:text-white/90 max-w-xs truncate">
                  {del.webhookUrl}
                </TableCell>
                <TableCell className="px-5 py-3 text-sm">
                  <Badge variant="light" color="light" size="sm">
                    {del.event}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {del.statusCode ?? "-"}
                </TableCell>
                <TableCell className="px-5 py-3 text-sm">
                  <Badge
                    variant="light"
                    color={del.success ? "success" : "error"}
                    size="sm"
                  >
                    {del.success ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {del.attempts ?? 1}
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(del.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
