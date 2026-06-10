"use client";

import React, { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  saveGatewayConfig,
  toggleGateway,
  toggleTestMode,
  testGatewayConnection,
  activateGateway,
} from "@/app/(admin)/actions/admin-settings";
import type { IPaymentGateway } from "@/modules/payments/domain/IPaymentGateway";
import type { GatewayConfig } from "@/modules/payments/domain/value-objects/GatewayConfig";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface GatewayCardProps {
  gateway: GatewayConfig;
  adapter: IPaymentGateway;
  onRefresh: () => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function GatewayCard({
  gateway,
  adapter,
  onRefresh,
}: GatewayCardProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [revealFields, setRevealFields] = useState<Record<string, boolean>>({});
  const [configValues, setConfigValues] = useState<Record<string, string>>(
    () => {
      const values: Record<string, string> = {};
      for (const [key, value] of Object.entries(gateway.config)) {
        values[key] = typeof value === "string" ? value : String(value ?? "");
      }
      return values;
    }
  );

  const statusBadge: Record<string, { color: "light" | "warning" | "success"; label: string }> = {
    draft: { color: "light", label: "Draft" },
    test: { color: "warning", label: "Test" },
    live: { color: "success", label: "Live" },
  };

  const configFields = adapter.getRequiredConfigFields();

  // Handlers
  const handleToggleGateway = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await toggleGateway(gateway.gatewayId, !gateway.active);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        onRefresh();
      }
    });
  };

  const handleToggleTestMode = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await toggleTestMode(gateway.gatewayId, !gateway.testMode);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        onRefresh();
      }
    });
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    startTransition(async () => {
      const result = await testGatewayConnection(gateway.gatewayId);
      setTestResult(result);
      setTesting(false);
    });
  };

  const handleActivate = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await activateGateway(gateway.gatewayId);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        onRefresh();
      }
    });
  };

  const handleSaveConfig = () => {
    setMessage(null);
    startTransition(async () => {
      const config: Record<string, unknown> = {};
      for (const field of configFields) {
        config[field.key] = configValues[field.key] ?? "";
      }
      const result = await saveGatewayConfig(gateway.gatewayId, config);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Configuration saved." });
        onRefresh();
      }
    });
  };

  const updateConfigValue = (key: string, value: string) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRevealField = (key: string) => {
    setRevealFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const badge = statusBadge[gateway.status] ?? statusBadge.draft;

  return (
    <ComponentCard title={adapter.name}>
      <div className="space-y-4">
        {/* Header: Status + Toggles */}
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="light" color={badge.color} size="sm">
            {badge.label}
          </Badge>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gateway.active}
                onChange={handleToggleGateway}
                disabled={isPending}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500" />
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {gateway.active ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gateway.testMode}
                onChange={handleToggleTestMode}
                disabled={isPending}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 dark:bg-gray-700 dark:peer-checked:bg-brand-500" />
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {gateway.testMode ? "Sandbox" : "Production"}
            </span>
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Test Connection */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing || isPending}
          >
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          {testResult && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                testResult.success
                  ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                  : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
              }`}
            >
              {testResult.message}
            </span>
          )}
        </div>

        {/* Activation flow */}
        {gateway.status === "draft" && (
          <Button size="sm" variant="primary" onClick={handleActivate} disabled={isPending}>
            Activate to Test
          </Button>
        )}
        {gateway.status === "test" && (
          <Button size="sm" variant="primary" onClick={handleActivate} disabled={isPending}>
            Go Live
          </Button>
        )}
        {gateway.status === "live" && (
          <span className="text-xs text-success-600 dark:text-success-400 font-medium">
            Gateway is live and processing payments
          </span>
        )}

        {/* Credentials section (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setCredentialsOpen(!credentialsOpen)}
            className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            {credentialsOpen ? "Hide" : "Show"} Credentials
          </button>

          {credentialsOpen && (
            <div className="mt-3 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              {configFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    {field.label}
                    {field.required && (
                      <span className="text-error-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <InputField
                      type={
                        field.type === "password" && !revealFields[field.key]
                          ? "password"
                          : "text"
                      }
                      placeholder={field.placeholder ?? ""}
                      defaultValue={configValues[field.key] ?? ""}
                      onChange={(e) =>
                        updateConfigValue(field.key, e.target.value)
                      }
                    />
                    {field.type === "password" && (
                      <button
                        type="button"
                        onClick={() => toggleRevealField(field.key)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {revealFields[field.key] ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveConfig} disabled={isPending}>
                  {isPending ? "Saving..." : "Save Credentials"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
