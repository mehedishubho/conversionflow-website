"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
  retryNotification,
} from "@/app/(admin)/actions/admin-notif-settings";

interface DeliveryLogRow {
  id: string;
  userId: string;
  event: string;
  channel: string;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  userEmail: string | null;
}

interface NotificationLogTableProps {
  initialLogs: DeliveryLogRow[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

const EVENT_OPTIONS = [
  { value: "", label: "All Events" },
  { value: "order", label: "Order" },
  { value: "license", label: "License" },
  { value: "ticket", label: "Ticket" },
  { value: "system", label: "System" },
];

const CHANNEL_OPTIONS = [
  { value: "", label: "All Channels" },
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-App" },
  { value: "whatsapp", label: "WhatsApp" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Queued" },
  { value: "skipped", label: "Skipped" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "sent":
    case "delivered":
      return (
        <Badge variant="light" color="success" size="sm">
          {status}
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="light" color="error" size="sm">
          {status}
        </Badge>
      );
    case "queued":
      return (
        <Badge variant="light" color="warning" size="sm">
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="light" color="light" size="sm">
          {status}
        </Badge>
      );
  }
}

function formatEventName(event: string): string {
  return event
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function formatChannelName(channel: string): string {
  switch (channel) {
    case "in_app":
      return "In-App";
    case "email":
      return "Email";
    case "whatsapp":
      return "WhatsApp";
    default:
      return channel;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationLogTable({
  initialLogs,
  initialTotal,
  initialPage,
  initialTotalPages,
}: NotificationLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<DeliveryLogRow[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Filter state initialized from URL search params
  const [eventFilter, setEventFilter] = useState(
    searchParams.get("event") ?? ""
  );
  const [channelFilter, setChannelFilter] = useState(
    searchParams.get("channel") ?? ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? ""
  );
  const [userFilter, setUserFilter] = useState(
    searchParams.get("user") ?? ""
  );

  const buildUrl = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams();
      if (eventFilter) params.set("event", eventFilter);
      if (channelFilter) params.set("channel", channelFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (userFilter) params.set("user", userFilter);
      params.set("page", String(newPage));
      return `/admin/notifications?${params.toString()}`;
    },
    [eventFilter, channelFilter, statusFilter, userFilter]
  );

  const applyFilters = () => {
    setMessage(null);
    setLoading(true);
    router.push(buildUrl(1));
  };

  const clearFilters = () => {
    setEventFilter("");
    setChannelFilter("");
    setStatusFilter("");
    setUserFilter("");
    setMessage(null);
    setLoading(true);
    router.push("/admin/notifications");
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setMessage(null);
    setLoading(true);
    router.push(buildUrl(newPage));
  };

  const handleRetry = (logId: string) => {
    if (!confirm("Retry sending this notification? The original message will be resent.")) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await retryNotification(logId);
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({
            type: "success",
            text: "Notification retry initiated. A new log entry will appear shortly.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "Failed to retry notification. Please try again.",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Message banner */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Event Type
          </label>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {EVENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Channel
          </label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
            User
          </label>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Search by email..."
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>

        <Button onClick={applyFilters} disabled={loading}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} disabled={loading}>
          Clear Filters
        </Button>
      </div>

      {/* Data table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Event Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Channel
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Sent At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Error Message
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No delivery records found
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Notification delivery attempts will appear here when notifications are sent.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {log.userEmail ?? log.userId}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatEventName(log.event)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatChannelName(log.channel)}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <span
                        className="block max-w-[200px] truncate"
                        title={log.errorMessage ?? undefined}
                      >
                        {log.errorMessage ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      {log.status === "failed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(log.id)}
                          disabled={isPending}
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages} ({total} records)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
