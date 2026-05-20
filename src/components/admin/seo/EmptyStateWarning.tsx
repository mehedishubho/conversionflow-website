"use client";

import { AlertTriangle } from "lucide-react";

interface EmptyStateWarningProps {
  platformName: string;
  targetId: string;
  isConfigured: boolean;
}

export default function EmptyStateWarning({
  platformName,
  targetId,
  isConfigured,
}: EmptyStateWarningProps) {
  if (isConfigured) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6 dark:border-amber-500/20 dark:bg-amber-500/10">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {platformName} is not connected. Configure your tracking to start
          collecting data.
        </p>
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(targetId)
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-1 text-sm font-medium text-amber-700 underline hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Configure Now
        </button>
      </div>
    </div>
  );
}
