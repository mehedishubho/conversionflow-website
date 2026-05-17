"use client";

import { useState } from "react";

interface PaymentInstructionsProps {
  method: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  bankName?: string;
  branch?: string;
  routingNumber?: string;
  amountToSend: number;
}

const methodColors: Record<string, string> = {
  bkash: "#E2136E",
  nagad: "#F6921E",
  rocket: "#8C3494",
  bank_transfer: "#667085",
  ssl_commerz: "#1A5F9E",
};

const methodLabels: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
  ssl_commerz: "SSL Commerce",
};

export default function PaymentInstructions({
  method,
  accountName,
  accountNumber,
  instructions,
  bankName,
  branch,
  routingNumber,
  amountToSend,
}: PaymentInstructionsProps) {
  const [copied, setCopied] = useState(false);
  const color = methodColors[method] || "#667085";
  const label = methodLabels[method] || method;

  function handleCopy() {
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatBDT(amount: number): string {
    return amount.toLocaleString("en-BD") + " BDT";
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: color }}
        >
          {label.charAt(0)}
        </div>
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Payment Instructions
        </h3>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 space-y-4">
        {/* Amount to send */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 block">
            Amount to Send
          </span>
          <span className="text-xl font-bold text-gray-800 dark:text-white/90">
            {formatBDT(amountToSend)}
          </span>
        </div>

        {/* Account details */}
        <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Account Name
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
              {accountName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Account Number
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-gray-800 dark:text-white/90">
                {accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Bank-specific fields */}
          {bankName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Bank Name
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {bankName}
              </span>
            </div>
          )}

          {branch && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Branch
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {branch}
              </span>
            </div>
          )}

          {routingNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Routing Number
              </span>
              <span className="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
                {routingNumber}
              </span>
            </div>
          )}
        </div>

        {/* Instructions text */}
        {instructions && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {instructions}
          </p>
        )}
      </div>
    </div>
  );
}
