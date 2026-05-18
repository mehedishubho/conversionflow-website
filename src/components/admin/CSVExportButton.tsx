"use client";

import React from "react";
import { Download } from "lucide-react";
import { exportToCSV, type CSVColumn } from "@/lib/utils/csv-export";

interface CSVExportButtonProps {
  columns: CSVColumn[];
  rows: Record<string, unknown>[];
  filename: string;
}

export default function CSVExportButton({
  columns,
  rows,
  filename,
}: CSVExportButtonProps) {
  const handleClick = () => {
    exportToCSV(columns, rows, filename);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
