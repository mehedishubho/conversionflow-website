"use client";

import { useState, useTransition, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import {
  getSeoSettings,
  saveSeoSettings,
} from "@/app/(admin)/actions/admin-seo";
import { IMAGE_SEO_KEYS, type SeoSettingsData } from "@/lib/seo-keys";

const IMAGE_TOGGLES = [
  {
    key: "seo_image_auto_alt",
    label: "Auto ALT Text",
    desc: "Automatically generate alt text for images without alt attributes",
  },
  {
    key: "seo_image_webp",
    label: "WebP Conversion",
    desc: "Convert uploaded images to WebP format for smaller file sizes",
  },
  {
    key: "seo_image_lazy_loading",
    label: "Lazy Loading",
    desc: "Enable native lazy loading for images across the site",
  },
  {
    key: "seo_image_compression",
    label: "Image Compression",
    desc: "Apply lossless compression to reduce image file sizes",
  },
] as const;

export default function ImageSeoForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    seo_image_auto_alt: false,
    seo_image_webp: false,
    seo_image_lazy_loading: false,
    seo_image_compression: false,
  });

  useEffect(() => {
    setLoading(true);
    getSeoSettings([...IMAGE_SEO_KEYS])
      .then((data: SeoSettingsData) => {
        console.log("Loaded image SEO data:", data);
        const newToggles = {
          seo_image_auto_alt: data.seo_image_auto_alt === "true",
          seo_image_webp: data.seo_image_webp === "true",
          seo_image_lazy_loading: data.seo_image_lazy_loading === "true",
          seo_image_compression: data.seo_image_compression === "true",
        };
        console.log("Parsed toggles:", newToggles);
        setToggles(newToggles);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load image SEO settings." });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: string, checked: boolean) => {
    console.log("Toggle:", key, "to", checked);
    setToggles((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const data: SeoSettingsData = {};
        for (const key of IMAGE_SEO_KEYS) {
          data[key] = String(toggles[key] ?? false);
        }
        console.log("Saving image SEO data:", data);
        const result = await saveSeoSettings(data);
        console.log("Save result:", result);
        setMessage({ type: "success", text: "Image SEO settings saved." });
      } catch (error) {
        console.error("Save error:", error);
        setMessage({ type: "error", text: "Failed to save image SEO settings." });
      }
    });
  };

  if (loading) {
    return (
      <ComponentCard
        title="Image Optimization"
        desc="Configure image SEO settings. These toggles save configuration preferences for future infrastructure integration."
      >
        <div className="py-4 text-sm text-gray-400 dark:text-gray-500">
          Loading settings...
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard
      title="Image Optimization"
      desc="Configure image SEO settings. These toggles save configuration preferences for future infrastructure integration."
    >
      <div className="space-y-5">
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

        {IMAGE_TOGGLES.map((toggle) => (
          <div key={toggle.key} className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {toggle.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {toggle.desc}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Switch
                label={toggles[toggle.key] ? "Enabled" : "Disabled"}
                checked={toggles[toggle.key]}
                onChange={(checked) => handleToggle(toggle.key, checked)}
              />
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-500/5">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            These settings are configuration flags. Actual image optimization requires server-side integration.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Image Settings"}
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}
