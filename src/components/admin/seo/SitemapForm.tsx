"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import {
  saveSeoSettings,
  pingSearchEngines,
  SITEMAP_SEO_KEYS,
  type SeoSettingsData,
} from "@/app/(admin)/actions/admin-seo";

interface SitemapFormProps {
  initialData: SeoSettingsData;
}

const CONTENT_TYPES = [
  { key: "seo_sitemap_pages", label: "Pages", defaultVal: "true" },
  { key: "seo_sitemap_blog", label: "Blog Posts", defaultVal: "true" },
  { key: "seo_sitemap_docs", label: "Documentation", defaultVal: "true" },
  { key: "seo_sitemap_landing", label: "Landing Pages", defaultVal: "false" },
] as const;

export default function SitemapForm({ initialData }: SitemapFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<SeoSettingsData>({
    seo_sitemap_enabled: "true",
    seo_sitemap_pages: "true",
    seo_sitemap_blog: "true",
    seo_sitemap_docs: "true",
    seo_sitemap_landing: "false",
    seo_sitemap_excludes: "",
    seo_sitemap_frequency: "weekly",
    seo_sitemap_auto_regenerate: "false",
    ...initialData,
  });

  const [lastGenerated, setLastGenerated] = useState<string>(
    initialData.seo_sitemap_last_generated ?? ""
  );
  const [pingStatus, setPingStatus] = useState<{
    google: boolean;
    bing: boolean;
  } | null>(null);

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string, checked: boolean) => {
    updateField(key, checked ? "true" : "false");
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const sitemapData: SeoSettingsData = {};
        for (const key of SITEMAP_SEO_KEYS) {
          sitemapData[key] = data[key] ?? "";
        }
        await saveSeoSettings(sitemapData);
        setMessage({ type: "success", text: "Sitemap settings saved." });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  const handleRegenerate = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const sitemapData: SeoSettingsData = {};
        for (const key of SITEMAP_SEO_KEYS) {
          sitemapData[key] = data[key] ?? "";
        }
        await saveSeoSettings(sitemapData);
        const pingResult = await pingSearchEngines();
        setLastGenerated(pingResult.timestamp);
        setPingStatus({ google: pingResult.google, bing: pingResult.bing });
        setMessage({
          type: "success",
          text: "Sitemap regenerated and search engines pinged.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  const autoRegenerateEnabled = data.seo_sitemap_auto_regenerate === "true";

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

      {/* Master Toggle */}
      <ComponentCard
        title="XML Sitemap Configuration"
        desc="Enable or disable XML sitemap generation for search engine crawlers."
      >
        <Switch
          label="Enable Sitemap Generation"
          defaultChecked={data.seo_sitemap_enabled !== "false"}
          onChange={(checked) => handleToggle("seo_sitemap_enabled", checked)}
        />
      </ComponentCard>

      {/* Content Type Toggles */}
      <ComponentCard
        title="Content Types"
        desc="Choose which content types to include in the XML sitemap."
      >
        <div className="space-y-4">
          {CONTENT_TYPES.map((ct) => (
            <div key={ct.key}>
              <Switch
                label={ct.label}
                defaultChecked={
                  (data[ct.key] ?? ct.defaultVal) === "true"
                }
                onChange={(checked) => handleToggle(ct.key, checked)}
              />
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* Regeneration Settings */}
      <ComponentCard
        title="Regeneration Settings"
        desc="Control when and how the sitemap is regenerated."
      >
        <div className="space-y-5">
          <div>
            <Switch
              label="Auto-regenerate on content change"
              defaultChecked={autoRegenerateEnabled}
              onChange={(checked) =>
                handleToggle("seo_sitemap_auto_regenerate", checked)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              When enabled, sitemap automatically regenerates when blog posts,
              docs, or pages are published or updated.
            </p>
          </div>

          {/* Frequency Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Sitemap Frequency
            </label>
            <select
              defaultValue={data.seo_sitemap_frequency ?? "weekly"}
              onChange={(e) =>
                updateField("seo_sitemap_frequency", e.target.value)
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              How often search engines should check for updates.
            </p>
          </div>

          {/* Exclude Patterns */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Exclude Patterns
            </label>
            <textarea
              placeholder="Enter one URL pattern per line to exclude from sitemap"
              defaultValue={data.seo_sitemap_excludes ?? ""}
              onChange={(e) =>
                updateField("seo_sitemap_excludes", e.target.value)
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              e.g. /admin/*, /api/* — one pattern per line.
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* Sitemap Status */}
      <ComponentCard
        title="Sitemap Status"
        desc="Current sitemap configuration status and manual controls."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Sitemap URL
            </label>
            <InputField
              defaultValue="https://salesconversionflow.com/sitemap.xml"
              disabled
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Auto-regeneration:
            </span>
            <span
              className={`text-sm font-medium ${
                autoRegenerateEnabled
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {autoRegenerateEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Last generated:
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {lastGenerated
                ? new Date(lastGenerated).toLocaleString()
                : "Never"}
            </span>
          </div>

          {pingStatus && (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span
                className={
                  pingStatus.google
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-500"
                }
              >
                Google: {pingStatus.google ? "Pinged" : "Failed"}
              </span>
              <span
                className={
                  pingStatus.bing
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-500"
                }
              >
                Bing: {pingStatus.bing ? "Pinged" : "Failed"}
              </span>
            </div>
          )}

          {/* Manual Regenerate Button */}
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isPending}
          >
            {isPending ? "Regenerating..." : "Regenerate Sitemap"}
          </Button>
        </div>
      </ComponentCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Sitemap Settings"}
        </Button>
      </div>
    </div>
  );
}
