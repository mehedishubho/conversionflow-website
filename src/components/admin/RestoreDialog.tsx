"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle, CheckCircle, Circle, Loader2 } from "lucide-react";
import { restoreBackupAction } from "@/app/(admin)/actions/admin-backup";
import Button from "@/components/ui/button/Button";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface RestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  backup: {
    id: string;
    filename: string;
    fileSizeBytes: number | null;
    createdAt: Date;
  } | null;
}

interface RestoreStatus {
  stage: string;
  error?: string;
  rollbackStatus?: string;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Restore steps mapped to stages
const RESTORE_STEPS = [
  { key: "pre_backup", label: "Pre-restore backup created" },
  { key: "maintenance", label: "Maintenance mode enabled" },
  { key: "dropping", label: "Dropping tables..." },
  { key: "restoring", label: "Restoring data" },
  { key: "verifying", label: "Verifying" },
  { key: "complete", label: "Complete" },
] as const;

function getStepIndex(stage: string): number {
  const idx = RESTORE_STEPS.findIndex((s) => s.key === stage);
  return idx >= 0 ? idx : 0;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function RestoreDialog({
  isOpen,
  onClose,
  backup,
}: RestoreDialogProps) {
  const [phase, setPhase] = useState<"confirm" | "progress" | "complete" | "error">(
    "confirm"
  );
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus | null>(null);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when dialog opens with a new backup
  useEffect(() => {
    if (isOpen) {
      setPhase("confirm");
      setRestoreStatus(null);
    }
  }, [isOpen]);

  // Cleanup polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // ── Start Restore ──
  const handleStartRestore = async () => {
    if (!backup) return;

    setPhase("progress");

    try {
      const result = await restoreBackupAction(backup.id);
      if ("error" in result) {
        setPhase("error");
        setRestoreStatus({ stage: "failed", error: result.error });
        return;
      }
    } catch {
      setPhase("error");
      setRestoreStatus({ stage: "failed", error: "Failed to start restore" });
      return;
    }

    // Start polling for status
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/backup/restore/status");
        if (!response.ok) throw new Error("Status check failed");
        const data: RestoreStatus = await response.json();

        setRestoreStatus(data);

        if (data.stage === "complete") {
          stopPolling();
          setPhase("complete");
        } else if (data.stage === "failed") {
          stopPolling();
          setPhase("error");
        }
      } catch {
        // Continue polling on transient errors
      }
    }, 2000);
  };

  // ── Handle close ──
  const handleClose = () => {
    stopPolling();
    onClose();
  };

  if (!backup) return null;

  return (
    <>
      {/* Phase 1: Confirmation Dialog */}
      {phase === "confirm" && (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto size-12 text-warning-500 mb-4" />
            <h3 className="text-theme-xl font-bold text-gray-800 dark:text-white/90 mb-2">
              Restore Database
            </h3>
            <p className="text-theme-sm text-gray-500 dark:text-gray-400 mb-4">
              Restore from{" "}
              <span className="font-mono font-medium">{backup.filename}</span>{" "}
              ({formatFileSize(backup.fileSizeBytes)})? A backup of the current
              database will be created automatically.
            </p>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-6">
              <p className="text-theme-sm text-warning-600">
                This will replace all current data.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleStartRestore}
                className="!bg-error-500 !text-white hover:!bg-error-700"
              >
                Restore
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Phase 2: Progress Dialog */}
      {phase === "progress" && (
        <Modal
          isOpen={isOpen}
          onClose={() => {}}
          showCloseButton={false}
          className="max-w-md p-8"
        >
          <div className="text-center">
            <h3 className="text-theme-xl font-bold text-gray-800 dark:text-white/90 mb-6">
              Restoring Database...
            </h3>
            <div className="space-y-3 text-left mb-6">
              {RESTORE_STEPS.map((step, idx) => {
                const activeIdx = restoreStatus
                  ? getStepIndex(restoreStatus.stage)
                  : -1;
                const isCompleted = idx < activeIdx;
                const isActive = idx === activeIdx;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="size-5 text-success-500" />
                    ) : isActive ? (
                      <Loader2 className="size-5 text-brand-500 animate-spin" />
                    ) : (
                      <Circle className="size-5 text-gray-300 dark:text-gray-600" />
                    )}
                    <span
                      className={
                        isCompleted
                          ? "text-success-600"
                          : isActive
                            ? "text-brand-500 font-medium"
                            : "text-gray-400"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-theme-xs text-gray-400">
              The site is in maintenance mode. Regular users see a maintenance
              page.
            </p>
          </div>
        </Modal>
      )}

      {/* Phase 3: Complete */}
      {phase === "complete" && (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto size-12 text-success-500 mb-4" />
            <h3 className="text-theme-xl font-bold text-gray-800 dark:text-white/90 mb-2">
              Restore Complete
            </h3>
            <p className="text-theme-sm text-gray-500 dark:text-gray-400 mb-6">
              The database has been successfully restored from{" "}
              <span className="font-mono">{backup.filename}</span>.
            </p>
            <Button size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Phase 4: Error */}
      {phase === "error" && (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto size-12 text-error-500 mb-4" />
            <h3 className="text-theme-xl font-bold text-gray-800 dark:text-white/90 mb-2">
              Restore Failed
            </h3>
            <p className="text-theme-sm text-error-600 dark:text-error-400 mb-4">
              {restoreStatus?.error ?? "An unknown error occurred during restore."}
            </p>
            {restoreStatus?.rollbackStatus && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-6">
                <p className="text-theme-sm text-warning-600">
                  Rollback: {restoreStatus.rollbackStatus}
                </p>
              </div>
            )}
            <Button size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
