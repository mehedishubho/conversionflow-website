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
import { getActionConfig } from "@/components/admin/ActivityFeed";
import type { AuditLogRow } from "@/app/(admin)/admin/activity/page";

export default function ActivityTable({ logs }: { logs: AuditLogRow[] }) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeColor = (action: string): "success" | "warning" | "error" | "light" => {
    if (action.startsWith("order.")) return "success";
    if (action.startsWith("user.")) return "warning";
    if (action.startsWith("license.")) return "warning";
    if (action.includes("ban") || action.includes("reject") || action.includes("revoke")) return "error";
    return "light";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Action
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Actor
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Target
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Details
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              IP Address
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
              Date
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                No activity recorded.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const config = getActionConfig(log.action);
              const desc = config.description(log.details);
              return (
                <TableRow
                  key={log.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <TableCell className="px-5 py-3 text-sm">
                    <Badge variant="light" color={getBadgeColor(log.action)} size="sm">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>{log.actorName ?? "System"}</div>
                    {log.actorRole && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {log.actorRole}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {log.targetType ? (
                      <div>
                        <span className="capitalize">{log.targetType}</span>
                        {log.targetId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {log.targetId.slice(0, 8)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {desc}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-mono text-gray-500 dark:text-gray-400">
                    {log.ipAddress ?? "-"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(log.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
