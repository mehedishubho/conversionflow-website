"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { Check } from "lucide-react";
import {
  FEATURE_CATALOG,
  PLATFORMS,
  PLATFORM_LABELS,
  type Platform,
  type FeatureMatrix,
} from "@/lib/config/feature-catalog";

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
  features: Record<string, Record<string, boolean>>;
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
  // Feature matrix state: feature key -> platform -> enabled
  // Initialize from plan features or empty matrix for all catalog features
  const [featureMatrix, setFeatureMatrix] = useState<FeatureMatrix>(() => {
    if (plan?.features && typeof plan.features === "object") {
      // Deserialize from DB nested format
      const matrix: FeatureMatrix = {};
      for (const entry of FEATURE_CATALOG) {
        const platformMap = plan.features[entry.key];
        if (typeof platformMap === "object" && platformMap !== null) {
          matrix[entry.key] = {} as Record<Platform, boolean>;
          for (const p of PLATFORMS) {
            matrix[entry.key][p] = !!(platformMap as Record<string, boolean>)[p];
          }
        } else {
          // Old flat format or missing: treat as all disabled
          matrix[entry.key] = {} as Record<Platform, boolean>;
          for (const p of PLATFORMS) {
            matrix[entry.key][p] = false;
          }
        }
      }
      return matrix;
    }
    // New plan: all features disabled
    const matrix: FeatureMatrix = {};
    for (const entry of FEATURE_CATALOG) {
      matrix[entry.key] = {} as Record<Platform, boolean>;
      for (const p of PLATFORMS) {
        matrix[entry.key][p] = false;
      }
    }
    return matrix;
  });
  const [activeChecked, setActiveChecked] = useState(
    plan?.active ?? true
  );
  const [actionError, setActionError] = useState<string | null>(null);

  // Derived: whether billing fields should show
  const showBilling = licenseType === "subscription";

  // Toggle a single platform checkbox
  const toggleFeaturePlatform = (featureKey: string, platform: Platform) => {
    setFeatureMatrix((prev) => ({
      ...prev,
      [featureKey]: {
        ...prev[featureKey],
        [platform]: !prev[featureKey]?.[platform],
      },
    }));
  };

  // Toggle all platforms for a feature (select all / deselect all)
  const toggleAllPlatforms = (featureKey: string) => {
    setFeatureMatrix((prev) => {
      const current = prev[featureKey];
      const allEnabled = PLATFORMS.every((p) => current?.[p]);
      return {
        ...prev,
        [featureKey]: {
          ...prev[featureKey],
          wordpress: !allEnabled,
          laravel: !allEnabled,
          shopify: !allEnabled,
          nextjs: !allEnabled,
        },
      };
    });
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
    // Only include features that have at least one platform enabled
    const activeFeatures: Record<string, Record<string, boolean>> = {};
    for (const [key, platforms] of Object.entries(featureMatrix)) {
      const hasEnabled = Object.values(platforms).some((v) => v);
      if (hasEnabled) {
        activeFeatures[key] = platforms;
      }
    }
    formData.set("features", JSON.stringify(activeFeatures));
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

      {/* Feature Flags - Platform Toggle Matrix (D-09, D-10, D-11) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Feature Flags (per platform)
        </label>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  All
                </th>
                {PLATFORMS.map((platform) => (
                  <th
                    key={platform}
                    className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    {PLATFORM_LABELS[platform]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {FEATURE_CATALOG.map((entry) => {
                const allEnabled = PLATFORMS.every(
                  (p) => featureMatrix[entry.key]?.[p]
                );
                return (
                  <tr
                    key={entry.key}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2.5">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {entry.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAllPlatforms(entry.key)}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded border transition-colors ${
                          allEnabled
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "border-gray-300 dark:border-gray-700 text-gray-400 hover:border-brand-300 dark:hover:border-brand-600"
                        }`}
                        title={allEnabled ? "Deselect all platforms" : "Select all platforms"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    {PLATFORMS.map((platform) => (
                      <td key={platform} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={!!featureMatrix[entry.key]?.[platform]}
                          onChange={() => toggleFeaturePlatform(entry.key, platform)}
                          className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Toggle features per platform. &quot;All&quot; column toggles all platforms at once.
          Features come from the catalog (no custom keys).
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
