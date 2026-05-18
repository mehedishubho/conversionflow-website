"use client";

import React from "react";
import { Download } from "lucide-react";
import { exportToCSV, type CSVColumn } from "@/lib/utils/csv-export";

const csvColumns: CSVColumn[] = [
  { header: "License Key", accessor: (r) => r.licenseKey as string },
  { header: "Customer", accessor: (r) => (r.userName as string) || "Unknown" },
  { header: "Plan", accessor: (r) => r.plan as string },
  { header: "Status", accessor: (r) => r.status as string },
  { header: "Activations", accessor: (r) => `${r.currentActivations}/${r.maxActivations}` },
  { header: "Created", accessor: (r) => new Date(r.createdAt as Date).toLocaleDateString("en-BD") },
];

interface LicensesCSVExportButtonProps {
  rows: Record<string, unknown>[];
  filename: string;
}

export default function LicensesCSVExportButton({ rows, filename }: LicensesCSVExportButtonProps) {
  const handleClick = () => {
    exportToCSV(csvColumns, rows, filename);
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
