"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

interface CouponCreateFormProps {
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string; couponId?: string }>;
}

export default function CouponCreateForm({ action }: CouponCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
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
      {/* Error display */}
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
          placeholder="e.g. SUMMER2025"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Will be converted to uppercase. Minimum 3 characters.
        </p>
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
          defaultValue="percentage"
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
          placeholder="e.g. 20"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          For percentage: 1-100. For flat: amount in BDT.
        </p>
      </div>

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
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Leave empty for no expiry.
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          size="default"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create Coupon"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => router.push("/admin/coupons")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
