"use client";

import React, { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { saveBackupSettings } from "@/app/(admin)/actions/admin-backup";

interface BackupSettingsFormProps {
  initialData: {
    interval: string;
    retentionCount: number;
    cloud: {
      provider: string;
      s3: {
        endpoint: string;
        accessKey: string;
        secretKey: string;
        bucket: string;
      };
      gdrive: {
        clientId: string;
        clientSecret: string;
        refreshToken: string;
        folderId: string;
      };
    };
  };
  binaryAvailability: {
    pg_dump: boolean;
    psql: boolean;
  };
}

const RETENTION_OPTIONS = [5, 10, 15, 20] as const;

export default function BackupSettingsForm({
  initialData,
  binaryAvailability,
}: BackupSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Schedule state
  const [interval, setInterval] = useState(initialData.interval);
  const [retentionCount, setRetentionCount] = useState(
    initialData.retentionCount
  );
  const isCustomRetention = !RETENTION_OPTIONS.includes(
    retentionCount as (typeof RETENTION_OPTIONS)[number]
  );
  const [retentionSelectValue, setRetentionSelectValue] = useState(
    isCustomRetention ? "custom" : String(retentionCount)
  );
  const [customRetentionValue, setCustomRetentionValue] = useState(
    isCustomRetention ? retentionCount : 10
  );

  const handleRetentionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRetentionSelectValue(val);
    if (val !== "custom") {
      setRetentionCount(parseInt(val, 10));
    }
  };

  const handleSaveSchedule = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const finalRetention =
          retentionSelectValue === "custom"
            ? customRetentionValue
            : retentionCount;

        const result = await saveBackupSettings({
          interval,
          retentionCount: finalRetention,
        });

        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({
            type: "success",
            text: "Backup settings saved successfully.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Section 1: Backup Schedule */}
      <ComponentCard
        title="Backup Schedule"
        desc="Configure automatic backup frequency and retention policy."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Schedule Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs appearance-none focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="disabled">Disabled</option>
              <option value="every_6_hours">Every 6 hours</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Retention Policy
            </label>
            <select
              value={retentionSelectValue}
              onChange={handleRetentionChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs appearance-none focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="5">Keep last 5 backups</option>
              <option value="10">Keep last 10 backups (default)</option>
              <option value="15">Keep last 15 backups</option>
              <option value="20">Keep last 20 backups</option>
              <option value="custom">Custom...</option>
            </select>
          </div>

          {retentionSelectValue === "custom" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Custom Retention Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={customRetentionValue}
                onChange={(e) =>
                  setCustomRetentionValue(parseInt(e.target.value) || 1)
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs appearance-none focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Between 1 and 50
              </p>
            </div>
          )}

          <div>
            <Button onClick={handleSaveSchedule} disabled={isPending}>
              {isPending ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </div>
      </ComponentCard>

      {/* Section 2: System Requirements */}
      <ComponentCard
        title="System Requirements"
        desc="Tool availability for backup and restore operations."
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                pg_dump
              </span>
              <p className="text-xs text-gray-400">
                Required for backup creation
              </p>
            </div>
            <Badge
              color={binaryAvailability.pg_dump ? "success" : "error"}
              variant="light"
              size="sm"
            >
              {binaryAvailability.pg_dump ? "Available" : "Not found"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                psql
              </span>
              <p className="text-xs text-gray-400">
                Required for database restore
              </p>
            </div>
            <Badge
              color={binaryAvailability.psql ? "success" : "error"}
              variant="light"
              size="sm"
            >
              {binaryAvailability.psql ? "Available" : "Not found"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                backups/ directory
              </span>
              <p className="text-xs text-gray-400">
                Local storage for backup files
              </p>
            </div>
            <Badge color="success" variant="light" size="sm">
              Writable
            </Badge>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
