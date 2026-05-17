"use client";

import React, { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import {
  savePaymentAccount,
  saveVATSettings,
  type PaymentAccountInput,
} from "@/app/(admin)/actions/admin-settings";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface PaymentAccountRow {
  id: string;
  method: string;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  branch: string | null;
  routingNumber: string | null;
  instructions: string | null;
  active: boolean | null;
}

interface PaymentSettingsFormProps {
  initialData: {
    paymentAccounts: PaymentAccountRow[];
    vatRate: number;
    vatMode: string;
  };
}

// ──────────────────────────────────────────────
// Method Config
// ──────────────────────────────────────────────

interface MethodConfig {
  key: string;
  label: string;
  color: string;
  type: "mobile" | "bank" | "ssl";
}

const METHODS: MethodConfig[] = [
  { key: "bkash", label: "bKash", color: "#E2136E", type: "mobile" },
  { key: "nagad", label: "Nagad", color: "#F6921E", type: "mobile" },
  { key: "rocket", label: "Rocket", color: "#8C3494", type: "mobile" },
  {
    key: "bank_transfer",
    label: "Bank Transfer",
    color: "#667085",
    type: "bank",
  },
  {
    key: "ssl_commerz",
    label: "SSL Commerce",
    color: "#1A5F9E",
    type: "ssl",
  },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function PaymentSettingsForm({
  initialData,
}: PaymentSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // VAT state
  const [vatRate, setVatRate] = useState(String(initialData.vatRate));
  const [vatMode, setVatMode] = useState(initialData.vatMode);

  // Payment accounts state -- keyed by method
  const [accounts, setAccounts] = useState<Record<string, PaymentAccountInput>>(
    () => {
      const map: Record<string, PaymentAccountInput> = {};
      for (const method of METHODS) {
        const existing = initialData.paymentAccounts.find(
          (a) => a.method === method.key
        );
        map[method.key] = existing
          ? {
              method: existing.method,
              accountName: existing.accountName,
              accountNumber: existing.accountNumber,
              bankName: existing.bankName ?? "",
              branch: existing.branch ?? "",
              routingNumber: existing.routingNumber ?? "",
              instructions: existing.instructions ?? "",
              active: existing.active ?? false,
            }
          : {
              method: method.key,
              accountName: "",
              accountNumber: "",
              bankName: "",
              branch: "",
              routingNumber: "",
              instructions: "",
              active: false,
            };
      }
      return map;
    }
  );

  // Update a field in a method account
  const updateField = (
    method: string,
    field: keyof PaymentAccountInput,
    value: string | boolean
  ) => {
    setAccounts((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value,
      },
    }));
  };

  // Save all
  const handleSave = () => {
    setSaveMessage(null);

    const rateNum = parseFloat(vatRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setSaveMessage({ type: "error", text: "VAT rate must be between 0 and 100." });
      return;
    }

    startTransition(async () => {
      try {
        // Save VAT settings
        const vatResult = await saveVATSettings({
          rate: rateNum,
          mode: vatMode as "inclusive" | "exclusive",
        });

        if (vatResult.error) {
          setSaveMessage({ type: "error", text: vatResult.error });
          return;
        }

        // Save payment accounts (skip SSL Commerce - info only)
        for (const method of METHODS) {
          if (method.type === "ssl") continue;
          const account = accounts[method.key];
          if (!account.accountName && !account.accountNumber) continue; // Skip empty
          const result = await savePaymentAccount(account);
          if (result.error) {
            setSaveMessage({
              type: "error",
              text: `Error saving ${method.label}: ${result.error}`,
            });
            return;
          }
        }

        setSaveMessage({ type: "success", text: "All settings saved successfully." });
      } catch {
        setSaveMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  const vatModeOptions = [
    { value: "exclusive", label: "Exclusive" },
    { value: "inclusive", label: "Inclusive" },
  ];

  return (
    <div className="space-y-6">
      {/* Status message */}
      {saveMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            saveMessage.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* VAT Configuration */}
      <ComponentCard title="VAT Configuration" desc="Configure VAT rate and calculation mode for all orders.">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Rate (%)
            </label>
            <InputField
              type="number"
              placeholder="15"
              defaultValue={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              min="0"
              max="100"
              step={0.5}
            />
          </div>
          <div className="w-40">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Mode
            </label>
            <Select
              options={vatModeOptions}
              placeholder="Select mode"
              onChange={setVatMode}
              defaultValue={vatMode}
            />
          </div>
        </div>
      </ComponentCard>

      {/* Payment Method Cards */}
      {METHODS.map((method) => {
        const account = accounts[method.key];

        if (method.type === "ssl") {
          return (
            <div
              key={method.key}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ borderLeft: `3px solid ${method.color}` }}
              >
                <div>
                  <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {method.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    SSL Commerce credentials are configured via environment variables.
                    No editable fields here.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <ComponentCard key={method.key} title={`${method.label} Configuration`}>
            <div
              className="space-y-4"
              style={{ borderLeft: `3px solid ${method.color}`, paddingLeft: "16px" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Account Name
                  </label>
                  <InputField
                    placeholder="Account holder name"
                    defaultValue={account.accountName}
                    onChange={(e) =>
                      updateField(method.key, "accountName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Account Number
                  </label>
                  <InputField
                    placeholder="Account number"
                    defaultValue={account.accountNumber}
                    onChange={(e) =>
                      updateField(method.key, "accountNumber", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Bank-specific fields */}
              {method.type === "bank" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Bank Name
                    </label>
                    <InputField
                      placeholder="Bank name"
                      defaultValue={account.bankName ?? ""}
                      onChange={(e) =>
                        updateField(method.key, "bankName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Branch
                    </label>
                    <InputField
                      placeholder="Branch name"
                      defaultValue={account.branch ?? ""}
                      onChange={(e) =>
                        updateField(method.key, "branch", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Routing Number
                    </label>
                    <InputField
                      placeholder="Routing number"
                      defaultValue={account.routingNumber ?? ""}
                      onChange={(e) =>
                        updateField(method.key, "routingNumber", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Payment Instructions
                </label>
                <InputField
                  placeholder="Instructions for customers (e.g., Send money to the above number)"
                  defaultValue={account.instructions ?? ""}
                  onChange={(e) =>
                    updateField(method.key, "instructions", e.target.value)
                  }
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={account.active}
                    onChange={(e) =>
                      updateField(method.key, "active", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500" />
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Active
                </span>
              </div>
            </div>
          </ComponentCard>
        );
      })}

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
