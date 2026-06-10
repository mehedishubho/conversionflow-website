"use client";

import React, { useState } from "react";
import Script from "next/script";
import { createGatewayOrder } from "@/app/(portal)/actions/checkout";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface BKashAPIFormProps {
  plan: string;
  currency: string;
  couponCode?: string;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  testMode?: boolean;
  onSuccess?: (orderId: string) => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function BKashAPIForm({
  plan,
  currency,
  couponCode,
  discountAmount,
  taxAmount,
  totalAmount,
  testMode = true,
  onSuccess,
}: BKashAPIFormProps) {
  const [bkashLoaded, setBkashLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // bKash SDK URL switches between sandbox and production
  const sdkUrl = testMode
    ? "https://scripts.pay.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js"
    : "https://scripts.pay.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout.js";

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create gateway order via server action
      const result = await createGatewayOrder({
        plan,
        gatewayId: "bkash_api",
        currency,
        couponCode: couponCode || undefined,
        discountAmount,
        taxAmount,
        totalAmount,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        setProcessing(false);
        return;
      }

      // Step 2: If we got a redirect URL (bkashURL), use bKash inline SDK
      if (result.redirectUrl) {
        // Check if bKash SDK is available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bKash = (window as any).bKash;

        if (bKash && typeof bKash.init === "function") {
          // Use inline SDK - redirect to bkashURL for payment
          window.location.href = result.redirectUrl;
        } else {
          // SDK not loaded, redirect directly
          window.location.href = result.redirectUrl;
        }
      } else if (result.orderId && onSuccess) {
        onSuccess(result.orderId);
      }
    } catch {
      setError("Failed to initialize bKash payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Load bKash SDK on-demand (D-24) */}
      <Script
        src={sdkUrl}
        strategy="lazyOnload"
        onLoad={() => setBkashLoaded(true)}
      />

      {error && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 text-sm">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handlePayment}
        disabled={processing}
        className="inline-flex items-center justify-center w-full px-5 py-3.5 text-sm font-medium rounded-lg bg-[#E2136E] text-white shadow-theme-xs hover:bg-[#c4115e] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing bKash payment...
          </>
        ) : (
          "Pay with bKash"
        )}
      </button>
      {error && (
        <button
          type="button"
          onClick={handlePayment}
          disabled={processing}
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Try Again
        </button>
      )}
      {!bkashLoaded && !processing && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Loading bKash SDK...
        </p>
      )}
    </div>
  );
}
