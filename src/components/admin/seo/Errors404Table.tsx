"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

interface Error404 {
  id: string;
  url: string;
  referrer: string | null;
  hitCount: number;
  lastSeenAt: Date;
  createdAt: Date;
}

interface Errors404TableProps {
  errors: Error404[];
  total: number;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const d = new Date(date);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function extractHostname(referrer: string | null): string {
  if (!referrer || referrer.trim() === "") return "--";
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

export default function Errors404Table({ errors, total }: Errors404TableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = errors.filter((e) =>
    e.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Empty state: no 404 errors at all
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Badge color="success" size="sm" startIcon={<CheckCircle className="h-3 w-3" />}>
          No 404 errors recorded
        </Badge>
        <p className="mt-2 text-sm text-gray-400">
          404 errors will appear here when visitors hit non-existent pages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input row */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search URLs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-brand-500 focus:outline-none"
        />
        <Badge color="light" size="sm">
          Showing {filtered.length} of {total} errors
        </Badge>
      </div>

      {/* Search matched nothing */}
      {filtered.length === 0 ? (
        <p className="py-4 text-sm text-gray-400">
          No errors match your search.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  URL
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Referrer
                </th>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Hits
                </th>
                <th className="w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((error) => (
                <tr
                  key={error.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                    <span title={error.url}>{error.url}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {extractHostname(error.referrer)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-medium ${
                      error.hitCount > 10
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {error.hitCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(error.lastSeenAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
