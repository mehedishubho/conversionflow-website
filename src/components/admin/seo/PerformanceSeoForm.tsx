"use client";

import { useState, useEffect, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import {
  getSeoSettings,
  saveSeoSettings,
} from "@/app/(admin)/actions/admin-seo";
import { PERFORMANCE_SEO_KEYS, type SeoSettingsData } from "@/lib/seo-keys";

const PERF_KEYS = [
  "seo_perf_critical_css",
  "seo_perf_js_defer",
  "seo_perf_minification",
  "seo_perf_cdn_url",
  "seo_perf_cache_settings",
] as const;

interface CacheSettings {
  maxAge: string;
  staleWhileRevalidate: string;
}

function parseCacheSettings(raw: string): CacheSettings {
  try {
    const parsed = JSON.parse(raw);
    return {
      maxAge: String(parsed.maxAge ?? "3600"),
      staleWhileRevalidate: String(parsed.staleWhileRevalidate ?? "86400"),
    };
  } catch {
    return { maxAge: "3600", staleWhileRevalidate: "86400" };
  }
}

function isValidUrl(value: string): boolean {
  if (!value) return true; // empty is allowed (means no CDN)
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function PerformanceSeoForm() {
  const [criticalCss, setCriticalCss] = useState(false);
  const [jsDefer, setJsDefer] = useState(false);
  const [minification, setMinification] = useState(false);
  const [cdnUrl, setCdnUrl] = useState("");
  const [cacheMaxAge, setCacheMaxAge] = useState("3600");
  const [cacheStaleWhileRevalidate, setCacheStaleWhileRevalidate] =
    useState("86400");

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSeoSettings([...PERF_KEYS])
      .then((data: SeoSettingsData) => {
        if (cancelled) return;
        setCriticalCss(data.seo_perf_critical_css === "true");
        setJsDefer(data.seo_perf_js_defer === "true");
        setMinification(data.seo_perf_minification === "true");
        setCdnUrl(data.seo_perf_cdn_url ?? "");
        const cache = parseCacheSettings(data.seo_perf_cache_settings ?? "");
        setCacheMaxAge(cache.maxAge);
        setCacheStaleWhileRevalidate(cache.staleWhileRevalidate);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = () => {
    setMessage(null);

    if (!isValidUrl(cdnUrl)) {
      setMessage({
        type: "error",
        text: "Invalid CDN URL. Please enter a valid URL (e.g. https://cdn.example.com).",
      });
      return;
    }

    const data: SeoSettingsData = {
      seo_perf_critical_css: String(criticalCss),
      seo_perf_js_defer: String(jsDefer),
      seo_perf_minification: String(minification),
      seo_perf_cdn_url: cdnUrl.trim(),
      seo_perf_cache_settings: JSON.stringify({
        maxAge: cacheMaxAge,
        staleWhileRevalidate: cacheStaleWhileRevalidate,
      }),
    };

    startTransition(async () => {
      try {
        await saveSeoSettings(data);
        setMessage({
          type: "success",
          text: "Performance settings saved.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  if (loading) {
    return (
      <ComponentCard
        title="Performance Optimization"
        desc="Configure performance settings. These toggles save configuration preferences for build-time optimization."
      >
        <div className="py-4 text-sm text-gray-400">Loading settings...</div>
      </ComponentCard>
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

      <ComponentCard
        title="Performance Optimization"
        desc="Configure performance settings. These toggles save configuration preferences for build-time optimization."
      >
        <div className="space-y-6">
          {/* Toggle Section */}
          <div className="space-y-4">
            <Switch
              label="Critical CSS Extraction"
              defaultChecked={criticalCss}
              onChange={(checked) => setCriticalCss(checked)}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2 ml-14">
              Extract and inline critical CSS for above-the-fold content.
            </p>

            <Switch
              label="JS Defer Loading"
              defaultChecked={jsDefer}
              onChange={(checked) => setJsDefer(checked)}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2 ml-14">
              Defer non-critical JavaScript execution.
            </p>

            <Switch
              label="HTML/CSS Minification"
              defaultChecked={minification}
              onChange={(checked) => setMinification(checked)}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2 ml-14">
              Minify HTML and CSS output for smaller page sizes.
            </p>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard
        title="CDN Configuration"
        desc="Set your CDN URL for static asset delivery."
      >
        <div>
          <InputField
            type="text"
            placeholder="https://cdn.example.com"
            defaultValue={cdnUrl}
            onChange={(e) => setCdnUrl(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            Leave empty to serve assets from origin. Must be a valid URL if set.
          </p>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Cache Settings"
        desc="Configure Cache-Control headers for browser and CDN caching."
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Cache-Control max-age (seconds)
            </label>
            <InputField
              type="number"
              placeholder="3600"
              defaultValue={cacheMaxAge}
              onChange={(e) => setCacheMaxAge(e.target.value)}
              min="0"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              How long browsers should cache assets. Default: 3600 (1 hour).
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              stale-while-revalidate (seconds)
            </label>
            <InputField
              type="number"
              placeholder="86400"
              defaultValue={cacheStaleWhileRevalidate}
              onChange={(e) => setCacheStaleWhileRevalidate(e.target.value)}
              min="0"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Serve stale content while revalidating in the background. Default:
              86400 (24 hours).
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* Configuration Note */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/5">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These settings are configuration flags. Actual optimization requires
          build pipeline integration.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Performance Settings"}
        </Button>
      </div>
    </div>
  );
}
