"use client";

import { useState } from "react";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";

interface SeoOverrides {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  robots?: { index: boolean; follow: boolean };
  ogImage?: string;
  schemaType?: string;
}

interface InlineSeoEditorProps {
  overrides: SeoOverrides;
  onChange: (overrides: SeoOverrides) => void;
}

const SCHEMA_TYPES = [
  "None",
  "Article",
  "Product",
  "FAQ",
  "HowTo",
  "Review",
  "WebPage",
] as const;

export default function InlineSeoEditor({
  overrides,
  onChange,
}: InlineSeoEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateField = <K extends keyof SeoOverrides>(
    key: K,
    value: SeoOverrides[K]
  ) => {
    let processed = value;

    // Truncate excessively long values to prevent poor SEO
    if (key === 'title' && typeof value === 'string' && value.length > 60) {
      processed = value.slice(0, 60) as SeoOverrides[K];
    }
    if (key === 'description' && typeof value === 'string' && value.length > 160) {
      processed = value.slice(0, 160) as SeoOverrides[K];
    }

    onChange({ ...overrides, [key]: processed });
  };

  const updateRobots = (key: "index" | "follow", value: boolean) => {
    onChange({
      ...overrides,
      robots: { index: overrides.robots?.index ?? true, follow: overrides.robots?.follow ?? true, [key]: value },
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Page-Level SEO
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-brand-500 hover:text-brand-600 font-medium"
        >
          {isExpanded ? "Hide Advanced SEO" : "Show Advanced SEO"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <InputField
            label="SEO Title Override"
            value={overrides.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Override the page title for search engines"
            helperText={
              overrides.title
                ? `${overrides.title.length}/60 characters`
                : "Recommended: 50-60 characters"
            }
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              SEO Description Override
            </label>
            <textarea
              value={overrides.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Override the meta description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {overrides.description
                ? `${overrides.description.length}/160 characters`
                : "Recommended: 150-160 characters"}
            </p>
          </div>

          <InputField
            label="Canonical URL"
            value={overrides.canonicalUrl || ""}
            onChange={(e) => updateField("canonicalUrl", e.target.value)}
            placeholder="https://example.com/page"
            helperText="Set the canonical URL for this page"
          />

          <InputField
            label="Focus Keyword"
            value={overrides.focusKeyword || ""}
            onChange={(e) => updateField("focusKeyword", e.target.value)}
            placeholder="e.g., woocommerce tracking plugin"
            helperText="Set the focus keyword for this page"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Allow Indexing
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Allow search engines to index this page
                </p>
              </div>
              <Switch
                label=""
                checked={overrides.robots?.index ?? true}
                onChange={(checked) => updateRobots("index", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Allow Following
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Allow search engines to follow links on this page
                </p>
              </div>
              <Switch
                label=""
                checked={overrides.robots?.follow ?? true}
                onChange={(checked) => updateRobots("follow", checked)}
              />
            </div>
          </div>

          <InputField
            label="OG Image Override"
            value={overrides.ogImage || ""}
            onChange={(e) => updateField("ogImage", e.target.value)}
            placeholder="https://example.com/og-image.jpg"
            helperText="Override the Open Graph image for social sharing"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Schema Type
            </label>
            <select
              value={overrides.schemaType || "None"}
              onChange={(e) =>
                updateField(
                  "schemaType",
                  e.target.value === "None" ? undefined : e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            >
              {SCHEMA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Select the schema.org type for this page
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
