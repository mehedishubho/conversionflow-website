"use client";

import React, { useState, useTransition } from "react";
import { claimTransferCode } from "@/app/(portal)/actions/portal-transfers";

interface TransferCodeInputProps {
  onClaimSuccess?: () => void;
}

const CODE_PATTERN = /^CF-XFER-[A-HJ-NP-Z2-9]{6}$/i;

export default function TransferCodeInput({
  onClaimSuccess,
}: TransferCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClaim = () => {
    setError(null);
    setSuccess(false);

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Please enter a transfer code.");
      return;
    }

    if (!CODE_PATTERN.test(trimmedCode)) {
      setError("Invalid transfer code format. Expected: CF-XFER-XXXXXX");
      return;
    }

    setLoading(true);
    startTransition(async () => {
      const result = await claimTransferCode(trimmedCode);
      if (result.success) {
        setSuccess(true);
        setCode("");
        onClaimSuccess?.();
      } else {
        setError(result.error ?? "Failed to claim transfer code.");
      }
      setLoading(false);
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-800 dark:text-white/90">
        Enter Transfer Code
      </label>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="CF-XFER-XXXXXX"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        style={{ fontFamily: "monospace" }}
      />
      <button
        type="button"
        onClick={handleClaim}
        disabled={loading || isPending || !code.trim()}
        className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading || isPending ? "Claiming..." : "Claim License"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          License transferred successfully!
        </p>
      )}
    </div>
  );
}
