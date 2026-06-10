"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Select from "@/components/form/Select";
import { getWebhookEvents } from "@/app/(admin)/actions/admin-settings";
import ComponentCard from "@/components/common/ComponentCard";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface WebhookEvent {
  id: string;
  gatewayId: string;
  eventType: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processedAt: Date | null;
  createdAt: Date;
}

interface WebhookEventLogProps {
  gateways: Array<{ gatewayId: string; name: string }>;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const PAGE_SIZE = 20;

const gatewayNames: Record<string, string> = {
  ssl_commerz: "SSL Commerz",
  paddle: "Paddle",
  bkash_api: "bKash (Auto)",
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function WebhookEventLog({ gateways }: WebhookEventLogProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [gatewayFilter, setGatewayFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const gatewayFilterOptions = [
    { value: "", label: "All Gateways" },
    ...gateways.map((g) => ({
      value: g.gatewayId,
      label: g.name || gatewayNames[g.gatewayId] || g.gatewayId,
    })),
  ];

  // Load events
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getWebhookEvents(gatewayFilter || undefined, page);
        setEvents(result as unknown as WebhookEvent[]);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [gatewayFilter, page]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncatePayload = (payload: Record<string, unknown>, maxLen = 120) => {
    const str = JSON.stringify(payload, null, 0);
    return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
  };

  const toggleExpand = (eventId: string) => {
    setExpandedRow(expandedRow === eventId ? null : eventId);
  };

  return (
    <ComponentCard title="Webhook Event Log" desc="Read-only log of all payment webhook events received from gateways.">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-48">
            <Select
              options={gatewayFilterOptions}
              placeholder="All Gateways"
              onChange={(value) => {
                setGatewayFilter(value);
                setPage(1);
              }}
              defaultValue={gatewayFilter}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 mx-auto mb-2 border-2 border-brand-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading events...
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                    Timestamp
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                    Gateway
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                    Event Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                    Payload
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No webhook events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <React.Fragment key={event.id}>
                      <TableRow className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(event.createdAt)}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {gatewayNames[event.gatewayId] ?? event.gatewayId}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                          {event.eventType}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              event.processed
                                ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                                : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                            }`}
                          >
                            {event.processed ? "Processed" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                          <button
                            type="button"
                            onClick={() => toggleExpand(event.id)}
                            className="text-left truncate block w-full hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                          >
                            {truncatePayload(event.payload)}
                          </button>
                        </TableCell>
                      </TableRow>
                      {/* Expanded payload row */}
                      {expandedRow === event.id && (
                        <TableRow>
                          <TableCell colSpan={5} className="px-5 py-4 bg-gray-50 dark:bg-gray-900">
                            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={events.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
