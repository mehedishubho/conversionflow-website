"use client";

import React, { useState, useTransition } from "react";
import {
  generateTransferCode,
  getTransferHistory,
} from "@/app/(portal)/actions/portal-transfers";
import Badge from "@/components/ui/badge/Badge";

interface TransferRecord {
  id: string;
  transferCode: string;
  fromUserId: string;
  toUserId: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  expiresAt: Date;
}

interface TransferSectionProps {
  licenseId: string;
  licenseStatus: string;
  transferHistory: TransferRecord[];
  monthlyLimit: number;
  currentUserId: string;
}

const STATUS_BADGE_MAP: Record<string, "success" | "warning" | "error" | "light"> = {
  completed: "success",
  pending: "warning",
  expired: "error",
};

export default function TransferSection({
  licenseId,
  licenseStatus,
  transferHistory,
  monthlyLimit,
  currentUserId,
}: TransferSectionProps) {
  const [transferCode, setTransferCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [history, setHistory] = useState<TransferRecord[]>(transferHistory);
  const [isPending, startTransition] = useTransition();

  // Only render for active licenses
  if (licenseStatus !== "active") {
    return null;
  }

  const pendingCount = history.filter(
    (t) => t.status === "pending" || t.status === "completed"
  ).length;

  const handleGenerateCode = () => {
    setError(null);
    setTransferCode(null);
    setShowConfirmModal(false);
    setLoading(true);

    startTransition(async () => {
      const result = await generateTransferCode(licenseId);
      if (result.code) {
        setTransferCode(result.code);
        // Refresh history
        const updatedHistory = await getTransferHistory(licenseId);
        if (Array.isArray(updatedHistory)) {
          setHistory(updatedHistory as TransferRecord[]);
        }
      } else {
        setError(result.error ?? "Failed to generate transfer code.");
      }
      setLoading(false);
    });
  };

  const handleCopyCode = () => {
    if (transferCode) {
      navigator.clipboard.writeText(transferCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Transfer info */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Transfer this license to another account by generating a transfer code.
      </p>

      {/* Generate button */}
      {!transferCode && (
        <div>
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || isPending}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading || isPending ? "Generating..." : "Generate Transfer Code"}
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Generated code display */}
      {transferCode && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm font-mono text-gray-800 dark:text-white/90 break-all">
              {transferCode}
            </code>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This code expires in 48 hours. Share it with the recipient via your
            preferred method.
          </p>
        </div>
      )}

      {/* Transfer limit indicator */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {pendingCount}/{monthlyLimit} transfers used this month
      </p>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Generate Transfer Code?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This will generate a transfer code that allows another user to claim
              ownership of this license. The code will be valid for 48 hours. All
              domain activations will be cleared upon transfer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Generate Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer history */}
      <div>
        <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-3">
          Transfer History
        </h4>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No transfers recorded for this license.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">
                    Date
                  </th>
                  <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">
                    Direction
                  </th>
                  <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">
                    Other Party
                  </th>
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => {
                  const date = new Date(record.createdAt);
                  const isSent = record.fromUserId === currentUserId;
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 dark:border-gray-800/50"
                    >
                      <td className="py-2 pr-4 text-gray-800 dark:text-white/90">
                        {date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-2 pr-4 text-gray-800 dark:text-white/90">
                        {isSent ? "Sent" : "Received"}
                      </td>
                      <td className="py-2 pr-4 text-gray-800 dark:text-white/90">
                        {record.toUserId ?? "Pending"}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant="light"
                          color={STATUS_BADGE_MAP[record.status] ?? "light"}
                          size="sm"
                        >
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
