"use client";

import React from "react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CurrencyToggleProps {
  currency: "BDT" | "USD";
  onCurrencyChange: (currency: "BDT" | "USD") => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function CurrencyToggle({
  currency,
  onCurrencyChange,
}: CurrencyToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      <button
        type="button"
        onClick={() => onCurrencyChange("BDT")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          currency === "BDT"
            ? "bg-brand-500 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <span className="mr-1">৳</span>
        BDT
      </button>
      <button
        type="button"
        onClick={() => onCurrencyChange("USD")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          currency === "USD"
            ? "bg-brand-500 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <span className="mr-1">$</span>
        USD
      </button>
    </div>
  );
}
