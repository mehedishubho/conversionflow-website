"use client";

import { useState } from "react";
import InputField from "@/components/form/input/InputField";

interface ManualPaymentFormProps {
  onSubmit: (transactionId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function ManualPaymentForm({
  onSubmit,
  isLoading,
  error,
}: ManualPaymentFormProps) {
  const [transactionId, setTransactionId] = useState("");

  const trimmed = transactionId.trim();
  const isValid = trimmed.length >= 4;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;
    await onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Transaction ID
        </label>
        <InputField
          type="text"
          placeholder="Enter your transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          error={!!error}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="inline-flex items-center justify-center w-full px-5 py-3.5 text-sm font-medium rounded-lg bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 mr-2"
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
            Processing...
          </>
        ) : (
          "Submit Order"
        )}
      </button>
    </form>
  );
}
