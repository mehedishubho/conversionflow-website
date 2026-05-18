"use client";

import React from "react";

interface DateRangeSelectorProps {
  activeRange: string;
  onRangeChange: (range: string) => void;
}

const ranges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "year", label: "This Year" },
];

export default function DateRangeSelector({
  activeRange,
  onRangeChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => onRangeChange(r.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            activeRange === r.value
              ? "bg-brand-50 text-brand-500 border-brand-500 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500"
              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
