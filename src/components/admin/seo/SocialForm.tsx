"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import SocialPreviewSimulator from "@/components/admin/seo/SocialPreviewSimulator";
import {
  saveTrackingSettings,
} from "@/app/(admin)/actions/admin-tracking-v2";
import { SOCIAL_KEYS, type TrackingSettingsData } from "@/lib/tracking-keys";

interface SocialFormProps {
  initialData: TrackingSettingsData;
}

const TWITTER_CARD_TYPES = [
  { value: "summary_large_image", label: "Summary Large Image" },
  { value: "summary", label: "Summary" },
] as const;

export default function SocialForm({ initialData }: SocialFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<TrackingSettingsData>({
    seo_fb_app_id: "",
    seo_share_title: "",
    seo_share_description: "",
    seo_share_image: "",
    seo_twitter_handle: "",
    seo_twitter_card_type: "summary_large_image",
    seo_linkedin_image: "",
    ...initialData,
  });

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const socialData: TrackingSettingsData = {};
        for (const key of SOCIAL_KEYS) {
          socialData[key] = data[key] ?? "";
        }
        await saveTrackingSettings(socialData);
        setMessage({ type: "success", text: "Social settings saved." });
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

      {/* Social Sharing Defaults */}
      <ComponentCard
        title="Social Sharing Defaults"
        desc="Configure how your site appears when shared on Facebook, Twitter/X, and LinkedIn."
      >
        <div className="space-y-5">
          {/* FB App ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Facebook App ID
            </label>
            <InputField
              placeholder="123456789012345"
              defaultValue={data.seo_fb_app_id}
              onChange={(e) => updateField("seo_fb_app_id", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Your Facebook App ID for Open Graph integration.
            </p>
          </div>

          {/* Share Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Default Share Title
            </label>
            <InputField
              placeholder="ConversionFlow"
              defaultValue={data.seo_share_title}
              onChange={(e) => updateField("seo_share_title", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Default title used when sharing pages on social media.
            </p>
          </div>

          {/* Share Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Default Share Description
            </label>
            <textarea
              placeholder="Brief description shown when your site is shared on social media..."
              defaultValue={data.seo_share_description}
              onChange={(e) =>
                updateField("seo_share_description", e.target.value)
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Default description for social sharing. Keep under 200 characters.
            </p>
          </div>

          {/* Share Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Default Share Image URL
            </label>
            <InputField
              placeholder="https://salesconversionflow.com/og-image.png"
              defaultValue={data.seo_share_image}
              onChange={(e) => updateField("seo_share_image", e.target.value)}
              hint="Recommended: 1200x630px PNG or JPG"
            />
          </div>

          {/* Twitter Handle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Twitter / X Handle
            </label>
            <InputField
              placeholder="@conversionflow"
              defaultValue={data.seo_twitter_handle}
              onChange={(e) =>
                updateField("seo_twitter_handle", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Your Twitter/X username for twitter:site meta tag.
            </p>
          </div>

          {/* Twitter Card Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Twitter Card Type
            </label>
            <select
              defaultValue={data.seo_twitter_card_type || "summary_large_image"}
              onChange={(e) =>
                updateField("seo_twitter_card_type", e.target.value)
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              {TWITTER_CARD_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              &quot;Summary Large Image&quot; shows a large featured image.
              &quot;Summary&quot; shows a small thumbnail.
            </p>
          </div>

          {/* LinkedIn Image Override */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              LinkedIn Image Override
            </label>
            <InputField
              placeholder="https://salesconversionflow.com/linkedin-image.png"
              defaultValue={data.seo_linkedin_image}
              onChange={(e) =>
                updateField("seo_linkedin_image", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Optional. Override the default share image specifically for
              LinkedIn. Recommended: 1200x627px.
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* Social Share Preview */}
      <ComponentCard
        title="Social Share Preview"
        desc="Preview how your site appears when shared on Facebook, Twitter/X, and LinkedIn."
      >
        <SocialPreviewSimulator
          title={data.seo_share_title ?? ""}
          description={data.seo_share_description ?? ""}
          image={data.seo_share_image ?? ""}
          url={data.seo_share_image ? new URL(window?.location?.href).origin : ""}
          twitterHandle={data.seo_twitter_handle ?? ""}
          twitterCardType={data.seo_twitter_card_type ?? "summary_large_image"}
          linkedinImage={data.seo_linkedin_image ?? ""}
          fbAppId={data.seo_fb_app_id ?? ""}
        />
      </ComponentCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Social Settings"}
        </Button>
      </div>
    </div>
  );
}
