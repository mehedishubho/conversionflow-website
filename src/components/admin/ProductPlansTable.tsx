"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface PlanRow {
  id: string;
  name: string;
  slug: string;
  priceBDT: number;
  priceUSD: number;
  licenseType: string;
  billingCycle: string | null;
  billingDurationMonths: number | null;
  maxActivations: number | null;
  features: Record<string, Record<string, boolean>>;
  active: boolean | null;
  sortOrder: number | null;
}

interface ProductPlansTableProps {
  plans: PlanRow[];
  productId: string;
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatBilling(cycle: string | null, months: number | null): string {
  if (!cycle) return "N/A";
  const label = cycle.charAt(0).toUpperCase() + cycle.slice(1);
  if (months) return `${label} (${months}mo)`;
  return label;
}

function formatFeatures(features: Record<string, Record<string, boolean>> | Record<string, boolean>): string {
  if (!features || typeof features !== "object") return "—";

  // Check if nested format (first value is an object, not a boolean)
  const entries = Object.entries(features);
  if (entries.length === 0) return "—";

  const [firstKey] = entries[0];
  const firstEntry = features[firstKey];

  if (typeof firstEntry === "object" && firstEntry !== null) {
    // Nested format: count features with at least one platform enabled
    const enabled = entries.filter(([, platformMap]) =>
      typeof platformMap === "object" && platformMap !== null && Object.values(platformMap).some(Boolean)
    ).map(([key]) => key.replace(/_/g, " "));

    if (enabled.length === 0) return "—";
    if (enabled.length <= 3) return enabled.join(", ");
    return `${enabled.slice(0, 3).join(", ")} +${enabled.length - 3} more`;
  }

  // Legacy flat format (backward compat during migration)
  const enabled = entries
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/_/g, " "));

  if (enabled.length === 0) return "—";
  if (enabled.length <= 3) return enabled.join(", ");
  return `${enabled.slice(0, 3).join(", ")} +${enabled.length - 3} more`;
}

function licenseBadgeClasses(type: string): string {
  if (type === "lifetime") {
    return "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400";
  }
  return "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400";
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ProductPlansTable({
  plans,
  productId,
  onDelete,
}: ProductPlansTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    planId: string;
    planName: string;
  }>({ open: false, planId: "", planName: "" });
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await onDelete(deleteModal.planId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setDeleteModal({ open: false, planId: "", planName: "" });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Error display */}
      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Plan
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Pricing
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Type
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Billing
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Sites
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Features
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Active
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span>No plans yet.</span>
                    <Link
                      href={`/admin/products/${productId}/plans/new`}
                      className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                    >
                      Create a plan
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  {/* Plan name */}
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {plan.name}
                  </TableCell>

                  {/* Dual pricing */}
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Tk {plan.priceBDT.toLocaleString()}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                    <span>${plan.priceUSD}</span>
                  </TableCell>

                  {/* License type badge */}
                  <TableCell className="px-5 py-3 text-sm">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        licenseBadgeClasses(plan.licenseType)
                      )}
                    >
                      {plan.licenseType}
                    </span>
                  </TableCell>

                  {/* Billing */}
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {formatBilling(plan.billingCycle, plan.billingDurationMonths)}
                  </TableCell>

                  {/* Sites / Max activations */}
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {plan.maxActivations === 0 ? "Unlimited" : plan.maxActivations}
                  </TableCell>

                  {/* Features summary */}
                  <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                    {formatFeatures(plan.features)}
                  </TableCell>

                  {/* Active status */}
                  <TableCell className="px-5 py-3 text-sm">
                    <span
                      className={cn(
                        "inline-block w-2.5 h-2.5 rounded-full",
                        plan.active
                          ? "bg-success-500"
                          : "bg-error-500"
                      )}
                      title={plan.active ? "Active" : "Inactive"}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${productId}/plans/${plan.id}/edit`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                        title="Delete"
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            planId: plan.id,
                            planName: plan.name,
                          })
                        }
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => {
          setDeleteModal({ open: false, planId: "", planName: "" });
          setActionError(null);
        }}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Delete &ldquo;{deleteModal.planName}&rdquo;?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will permanently delete this plan. Existing licenses on this plan will not be affected. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDeleteModal({ open: false, planId: "", planName: "" });
              setActionError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete Plan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
