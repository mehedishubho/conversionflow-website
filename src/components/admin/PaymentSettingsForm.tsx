"use client";

import React, { useState, useTransition, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import {
  savePaymentAccount,
  saveVATSettings,
  saveSSLSettings,
  getGateways,
  type PaymentAccountInput,
} from "@/app/(admin)/actions/admin-settings";
import GatewayCard from "@/components/admin/GatewayCard";
import WebhookEventLog from "@/components/admin/WebhookEventLog";
import { GatewayRegistry } from "@/modules/payments/application/GatewayRegistry";
import type { GatewayConfig } from "@/modules/payments/domain/value-objects/GatewayConfig";

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
    vatEnabled: boolean;
    sslCommerzEnabled: boolean;
    sslCommerz: {
      storeIdConfigured: boolean;
      storePasswordConfigured: boolean;
      sandbox: boolean;
      storeId: string;
      storePassword: string;
      dbSandbox: string;
    };
    licenseEngine: {
      totalLicenses: number;
      activeLicenses: number;
      migrationComplete: boolean;
    };
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
  const [activeTab, setActiveTab] = useState<"manual" | "automatic">("manual");
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Gateway state for Automatic tab
  const [gateways, setGateways] = useState<GatewayConfig[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);

  // VAT state
  const [vatRate, setVatRate] = useState(String(initialData.vatRate));
  const [vatMode, setVatMode] = useState(initialData.vatMode);
  const [vatEnabled, setVatEnabled] = useState(initialData.vatEnabled);

  // SSL Commerce state
  const [sslStoreId, setSslStoreId] = useState(initialData.sslCommerz?.storeId ?? "");
  const [sslStorePassword, setSslStorePassword] = useState(initialData.sslCommerz?.storePassword ?? "");
  const [sslSandbox, setSslSandbox] = useState(
    initialData.sslCommerz?.dbSandbox ? initialData.sslCommerz.dbSandbox !== "false" : (initialData.sslCommerz?.sandbox ?? true)
  );
  const [sslEnabled, setSslEnabled] = useState(initialData.sslCommerzEnabled);

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

  // Load gateways when switching to Automatic tab
  const loadGateways = () => {
    setGatewaysLoading(true);
    startTransition(async () => {
      try {
        const result = await getGateways();
        setGateways(result as unknown as GatewayConfig[]);
      } catch {
        setGateways([]);
      } finally {
        setGatewaysLoading(false);
      }
    });
  };

  useEffect(() => {
    if (activeTab === "automatic") {
      loadGateways();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  // Save all manual settings
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
          enabled: vatEnabled,
        });

        if (vatResult.error) {
          setSaveMessage({ type: "error", text: vatResult.error });
          return;
        }

        // Save payment accounts (skip SSL Commerce - saved separately)
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

        // Save SSL Commerce settings
        const sslResult = await saveSSLSettings({
          storeId: sslStoreId,
          storePassword: sslStorePassword,
          sandbox: sslSandbox,
          enabled: sslEnabled,
        });

        if (!sslResult.success) {
          setSaveMessage({ type: "error", text: "Error saving SSL Commerce settings." });
          return;
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

  // Get registered adapters for the Automatic tab
  const registry = GatewayRegistry.getInstance();
  const allAdapters = registry.getAll();

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "manual"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Manual Payments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("automatic")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "automatic"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Automatic Gateways
        </button>
      </div>

      {/* Manual Payments Tab */}
      {activeTab === "manual" && (
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
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vatEnabled}
                    onChange={(e) => setVatEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500" />
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {vatEnabled ? "VAT Enabled" : "VAT Disabled"}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${vatEnabled ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                  {vatEnabled ? "Active" : "Off"}
                </span>
              </div>
            </div>
          </ComponentCard>

          {/* Local License Engine Status */}
          <ComponentCard title="Local License Engine" desc="Self-contained licensing engine — all license operations are managed locally.">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-success-500 animate-pulse" />
                <span className="text-sm font-medium text-success-600 dark:text-success-400">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Licenses</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {initialData.licenseEngine.totalLicenses}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Licenses</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {initialData.licenseEngine.activeLicenses}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${initialData.licenseEngine.migrationComplete ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"}`}>
                  {initialData.licenseEngine.migrationComplete ? "Migration Complete" : "Migration Pending"}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  v3.0 Self-Contained Licensing
                </span>
              </div>
            </div>
          </ComponentCard>

          {/* Payment Method Cards */}
          {METHODS.map((method) => {
            const account = accounts[method.key];

            if (method.type === "ssl") {
              return (
                <ComponentCard key={method.key} title={`${method.label} Configuration`} desc="SSL Commerce payment gateway credentials. These take priority over environment variables.">
                  <div
                    className="space-y-4"
                    style={{ borderLeft: `3px solid ${method.color}`, paddingLeft: "16px" }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sslEnabled}
                          onChange={(e) => setSslEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500" />
                      </label>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {sslEnabled ? "SSL Commerce Enabled" : "SSL Commerce Disabled"}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sslEnabled ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {sslEnabled ? "Active" : "Off"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Store ID
                        </label>
                        <InputField
                          placeholder="Enter SSL Commerz Store ID"
                          defaultValue={sslStoreId}
                          onChange={(e) => setSslStoreId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Store Password
                        </label>
                        <InputField
                          type="password"
                          placeholder="Enter SSL Commerz Store Password"
                          defaultValue={sslStorePassword}
                          onChange={(e) => setSslStorePassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sslSandbox}
                          onChange={(e) => setSslSandbox(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500" />
                      </label>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {sslSandbox ? "Sandbox Mode" : "Production Mode"}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sslSandbox ? "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400" : "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"}`}>
                        {sslSandbox ? "Sandbox" : "Production"}
                      </span>
                    </div>
                  </div>
                </ComponentCard>
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
      )}

      {/* Automatic Gateways Tab */}
      {activeTab === "automatic" && (
        <div className="space-y-6">
          {gatewaysLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 mx-auto mb-4 border-2 border-brand-500 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading gateways...
              </p>
            </div>
          ) : (
            <>
              {/* Gateway Cards */}
              {allAdapters.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-12 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No gateway adapters registered. Ensure the payments module is initialized.
                  </p>
                </div>
              ) : (
                allAdapters.map((adapter) => {
                  const gateway = gateways.find(
                    (g) => g.gatewayId === adapter.gatewayId
                  );
                  // If no config in DB yet, create a default stub
                  const gatewayConfig: GatewayConfig = gateway ?? {
                    id: "",
                    gatewayId: adapter.gatewayId,
                    name: adapter.name,
                    config: {},
                    active: false,
                    testMode: true,
                    status: "draft",
                    priority: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  return (
                    <GatewayCard
                      key={adapter.gatewayId}
                      gateway={gatewayConfig}
                      adapter={adapter}
                      onRefresh={loadGateways}
                    />
                  );
                })
              )}

              {/* Webhook Event Log */}
              <WebhookEventLog
                gateways={allAdapters.map((a) => ({
                  gatewayId: a.gatewayId,
                  name: a.name,
                }))}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
