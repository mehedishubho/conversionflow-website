"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Info } from "lucide-react";

// Dynamic import kept for pattern consistency with other chart components
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CtrImpressionsChart() {
  return (
    <div>
      {/* Placeholder area */}
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-gray-300 dark:text-gray-600">
          --
        </p>
        <p className="text-sm text-gray-400 mt-2">
          No CTR or impression data available
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-500/5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Connect Google Search Console API for real CTR and impression data.
          Current values are placeholders.
        </p>
      </div>
    </div>
  );
}
