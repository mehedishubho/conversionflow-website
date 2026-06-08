"use client";

import React, { useState } from "react";
import { HardDrive, Clock, CalendarClock, Database, AlertTriangle } from "lucide-react";
import {
  createBackupAction,
  deleteBackupAction,
} from "@/app/(admin)/actions/admin-backup";
import BackupTable from "@/components/admin/BackupTable";
import RestoreDialog from "@/components/admin/RestoreDialog";
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

interface BackupDashboardProps {
  dashboardData: {
    stats: {
      totalBackups: number;
      lastBackupAt: Date | null;
      totalDiskUsageBytes: number;
    };
    interval: string;
    retentionCount: number;
    binaryAvailability: { pg_dump: boolean; psql: boolean };
  };
  initialBackups: BackupRecord[];
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return then.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatInterval(interval: string): string {
  const map: Record<string, string> = {
    disabled: "Not configured",
    every_6_hours: "Every 6 hours",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };
  return map[interval] ?? interval;
}

// ──────────────────────────────────────────────
// KPI Card Config
// ──────────────────────────────────────────────

const kpiCards = [
  {
    key: "totalBackups",
    label: "Total Backups",
    icon: HardDrive,
    getValue: (data: BackupDashboardProps["dashboardData"]) =>
      String(data.stats.totalBackups),
  },
  {
    key: "lastBackup",
    label: "Last Backup",
    icon: Clock,
    getValue: (data: BackupDashboardProps["dashboardData"]) =>
      formatRelativeTime(data.stats.lastBackupAt),
  },
  {
    key: "nextScheduled",
    label: "Next Scheduled",
    icon: CalendarClock,
    getValue: (data: BackupDashboardProps["dashboardData"]) =>
      formatInterval(data.interval),
  },
  {
    key: "diskUsage",
    label: "Disk Usage",
    icon: Database,
    getValue: (data: BackupDashboardProps["dashboardData"]) =>
      formatFileSize(data.stats.totalDiskUsageBytes),
  },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function BackupDashboard({
  dashboardData,
  initialBackups,
}: BackupDashboardProps) {
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups);
  const [isCreating, setIsCreating] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ── Create Backup ──
  const handleCreateBackup = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const result = await createBackupAction();
      if (result.success) {
        // Prepend a synthetic "in_progress" entry for immediate feedback
        const newBackup: BackupRecord = {
          id: result.backupId,
          filename: result.filename,
          filePath: "",
          fileSizeBytes: result.fileSizeBytes ?? null,
          type: "manual",
          status: "in_progress",
          triggeredBy: null,
          cloudUploaded: null,
          cloudProvider: null,
          cloudPath: null,
          errorMessage: null,
          createdAt: new Date(),
          completedAt: null,
        };
        setBackups((prev) => [newBackup, ...prev]);
      } else {
        setCreateError(result.error || "Backup creation failed.");
      }
    } catch {
      setCreateError("An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  // ── Restore ──
  const handleRestore = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setShowRestoreDialog(true);
  };

  const handleRestoreComplete = () => {
    setShowRestoreDialog(false);
    setSelectedBackup(null);
  };

  // ── Delete ──
  const handleDeleteRequest = (backup: BackupRecord) => {
    setDeleteConfirmId(backup.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const result = await deleteBackupAction(deleteConfirmId);
      if ("success" in result && result.success) {
        setBackups((prev) => prev.filter((b) => b.id !== deleteConfirmId));
      }
    } catch {
      // Silent — action already handles errors
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const pgDumpAvailable = dashboardData.binaryAvailability.pg_dump;
  const psqlAvailable = dashboardData.binaryAvailability.psql;

  // ── Render ──
  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-theme-xl font-bold text-gray-800 dark:text-white/90">
          Backups
        </h1>
        <Button onClick={handleCreateBackup} disabled={isCreating || !pgDumpAvailable}>
          {isCreating ? "Creating..." : "Create Backup"}
        </Button>
      </div>

      {/* Binary Availability Warning Banner */}
      {(!pgDumpAvailable || !psqlAvailable) && (
        <div className="mb-6 rounded-xl border border-warning-200 bg-warning-50 px-5 py-4 dark:border-warning-800 dark:bg-warning-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-600 dark:text-warning-400" />
            <div className="space-y-1 text-sm">
              {!pgDumpAvailable && (
                <p className="text-warning-700 dark:text-warning-300">
                  <strong>pg_dump</strong> is not available on this server. Backups cannot be created until PostgreSQL client tools are installed.
                </p>
              )}
              {!psqlAvailable && (
                <p className="text-warning-700 dark:text-warning-300">
                  <strong>psql</strong> is not available. Restore operations will not work until PostgreSQL client tools are installed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Error Alert */}
      {createError && (
        <div className="mb-6 rounded-xl border border-error-200 bg-error-50 px-5 py-4 dark:border-error-800 dark:bg-error-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-error-600 dark:text-error-400" />
            <p className="text-sm text-error-700 dark:text-error-300">
              {createError}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <card.icon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
              <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                {card.getValue(dashboardData)}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Content: Always show table (empty state is inside the table) */}
      <BackupTable
        backups={backups}
        onRestore={handleRestore}
        onDelete={handleDeleteRequest}
        restoreDisabled={!psqlAvailable}
        onCreateBackup={handleCreateBackup}
        isCreating={isCreating}
        createDisabled={!pgDumpAvailable}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-gray-400/50 backdrop-blur-[32px]"
            onClick={handleDeleteCancel}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Delete Backup
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this backup? This cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="!bg-error-500 !text-white hover:!bg-error-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      <RestoreDialog
        isOpen={showRestoreDialog}
        onClose={handleRestoreComplete}
        backup={
          selectedBackup
            ? {
                id: selectedBackup.id,
                filename: selectedBackup.filename,
                fileSizeBytes: selectedBackup.fileSizeBytes,
                createdAt: selectedBackup.createdAt,
              }
            : null
        }
      />
    </div>
  );
}
