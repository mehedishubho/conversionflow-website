"use client";

import React, { useState, useTransition } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActionConfig } from "@/components/admin/ActivityFeed";
import CSVExportButton from "@/components/admin/CSVExportButton";
import {
  getFullActivity,
  getActivityForExport,
  type ActivityPageData,
} from "@/app/(admin)/actions/admin-activity";

const eventTypes = [
  { key: "all", label: "All" },
  { key: "order", label: "Orders" },
  { key: "license", label: "Licenses" },
  { key: "refund", label: "Refunds" },
  { key: "ticket", label: "Tickets" },
  { key: "user", label: "Users" },
];

const dateRanges = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "year", label: "This Year" },
];

const csvColumns = [
  { header: "Date", accessor: (r: Record<string, unknown>) => format(new Date(r.createdAt as Date), "yyyy-MM-dd HH:mm") },
  { header: "Action", accessor: (r: Record<string, unknown>) => r.action as string },
  { header: "Actor", accessor: (r: Record<string, unknown>) => (r.actorName as string) || "System" },
  { header: "Target Type", accessor: (r: Record<string, unknown>) => (r.targetType as string) || "" },
  { header: "Target ID", accessor: (r: Record<string, unknown>) => (r.targetId as string) || "" },
  { header: "Details", accessor: (r: Record<string, unknown>) => r.details ? JSON.stringify(r.details) : "" },
];

interface ActivityFeedFullProps {
  initialData: ActivityPageData;
  initialEventType?: string;
  initialDateRange?: string;
}

export default function ActivityFeedFull({
  initialData,
  initialEventType = "all",
  initialDateRange = "30d",
}: ActivityFeedFullProps) {
  const [activeType, setActiveType] = useState(initialEventType);
  const [activeRange, setActiveRange] = useState(initialDateRange);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [exportRows, setExportRows] = useState<Record<string, unknown>[]>([]);

  const refresh = (page: number, eventType: string, dateRange: string) => {
    startTransition(async () => {
      const result = await getFullActivity({ page, limit: 25, eventType, dateRange });
      setData(result);

      const exportData = await getActivityForExport({ eventType, dateRange });
      setExportRows(exportData as unknown as Record<string, unknown>[]);
    });
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    refresh(1, type, activeRange);
  };

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    refresh(1, activeType, range);
  };

  const handlePageChange = (page: number) => {
    refresh(page, activeType, activeRange);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTypeChange(t.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              activeType === t.key
                ? "bg-brand-50 text-brand-500 border-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {dateRanges.map((r) => (
          <button
            key={r.key}
            onClick={() => handleRangeChange(r.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              activeRange === r.key
                ? "bg-brand-50 text-brand-500 border-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
            }`}
          >
            {r.label}
          </button>
        ))}
        <div className="ml-auto">
          <CSVExportButton
            columns={csvColumns}
            rows={exportRows}
            filename="activity-log"
          />
        </div>
      </div>

      <div className="space-y-3">
        {data.events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No activity found for these filters.</p>
          </div>
        ) : (
          data.events.map((event) => {
            const config = getActionConfig(event.action);
            const Icon = config.icon;
            return (
              <div key={event.id} className="flex items-start gap-3 py-2">
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${config.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-white/90">
                    {config.description(event.details)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.actorName && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {event.actorName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {data.currentPage} of {data.totalPages} ({data.totalCount} events)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(data.currentPage - 1)}
              disabled={data.currentPage <= 1 || isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.currentPage + 1)}
              disabled={data.currentPage >= data.totalPages || isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
