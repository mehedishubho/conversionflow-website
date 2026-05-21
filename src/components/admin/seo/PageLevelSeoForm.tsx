"use client";

import { useState, useEffect, useTransition } from "react";
import InlineSeoEditor from "./InlineSeoEditor";
import {
  getPageSeoOverrides,
  savePageSeoOverrides,
  getAllPageSeoOverrides,
} from "@/app/(admin)/actions/admin-page-seo";
import type { SeoOverrides } from "@/app/(admin)/actions/admin-page-seo";
import { pageSeo } from "@/lib/seo";

const PAGE_OPTIONS = Object.keys(pageSeo).map((key) => ({
  value: key,
  label: pageSeo[key as keyof typeof pageSeo].title.split(" - ")[0],
}));

export default function PageLevelSeoForm() {
  const [selectedPage, setSelectedPage] = useState<string>(PAGE_OPTIONS[0].value);
  const [overrides, setOverrides] = useState<SeoOverrides>({});
  const [allOverrides, setAllOverrides] = useState<Record<string, SeoOverrides>>({});
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getAllPageSeoOverrides();
        setAllOverrides(data);
        if (data[selectedPage]) {
          setOverrides(data[selectedPage]);
        }
      } catch {
        setMessage({ type: "error", text: "Failed to load page SEO overrides." });
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const handlePageChange = (pageKey: string) => {
    setSelectedPage(pageKey);
    setOverrides(allOverrides[pageKey] || {});
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await savePageSeoOverrides(selectedPage, overrides);
        setAllOverrides((prev) => ({ ...prev, [selectedPage]: overrides }));
        setMessage({ type: "success", text: "SEO overrides saved successfully." });
      } catch {
        setMessage({ type: "error", text: "Failed to save SEO overrides." });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-500 dark:text-gray-500">
          Loading page SEO settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Select Page
        </label>
        <select
          value={selectedPage}
          onChange={(e) => handlePageChange(e.target.value)}
          disabled={isPending}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {PAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Configure SEO overrides for the selected marketing page
        </p>
      </div>

      <InlineSeoEditor overrides={overrides} onChange={setOverrides} />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          SEO overrides for marketing pages. These take precedence over global SEO
          settings.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Overrides"}
        </button>
      </div>
    </div>
  );
}
