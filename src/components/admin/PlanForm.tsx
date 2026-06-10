"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { Plus, X } from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface PlanData {
  id: string;
  name: string;
  description: string | null;
  priceBDT: number;
  priceUSD: number;
  licenseType: string;
  billingCycle: string | null;
  billingDurationMonths: number | null;
  maxActivations: number;
  features: Record<string, boolean>;
  sortOrder: number;
  active: boolean;
}

interface PlanFormProps {
  productId: string;
  action: (
    productId: string,
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string; planId?: string }>;
  plan?: PlanData;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function PlanForm({ productId, action, plan }: PlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!plan;

  // Controlled state
  const [licenseType, setLicenseType] = useState<string>(
    plan?.licenseType ?? "subscription"
  );
  const [billingCycle, setBillingCycle] = useState<string>(
    plan?.billingCycle ?? "yearly"
  );
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(
    plan?.features ?? {}
  );
  const [newFlagKey, setNewFlagKey] = useState("");
  const [activeChecked, setActiveChecked] = useState(
    plan?.active ?? true
  );
  const [actionError, setActionError] = useState<string | null>(null);

  // Derived: whether billing fields should show
  const showBilling = licenseType === "subscription";

  // Feature flag management
  const addFeatureFlag = () => {
    const key = newFlagKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!key) return;
    if (key in featureFlags) return;
    setFeatureFlags((prev) => ({ ...prev, [key]: true }));
    setNewFlagKey("");
  };

  const removeFeatureFlag = (key: string) => {
    setFeatureFlags((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleFeatureFlag = (key: string) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle license type change — clear billing when switching to lifetime
  const handleLicenseTypeChange = (value: string) => {
    setLicenseType(value);
    if (value === "lifetime") {
      setBillingCycle("");
    }
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError(null);

    // Client-side validation for subscription plans
    if (licenseType === "subscription" && !billingCycle) {
      setActionError("Subscription plans require a billing cycle.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Override controlled fields that may differ from raw form inputs
    formData.set("licenseType", licenseType);
    formData.set("features", JSON.stringify(featureFlags));
    formData.set("active", activeChecked ? "true" : "false");

    if (licenseType === "subscription" && billingCycle) {
      formData.set("billingCycle", billingCycle);
    } else {
      formData.delete("billingCycle");
      formData.delete("billingDurationMonths");
    }

    startTransition(async () => {
      const result = await action(productId, formData);
      if (result.error) {
        setActionError(result.error);
      } else if (result.success) {
        router.push(`/admin/products/${productId}/plans`);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error display */}
      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      {/* Hidden features input (overridden on submit, but needed for form structure) */}

      {/* Plan Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Plan Name <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={plan?.name ?? ""}
          placeholder="e.g. Starter, Professional, Agency"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={plan?.description ?? ""}
          placeholder="Brief description of this plan..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600 resize-y"
        />
      </div>

      {/* Pricing row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="priceBDT"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Price (BDT) <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="priceBDT"
            name="priceBDT"
            required
            min={0}
            defaultValue={plan?.priceBDT ?? ""}
            placeholder="e.g. 3499"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
          />
        </div>
        <div>
          <label
            htmlFor="priceUSD"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Price (USD) <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="priceUSD"
            name="priceUSD"
            required
            min={0}
            defaultValue={plan?.priceUSD ?? ""}
            placeholder="e.g. 29"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
          />
        </div>
      </div>

      {/* License Type */}
      <div>
        <label
          htmlFor="licenseType"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          License Type <span className="text-error-500">*</span>
        </label>
        <select
          id="licenseType"
          value={licenseType}
          onChange={(e) => handleLicenseTypeChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
        >
          <option value="subscription">Subscription</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      {/* Conditional billing fields — only for subscription */}
      {showBilling && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800">
          <div>
            <label
              htmlFor="billingCycle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Billing Cycle <span className="text-error-500">*</span>
            </label>
            <select
              id="billingCycle"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="billingDurationMonths"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Duration (months)
            </label>
            <input
              type="number"
              id="billingDurationMonths"
              name="billingDurationMonths"
              min={1}
              defaultValue={plan?.billingDurationMonths ?? ""}
              placeholder="e.g. 12"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
            />
          </div>
        </div>
      )}

      {/* Max Activations */}
      <div>
        <label
          htmlFor="maxActivations"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Max Sites (0 = unlimited) <span className="text-error-500">*</span>
        </label>
        <input
          type="number"
          id="maxActivations"
          name="maxActivations"
          required
          min={0}
          defaultValue={plan?.maxActivations ?? 1}
          placeholder="e.g. 3"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
        />
      </div>

      {/* Sort Order + Active row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="sortOrder"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            min={0}
            defaultValue={plan?.sortOrder ?? 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600"
          />
        </div>
        <div className="flex items-center gap-3 pt-7">
          <input
            type="checkbox"
            id="active"
            checked={activeChecked}
            onChange={(e) => setActiveChecked(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <label
            htmlFor="active"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Active
          </label>
        </div>
      </div>

      {/* Feature Flags section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Feature Flags
        </label>

        <div className="space-y-2">
          {Object.entries(featureFlags).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleFeatureFlag(key)}
                className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="flex-1 text-sm text-gray-800 dark:text-white/90 font-mono">
                {key}
              </span>
              <button
                type="button"
                onClick={() => removeFeatureFlag(key)}
                className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                title="Remove flag"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new flag */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFlagKey}
            onChange={(e) => setNewFlagKey(e.target.value)}
            placeholder="new_feature_name"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600 font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeatureFlag();
              }
            }}
          />
          <button
            type="button"
            onClick={addFeatureFlag}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Feature names are lowercase with underscores. Toggle each flag on/off.
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
        >
          {isPending
            ? "Saving..."
            : isEditMode
              ? "Update Plan"
              : "Create Plan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/products/${productId}/plans`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
