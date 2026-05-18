"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import LicensesCSVExportButton from "@/components/admin/LicensesCSVExportButton";
import PiracyFlagBadge from "@/components/admin/PiracyFlagBadge";
import { retryLicenseSync } from "@/app/(admin)/actions/admin-licenses";
import type { LicenseRow, FlaggedLicense } from "@/app/(admin)/actions/admin-licenses";

type TabFilter = "all" | "flagged" | "sync_failures";

interface LicenseIntelligenceClientProps {
  allLicenses: LicenseRow[];
  syncFailures: LicenseRow[];
  flaggedLicenses: FlaggedLicense[];
}

const statusBadgeMap: Record<string, { color: "success" | "warning" | "error" | "light"; label: string }> = {
  active: { color: "success", label: "Active" },
  expired: { color: "warning", label: "Expired" },
  revoked: { color: "error", label: "Revoked" },
  suspended: { color: "light", label: "Suspended" },
};

export default function LicenseIntelligenceClient({
  allLicenses,
  syncFailures,
  flaggedLicenses,
}: LicenseIntelligenceClientProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [isPending, startTransition] = useTransition();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: allLicenses.length },
    { key: "flagged", label: "Flagged", count: flaggedLicenses.length },
    { key: "sync_failures", label: "Sync Failures", count: syncFailures.length },
  ];

  const currentLicenses =
    activeTab === "sync_failures"
      ? syncFailures
      : activeTab === "flagged"
        ? []
        : allLicenses;

  function handleRetry(orderId: string, licenseId: string) {
    setRetryingId(licenseId);
    startTransition(async () => {
      await retryLicenseSync(orderId);
      setRetryingId(null);
    });
  }

  return (
    <div>
      {/* Tab pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              activeTab === tab.key
                ? "bg-brand-50 text-brand-500 border-brand-500 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-400"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-white/[0.03] dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/[0.06]"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* CSV export in header area */}
      <div className="flex justify-end mb-4">
        <LicensesCSVExportButton
          rows={currentLicenses as unknown as Record<string, unknown>[]}
          filename={`licenses-${activeTab}`}
        />
      </div>

      {/* Flagged Tab Table */}
      {activeTab === "flagged" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  License Key
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Plan
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Flags
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {flaggedLicenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-400 dark:text-gray-500"
                  >
                    No piracy flags detected. All licenses are within normal
                    parameters.
                  </td>
                </tr>
              ) : (
                flaggedLicenses.map((lic) => {
                  // Show the highest severity flag badge
                  const severityOrder: Record<string, number> = {
                    high: 3,
                    medium: 2,
                    low: 1,
                  };
                  const topFlag = lic.flags.reduce((worst, flag) =>
                    severityOrder[flag.severity] >
                    severityOrder[worst.severity]
                      ? flag
                      : worst
                  );
                  return (
                    <tr
                      key={lic.licenseId}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                        {lic.licenseKey.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {lic.userName || "Unknown"}
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">
                        {lic.plan}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          <PiracyFlagBadge
                            severity={topFlag.severity}
                            type={topFlag.type}
                          />
                          {lic.flags.length > 1 && (
                            <Badge variant="light" color="light" size="sm">
                              +{lic.flags.length - 1} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/licenses/${lic.licenseId}`}
                          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* All / Sync Failures Table */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  License Key
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Plan
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Activations
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Created
                </th>
                {activeTab === "sync_failures" && (
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    Last Error
                  </th>
                )}
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLicenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "sync_failures" ? 8 : 7}
                    className="text-center py-8 text-gray-400 dark:text-gray-500"
                  >
                    {activeTab === "sync_failures"
                      ? "No sync failures. All licenses are up to date with the central API."
                      : "No licenses yet. Licenses will appear here after purchases are completed."}
                  </td>
                </tr>
              ) : (
                currentLicenses.map((lic) => {
                  const badge = statusBadgeMap[lic.status] ?? {
                    color: "light" as const,
                    label: lic.status,
                  };
                  return (
                    <tr
                      key={lic.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                        {lic.licenseKey.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {lic.userName || "Unknown"}
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">
                        {lic.plan}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="light" color={badge.color} size="sm">
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {lic.currentActivations ?? 0}/{lic.maxActivations ?? 1}
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {new Date(lic.createdAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      {activeTab === "sync_failures" && (
                        <td className="py-3 px-4 text-xs text-error-600 dark:text-error-400">
                          {lic.syncError || "Unknown error"}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/licenses/${lic.id}`}
                            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            View
                          </Link>
                          {activeTab === "sync_failures" && lic.orderId && (
                            <button
                              onClick={() => handleRetry(lic.orderId!, lic.id)}
                              disabled={isPending && retryingId === lic.id}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isPending && retryingId === lic.id
                                ? "Retrying..."
                                : "Retry Sync"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
