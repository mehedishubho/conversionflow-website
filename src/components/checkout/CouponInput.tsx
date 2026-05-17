"use client";

import { useState } from "react";
import InputField from "@/components/form/input/InputField";

interface CouponInputProps {
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  appliedCode: string | null;
  appliedDiscount: number;
  error: string | null;
  isLoading: boolean;
}

export default function CouponInput({
  onApply,
  onRemove,
  appliedCode,
  appliedDiscount,
  error,
  isLoading,
}: CouponInputProps) {
  const [code, setCode] = useState("");

  async function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    await onApply(trimmed);
  }

  function handleRemove() {
    setCode("");
    onRemove();
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
        Coupon Code
      </h3>

      {appliedCode ? (
        /* Applied state */
        <div className="flex items-center justify-between rounded-lg bg-success-50 px-4 py-3 dark:bg-success-500/10">
          <span className="text-sm font-medium text-success-600 dark:text-success-500">
            Coupon {appliedCode} applied! You save {appliedDiscount.toLocaleString("en-BD")} BDT
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-error-500 hover:text-error-600 dark:text-error-400"
          >
            Remove Coupon
          </button>
        </div>
      ) : (
        /* Input state */
        <div className="flex gap-3">
          <div className="flex-1">
            <InputField
              type="text"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={!!error}
            />
          </div>
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading || !code.trim()}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              "Apply Coupon"
            )}
          </button>
        </div>
      )}

      {/* Error message */}
      {error && !appliedCode && (
        <p className="text-sm text-error-500">{error}</p>
      )}
    </div>
  );
}
