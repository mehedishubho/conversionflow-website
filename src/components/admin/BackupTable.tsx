"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, RotateCcw, Trash2, ArrowUpDown, HardDrive } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface BackupRecord {
  id: string;
  filename: string;
  filePath: string;
  fileSizeBytes: number | null;
  type: string;
  status: string;
  triggeredBy: string | null;
  cloudUploaded: boolean | null;
  cloudProvider: string | null;
  cloudPath: string | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

interface BackupTableProps {
  backups: BackupRecord[];
  onRestore: (backup: BackupRecord) => void;
  onDelete: (backup: BackupRecord) => void;
  restoreDisabled?: boolean;
  onCreateBackup?: () => void;
  isCreating?: boolean;
  createDisabled?: boolean;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Status badge mapping
const statusBadgeMap: Record<
  string,
  { color: "success" | "error" | "warning"; label: string }
> = {
  completed: { color: "success", label: "Completed" },
  failed: { color: "error", label: "Failed" },
  in_progress: { color: "warning", label: "In Progress" },
};

// Type badge mapping
const typeBadgeMap: Record<
  string,
  { color: "primary" | "info" | "dark"; label: string }
> = {
  manual: { color: "primary", label: "Manual" },
  scheduled: { color: "info", label: "Scheduled" },
  pre_restore: { color: "dark", label: "Pre-Restore" },
};

// Sort type
type SortKey =
  | "date_desc"
  | "date_asc"
  | "size_desc"
  | "size_asc"
  | "type_desc"
  | "type_asc";

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function BackupTable({
  backups,
  onRestore,
  onDelete,
  restoreDisabled = false,
  onCreateBackup,
  isCreating = false,
  createDisabled = false,
}: BackupTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("date_desc");

  // ── Filtering & Sorting ──
  const filtered = backups
    .filter((b) => {
      if (
        searchQuery &&
        !b.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "date_desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "size_asc":
          return (a.fileSizeBytes ?? 0) - (b.fileSizeBytes ?? 0);
        case "size_desc":
          return (b.fileSizeBytes ?? 0) - (a.fileSizeBytes ?? 0);
        case "type_asc":
          return a.type.localeCompare(b.type);
        case "type_desc":
          return b.type.localeCompare(a.type);
        default:
          return 0;
      }
    });

  // ── Sort Toggle ──
  const toggleSort = (base: "date" | "size" | "type") => {
    const ascKey = `${base}_asc` as SortKey;
    const descKey = `${base}_desc` as SortKey;
    if (sortBy === descKey) {
      setSortBy(ascKey);
    } else {
      setSortBy(descKey);
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[250px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="all">All Types</option>
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Filename
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start w-[180px]"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => toggleSort("date")}
                >
                  Date & Time
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-end w-[100px]"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => toggleSort("size")}
                >
                  Size
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-center w-[120px]"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => toggleSort("type")}
                >
                  Type
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-center w-[120px]"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-center w-[200px]"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-5 py-12 text-center"
                >
                  <HardDrive className="mx-auto size-12 text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-3 text-theme-lg font-bold text-gray-800 dark:text-white/90">
                    No backups yet
                  </h3>
                  <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
                    Create your first backup to protect your database.
                  </p>
                  {onCreateBackup && (
                    <div className="mt-4">
                      <Button onClick={onCreateBackup} disabled={isCreating || createDisabled}>
                        {isCreating ? "Creating..." : "Create First Backup"}
                      </Button>
                    </div>
                  )}
                  <p className="mt-3 text-theme-xs text-gray-400">
                    Or{" "}
                    <Link
                      href="/admin/settings/backup"
                      className="text-brand-500 hover:underline"
                    >
                      set up automatic backups
                    </Link>
                  </p>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No backups match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((backup) => {
                const statusBadge =
                  statusBadgeMap[backup.status] ?? {
                    color: "warning" as const,
                    label: backup.status,
                  };
                const typeBadge =
                  typeBadgeMap[backup.type] ?? {
                    color: "dark" as const,
                    label: backup.type,
                  };

                return (
                  <TableRow
                    key={backup.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    {/* Filename */}
                    <TableCell className="px-5 py-4 text-theme-sm font-mono text-gray-800 dark:text-white/90">
                      {backup.filename}
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      {formatDate(backup.createdAt)}
                    </TableCell>

                    {/* Size */}
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300 text-end">
                      {formatFileSize(backup.fileSizeBytes)}
                    </TableCell>

                    {/* Type */}
                    <TableCell className="px-5 py-4 text-center">
                      <Badge variant="light" color={typeBadge.color} size="sm">
                        {typeBadge.label}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-5 py-4 text-center">
                      <Badge
                        variant="light"
                        color={statusBadge.color}
                        size="sm"
                      >
                        {statusBadge.label}
                      </Badge>
                      {backup.status === "failed" && backup.errorMessage && (
                        <p className="text-theme-xs text-error-500 mt-1 max-w-[120px] truncate">
                          {backup.errorMessage}
                        </p>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Download */}
                        <a
                          href={`/api/admin/backup/${backup.id}/download`}
                          download
                          title="Download"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* Restore */}
                        <button
                          type="button"
                          onClick={() => onRestore(backup)}
                          disabled={backup.status === "in_progress" || restoreDisabled}
                          title={restoreDisabled ? "Restore unavailable (psql not installed)" : "Restore"}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete(backup)}
                          title="Delete"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
