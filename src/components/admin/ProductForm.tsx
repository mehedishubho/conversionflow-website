"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ProductFormData {
  id: string;
  name: string;
  description: string | null;
  currentVersion: string | null;
}

interface ProductFormProps {
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string; productId?: string }>;
  product?: ProductFormData;
  submitButtonLabel?: string;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ProductForm({
  action,
  product,
  submitButtonLabel,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [actionError, setActionError] = useState<string | null>(null);

  const isEditMode = !!product;
  const label = submitButtonLabel ?? (isEditMode ? "Update Product" : "Create Product");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setActionError(result.error);
      } else if (result.success) {
        if (isEditMode) {
          setActionError(null);
          router.refresh();
        } else {
          router.push("/admin/products");
        }
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

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Name <span className="text-error-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. ConversionFlow"
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Brief description of the product..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-600 resize-y"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isPending || !name.trim()}
        >
          {isPending ? "Saving..." : label}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
