"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  triggerCronJob,
  toggleCronJob,
} from "@/app/(admin)/actions/admin-cron-jobs";
import type { CronJobInfo } from "@/app/(admin)/actions/admin-cron-jobs";

export default function CronJobsTable({
  jobs,
  redisAvailable,
}: {
  jobs: CronJobInfo[];
  redisAvailable: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRunNow = (jobId: string) => {
    setActionError(null);
    setTriggeringId(jobId);
    startTransition(async () => {
      const result = await triggerCronJob(jobId);
      setTriggeringId(null);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleToggle = (jobId: string, enabled: boolean) => {
    setActionError(null);
    startTransition(async () => {
      const result = await toggleCronJob(jobId, enabled);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const statusColor = (status: CronJobInfo["status"]) => {
    switch (status) {
      case "running":
        return "warning";
      case "failed":
        return "error";
      default:
        return "success";
    }
  };

  return (
    <div className="space-y-4">
      {!redisAvailable && (
        <div className="p-4 rounded-lg bg-warning-50 text-warning-700 text-sm dark:bg-warning-500/10 dark:text-warning-400 border border-warning-200 dark:border-warning-500/20">
          <strong>Redis not configured.</strong> Cron job scheduling requires a
          Redis connection. The jobs below show their default schedules but are
          not currently active. Configure{" "}
          <code className="px-1 py-0.5 rounded bg-warning-100 dark:bg-warning-500/20 text-xs">
            REDIS_URL
          </code>{" "}
          in your environment to enable scheduled jobs.
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Job
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Schedule
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Last Run
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Next Run
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Enabled
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                {/* Job name + description */}
                <TableCell className="px-5 py-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {job.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs">
                    {job.description}
                  </div>
                </TableCell>

                {/* Schedule */}
                <TableCell className="px-5 py-3">
                  <code className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                    {job.cronPattern}
                  </code>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {job.cronHuman}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-3">
                  <Badge
                    variant="light"
                    color={statusColor(job.status)}
                    size="sm"
                  >
                    {job.status}
                  </Badge>
                </TableCell>

                {/* Last Run */}
                <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(job.lastRunAt)}
                </TableCell>

                {/* Next Run */}
                <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {job.enabled ? formatDate(job.nextRunAt) : "Not scheduled"}
                </TableCell>

                {/* Enabled toggle */}
                <TableCell className="px-5 py-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      role="switch"
                      aria-checked={job.enabled}
                      tabIndex={0}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        job.enabled
                          ? "bg-brand-500"
                          : "bg-gray-200 dark:bg-white/10"
                      }`}
                      onClick={() => handleToggle(job.id, !job.enabled)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleToggle(job.id, !job.enabled);
                        }
                      }}
                    >
                      <div
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-theme-sm transition-transform ${
                          job.enabled ? "translate-x-full" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-5 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunNow(job.id)}
                    disabled={
                      isPending || triggeringId === job.id || !redisAvailable
                    }
                  >
                    {triggeringId === job.id ? "Running..." : "Run Now"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
