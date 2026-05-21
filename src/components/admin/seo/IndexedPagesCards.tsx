import React from "react";
import { Eye, Users, Activity, AlertTriangle, Info } from "lucide-react";

interface IndexedPagesCardsProps {
  ga4Data: {
    activeUsers: string;
    pageviews: string;
    sessions: string;
  };
  errorCount: number;
}

const cardConfig = [
  { key: "pageviews", label: "Pageviews", icon: Eye, getValue: (d: IndexedPagesCardsProps["ga4Data"]) => d.pageviews },
  { key: "activeUsers", label: "Active Users", icon: Users, getValue: (d: IndexedPagesCardsProps["ga4Data"]) => d.activeUsers },
  { key: "sessions", label: "Sessions", icon: Activity, getValue: (d: IndexedPagesCardsProps["ga4Data"]) => d.sessions },
] as const;

export default function IndexedPagesCards({ ga4Data, errorCount }: IndexedPagesCardsProps) {
  const isPlaceholder = ga4Data.activeUsers === "--" && ga4Data.pageviews === "--" && ga4Data.sessions === "--";

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((config) => {
          const Icon = config.icon;
          const value = config.getValue(ga4Data);
          const isDash = value === "--";

          return (
            <div
              key={config.key}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Icon className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.label}
                </span>
                <h4 className={`mt-2 text-title-sm font-bold ${
                  isDash
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-800 dark:text-white/90"
                }`}>
                  {value}
                </h4>
              </div>
            </div>
          );
        })}

        {/* 404 Errors card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <AlertTriangle className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              404 Errors
            </span>
            <h4 className={`mt-2 text-title-sm font-bold ${
              errorCount === 0
                ? "text-green-600 dark:text-green-400"
                : "text-gray-800 dark:text-white/90"
            }`}>
              {errorCount.toString()}
            </h4>
          </div>
        </div>
      </div>

      {/* GA4 not configured banner */}
      {isPlaceholder && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-500/5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Configure GA4 in Tracking settings for real analytics data.
            Current values are placeholders.
          </p>
        </div>
      )}
    </div>
  );
}
