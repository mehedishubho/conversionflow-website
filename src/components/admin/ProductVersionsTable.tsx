"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { Rocket, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type VersionStatus = "stable" | "beta" | "draft";

interface VersionRow {
  id: string;
  version: string;
  downloadUrl: string | null;
  changelog: string | null;
  status: VersionStatus;
  releasedAt: Date | null;
  createdAt: Date;
}

interface ProductVersionsTableProps {
  versions: VersionRow[];
  onRelease: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function statusBadgeClasses(status: VersionStatus): string {
  switch (status) {
    case "stable":
      return "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400";
    case "beta":
      return "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400";
    case "draft":
      return "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400";
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ProductVersionsTable({
  versions,
  onRelease,
}: ProductVersionsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRelease = (id: string) => {
    setActionError(null);
    setReleasingId(id);
    startTransition(async () => {
      const result = await onRelease(id);
      if (result.error) {
        setActionError(result.error);
        setReleasingId(null);
      } else {
        setReleasingId(null);
        // Force a full page refresh to show updated data
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Error display */}
      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Version
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Download
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Released
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span>No versions yet.</span>
                    <Link
                      href="versions/new"
                      className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                    >
                      Create a version
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              versions.map((v) => {
                const canRelease = v.status === "draft" || v.status === "beta";
                const isReleasing = releasingId === v.id;

                return (
                  <TableRow
                    key={v.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    {/* Version (monospace semver) */}
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-xs font-mono">
                        {v.version}
                      </code>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell className="px-5 py-3 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          statusBadgeClasses(v.status)
                        )}
                      >
                        {v.status}
                      </span>
                    </TableCell>

                    {/* Download URL */}
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {v.downloadUrl ? (
                        <a
                          href={v.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">&mdash;</span>
                      )}
                    </TableCell>

                    {/* Released date */}
                    <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {v.releasedAt ? formatDate(v.releasedAt) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">Unreleased</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3 text-sm">
                      {canRelease && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-success-600 bg-success-50 hover:bg-success-100 dark:text-success-400 dark:bg-success-500/10 dark:hover:bg-success-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleRelease(v.id)}
                          disabled={isPending}
                        >
                          {isReleasing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Rocket className="w-3.5 h-3.5" />
                          )}
                          Release
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
