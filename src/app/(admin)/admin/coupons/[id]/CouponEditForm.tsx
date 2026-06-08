"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface PlanOption {
  id: string;
  productId: string;
  name: string;
}

interface CouponData {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  expiresAt: string;
  scope: "all" | "product" | "plan";
  applicableProductId: string | null;
  applicablePlanIds: string[];
}

interface CouponEditFormProps {
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  coupon: CouponData;
  products: ProductOption[];
  plans: PlanOption[];
}

export default function CouponEditForm({ action, coupon, products, plans }: CouponEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<"all" | "product" | "plan">(coupon.scope);
  const [selectedProductId, setSelectedProductId] = useState<string>(coupon.applicableProductId ?? "");
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>(coupon.applicablePlanIds);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    formData.set("couponId", coupon.id);
    if (scope === "product" && selectedProductId) {
      formData.set("applicableProductId", selectedProductId);
    }
    if (scope === "plan") {
      formData.delete("planIds");
      for (const planId of selectedPlanIds) {
        formData.append("planIds", planId);
      }
    }
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/coupons");
        router.refresh();
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Coupon Code <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="code"
          name="code"
          required
          minLength={3}
          defaultValue={coupon.code}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Discount Type <span className="text-error-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          required
          defaultValue={coupon.type}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="flat">Flat Amount (BDT)</option>
        </select>
      </div>

      {/* Value */}
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Discount Value <span className="text-error-500">*</span>
        </label>
        <input
          type="number"
          id="value"
          name="value"
          required
          min={1}
          max={100}
          defaultValue={coupon.value}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Applicability Scope */}
      <div>
        <label htmlFor="scope" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Applies To <span className="text-error-500">*</span>
        </label>
        <select
          id="scope"
          name="scope"
          value={scope}
          onChange={(e) => {
            setScope(e.target.value as "all" | "product" | "plan");
            setSelectedProductId("");
            setSelectedPlanIds([]);
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">All Products &amp; Plans</option>
          <option value="product">Specific Product</option>
          <option value="plan">Specific Plans</option>
        </select>
      </div>

      {/* Product selector */}
      {scope === "product" && (
        <div>
          <label htmlFor="applicableProductId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Select Product <span className="text-error-500">*</span>
          </label>
          <select
            id="applicableProductId"
            name="applicableProductId"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Plan checkboxes */}
      {scope === "plan" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Select Plans <span className="text-error-500">*</span>
          </label>
          <div className="space-y-2 rounded-lg border border-gray-300 p-3 dark:border-gray-700">
            {plans.map((p) => {
              const product = products.find((pr) => pr.id === p.productId);
              const label = product ? `${product.name} — ${p.name}` : p.name;
              const checked = selectedPlanIds.includes(p.id);
              return (
                <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedPlanIds((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((id) => id !== p.id)
                          : [...prev, p.id]
                      );
                    }}
                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-600"
                  />
                  {label}
                </label>
              );
            })}
            {plans.length === 0 && (
              <p className="text-xs text-gray-500">No active plans found.</p>
            )}
          </div>
        </div>
      )}

      {/* Min Order Amount */}
      <div>
        <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Minimum Order Amount (BDT)
        </label>
        <input
          type="number"
          id="minOrderAmount"
          name="minOrderAmount"
          min={0}
          defaultValue={coupon.minOrderAmount ?? ""}
          placeholder="Optional"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Max Uses */}
      <div>
        <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Max Uses
        </label>
        <input
          type="number"
          id="maxUses"
          name="maxUses"
          min={1}
          defaultValue={coupon.maxUses ?? ""}
          placeholder="Leave empty for unlimited"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Expires At */}
      <div>
        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Expiry Date
        </label>
        <input
          type="date"
          id="expiresAt"
          name="expiresAt"
          defaultValue={coupon.expiresAt || undefined}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/coupons")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
