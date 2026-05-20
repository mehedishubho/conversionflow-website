"use client";

import { useState, useTransition, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import SerpPreview from "@/components/admin/seo/SerpPreview";
import SeoScore from "@/components/admin/seo/SeoScore";
import {
  saveSeoSettings,
  getSeoScore,
} from "@/app/(admin)/actions/admin-seo";
import { GENERAL_SEO_KEYS, type SeoSettingsData } from "@/lib/seo-keys";

interface GeneralSeoFormProps {
  initialData: SeoSettingsData;
}

function charBadgeColor(
  length: number,
  optimalMin: number,
  optimalMax: number,
  acceptMin: number,
  acceptMax: number
) {
  if (length >= optimalMin && length <= optimalMax) return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  if (length >= acceptMin && length <= acceptMax) return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
}

export default function GeneralSeoForm({ initialData }: GeneralSeoFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<SeoSettingsData>({
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    seo_canonical_url: "",
    seo_separator: "",
    seo_robots_default: "",
    seo_og_image: "",
    seo_auto_meta: "false",
    seo_lowercase_urls: "false",
    seo_trailing_slash: "false",
    ...initialData,
  });

  const [score, setScore] = useState<{
    filled: number;
    total: number;
    percentage: number;
  }>({
    filled: 0,
    total: 25,
    percentage: 0,
  });

  useEffect(() => {
    getSeoScore().then(setScore).catch(() => {});
  }, []);

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
        // Only save general SEO keys
        const generalData: SeoSettingsData = {};
        for (const key of GENERAL_SEO_KEYS) {
          generalData[key] = data[key] ?? "";
        }
        await saveSeoSettings(generalData);
        setMessage({ type: "success", text: "SEO settings saved." });

        // Refresh score after save
        const newScore = await getSeoScore();
        setScore(newScore);
      } catch {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      }
    });
  };

  const titleLength = (data.seo_title ?? "").length;
  const descLength = (data.seo_description ?? "").length;

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

      {/* SEO Score */}
      <ComponentCard title="SEO Completeness" desc="Overall SEO configuration progress across all sub-sections.">
        <SeoScore
          filled={score.filled}
          total={score.total}
          percentage={score.percentage}
        />
      </ComponentCard>

      {/* SERP Preview */}
      <ComponentCard title="Search Engine Preview" desc="How your site may appear in Google search results.">
        <SerpPreview
          title={data.seo_title ?? ""}
          description={data.seo_description ?? ""}
          url={data.seo_canonical_url ?? ""}
        />
      </ComponentCard>

      {/* General SEO Fields */}
      <ComponentCard
        title="General SEO Settings"
        desc="Configure website title, meta defaults, canonical URL, and Open Graph image."
      >
        <div className="space-y-5">
          {/* Website Title with character count */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                Meta Title
              </label>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${charBadgeColor(titleLength, 50, 60, 40, 70)}`}
              >
                {titleLength}
              </span>
            </div>
            <InputField
              placeholder="ConversionFlow"
              defaultValue={data.seo_title}
              onChange={(e) => updateField("seo_title", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Default website title used across all pages. Recommended 50-60 characters.
            </p>
          </div>

          {/* Meta Description with character count */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                Meta Description
              </label>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${charBadgeColor(descLength, 150, 160, 120, 180)}`}
              >
                {descLength}
              </span>
            </div>
            <textarea
              placeholder="Brief description of your website for search engines..."
              defaultValue={data.seo_description}
              onChange={(e) => updateField("seo_description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Default meta description for search engines. Recommended 150-160 characters.
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Keywords
            </label>
            <InputField
              placeholder="e.g. eCommerce, WooCommerce, tracking"
              defaultValue={data.seo_keywords}
              onChange={(e) => updateField("seo_keywords", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Comma-separated keywords describing your site.
            </p>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Canonical URL
            </label>
            <InputField
              placeholder="https://salesconversionflow.com"
              defaultValue={data.seo_canonical_url}
              onChange={(e) => updateField("seo_canonical_url", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Override default site URL for canonical tags.
            </p>
          </div>

          {/* Separator */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              SEO Separator
            </label>
            <InputField
              placeholder="|"
              defaultValue={data.seo_separator}
              onChange={(e) => updateField("seo_separator", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Character used to separate page title from site name.
            </p>
          </div>

          {/* Robots Default */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Robots Default Directive
            </label>
            <InputField
              placeholder="index, follow"
              defaultValue={data.seo_robots_default}
              onChange={(e) => updateField("seo_robots_default", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Default robots meta directive for all pages.
            </p>
          </div>

          {/* OG Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              OG Image URL
            </label>
            <InputField
              placeholder="https://salesconversionflow.com/og-image.png"
              defaultValue={data.seo_og_image}
              onChange={(e) => updateField("seo_og_image", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Default Open Graph image for social sharing.
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* URL & Auto Settings */}
      <ComponentCard
        title="URL & Auto Settings"
        desc="Configure URL formatting and automatic meta generation."
      >
        <div className="space-y-4">
          <Switch
            label="Auto Meta Generation"
            defaultChecked={data.seo_auto_meta === "true"}
            onChange={(checked) => handleToggle("seo_auto_meta", checked)}
          />
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Automatically generate meta tags from page content.
          </p>

          <Switch
            label="Lowercase URLs"
            defaultChecked={data.seo_lowercase_urls === "true"}
            onChange={(checked) => handleToggle("seo_lowercase_urls", checked)}
          />
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Convert all page URLs to lowercase for consistency.
          </p>

          <Switch
            label="Trailing Slash"
            defaultChecked={data.seo_trailing_slash === "true"}
            onChange={(checked) => handleToggle("seo_trailing_slash", checked)}
          />
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Add trailing slash to URLs (e.g. /about/ instead of /about).
          </p>
        </div>
      </ComponentCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save SEO Settings"}
        </Button>
      </div>
    </div>
  );
}
