"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  saveTrackingSettings,
  type TrackingData,
} from "@/app/(admin)/actions/admin-tracking";

interface TrackingSettingsFormProps {
  initialData: TrackingData;
}

const FIELDS: { key: keyof TrackingData; label: string; placeholder: string; help?: string }[] = [
  {
    key: "google_search_console_verification",
    label: "Google Search Console Verification",
    placeholder: "e.g. abc123def456",
    help: "The verification meta tag content value from Google Search Console.",
  },
  {
    key: "google_analytics_id",
    label: "Google Analytics 4 (GA4)",
    placeholder: "e.g. G-XXXXXXXXXX",
    help: "Your GA4 Measurement ID. The gtag.js script will be loaded automatically.",
  },
  {
    key: "google_tag_manager_id",
    label: "Google Tag Manager",
    placeholder: "e.g. GTM-XXXXXXX",
    help: "Your GTM Container ID. Both the head and body snippets will be injected.",
  },
  {
    key: "facebook_pixel_id",
    label: "Facebook Pixel ID",
    placeholder: "e.g. 123456789012345",
    help: "Your Meta Pixel ID. The fbq('init') and fbq('track', 'PageView') calls will be fired.",
  },
  {
    key: "facebook_capi_token",
    label: "Facebook Conversions API Token",
    placeholder: "e.g. your-capi-access-token",
    help: "Server-side event token for Meta Conversions API. Keep this secret.",
  },
];

export default function TrackingSettingsForm({
  initialData,
}: TrackingSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<TrackingData>({ ...initialData });

  const updateField = (key: keyof TrackingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await saveTrackingSettings(data);
        setMessage({ type: "success", text: "Tracking settings saved." });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

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
        title="Tracking & Analytics"
        desc="Configure tracking scripts for Google, Meta, and analytics platforms. Scripts load on public pages only."
      >
        <div className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {field.label}
              </label>
              <InputField
                type={field.key === "facebook_capi_token" ? "password" : "text"}
                placeholder={field.placeholder}
                defaultValue={data[field.key]}
                onChange={(e) => updateField(field.key, e.target.value)}
              />
              {field.help && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {field.help}
                </p>
              )}
            </div>
          ))}
        </div>
      </ComponentCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Tracking Settings"}
        </Button>
      </div>
    </div>
  );
}
