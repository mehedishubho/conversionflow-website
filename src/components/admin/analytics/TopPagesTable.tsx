"use client";

import React, { useState } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

interface PageData {
  path: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgTimeOnPage: string;
  exitRate?: number;
}

interface TopPagesTableProps {
  pages: PageData[];
  limit?: number;
}

export default function TopPagesTable({ pages, limit = 10 }: TopPagesTableProps) {
  const [sortField, setSortField] = useState<keyof PageData>("views");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof PageData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedPages = [...pages]
    .sort((a, b) => {
      let comparison = 0;

      if (typeof a[sortField] === "number" && typeof b[sortField] === "number") {
        comparison = (a[sortField] as number) - (b[sortField] as number);
      } else if (typeof a[sortField] === "string" && typeof b[sortField] === "string") {
        comparison = (a[sortField] as string).localeCompare(b[sortField] as string);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    })
    .slice(0, limit);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getBounceRateColor = (rate: number): string => {
    if (rate < 40) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (rate < 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
  };

  const SortIcon = ({ field }: { field: keyof PageData }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <TrendingUp className="w-4 h-4 text-blue-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("path")}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Page Path
                  <SortIcon field="path" />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleSort("views")}
                  className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Views
                  <SortIcon field="views" />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleSort("uniqueVisitors")}
                  className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Unique Visitors
                  <SortIcon field="uniqueVisitors" />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleSort("bounceRate")}
                  className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Bounce Rate
                  <SortIcon field="bounceRate" />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleSort("avgTimeOnPage")}
                  className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Avg Time
                  <SortIcon field="avgTimeOnPage" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {sortedPages.map((page, index) => (
              <tr
                key={index}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {page.path === "/" ? "Home" : page.path}
                        </span>
                        <a
                          href={page.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        /{page.path}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatNumber(page.views)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {((page.uniqueVisitors / page.views) * 100).toFixed(1)}% unique
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatNumber(page.uniqueVisitors)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {((page.uniqueVisitors / page.views) * 100).toFixed(1)}% of views
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getBounceRateColor(
                      page.bounceRate
                    )}`}
                  >
                    {page.bounceRate.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {page.avgTimeOnPage}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing top {Math.min(limit, sortedPages.length)} of {pages.length} pages
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Good (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Average (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Poor (&gt;60%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}