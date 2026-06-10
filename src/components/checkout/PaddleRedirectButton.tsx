"use client";

import React, { useState } from "react";
import { createGatewayOrder } from "@/app/(portal)/actions/checkout";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface PaddleRedirectButtonProps {
  plan: string;
  currency: string;
  couponCode?: string;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  onSuccess?: (orderId: string) => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function PaddleRedirectButton({
  plan,
  currency,
  couponCode,
  discountAmount,
  taxAmount,
  totalAmount,
  onSuccess,
}: PaddleRedirectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createGatewayOrder({
        plan,
        gatewayId: "paddle",
        currency,
        couponCode: couponCode || undefined,
        discountAmount,
        taxAmount,
        totalAmount,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else if (result.orderId && onSuccess) {
        onSuccess(result.orderId);
      }
    } catch {
      setError("Unable to connect to Paddle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 text-sm">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="inline-flex items-center justify-center w-full px-5 py-3.5 text-sm font-medium rounded-lg bg-[#3B82F6] text-white shadow-theme-xs hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to secure payment...
          </>
        ) : (
          "Pay with Paddle"
        )}
      </button>
      {error && (
        <button
          type="button"
          onClick={handlePayment}
          disabled={loading}
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
