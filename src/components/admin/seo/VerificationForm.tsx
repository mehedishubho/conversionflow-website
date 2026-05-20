"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { ChevronDown, Copy } from "lucide-react";
import { saveSeoSettings } from "@/app/(admin)/actions/admin-seo";
import { VERIFICATION_SEO_KEYS, type SeoSettingsData } from "@/lib/seo-keys";

interface VerificationFormProps {
  initialData: SeoSettingsData;
}

const ENGINES = [
  {
    key: "seo_verify_google",
    name: "Google Search Console",
    metaName: "google-site-verification",
    placeholder: "e.g. abc123def456",
    help: "Enter the verification code from Google Search Console > Settings > Verify ownership",
  },
  {
    key: "seo_verify_bing",
    name: "Bing Webmaster Tools",
    metaName: "msvalidate.01",
    placeholder: "e.g. ABCDEF123456",
    help: "Enter the verification code from Bing Webmaster Tools",
  },
  {
    key: "seo_verify_yandex",
    name: "Yandex Webmaster",
    metaName: "yandex-verification",
    placeholder: "e.g. abc12345",
    help: "Enter the verification code from Yandex Webmaster",
  },
  {
    key: "seo_verify_baidu",
    name: "Baidu Webmaster",
    metaName: "baidu-site-verification",
    placeholder: "e.g. ABCDEFGH",
    help: "Enter the verification code from Baidu Webmaster Tools",
  },
  {
    key: "seo_verify_pinterest",
    name: "Pinterest",
    metaName: "p:domain_verify",
    placeholder: "e.g. abc123def456",
    help: "Enter the verification code from Pinterest > Settings > Claim",
  },
] as const;

export default function VerificationForm({
  initialData,
}: VerificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<SeoSettingsData>({
    seo_verify_google: "",
    seo_verify_bing: "",
    seo_verify_yandex: "",
    seo_verify_baidu: "",
    seo_verify_pinterest: "",
    ...initialData,
  });

  const [expandedEngines, setExpandedEngines] = useState<Set<string>>(
    new Set()
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (key: string) => {
    setExpandedEngines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCopy = async (key: string) => {
    const value = data[key] ?? "";
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const verificationData: SeoSettingsData = {};
        for (const key of VERIFICATION_SEO_KEYS) {
          verificationData[key] = data[key] ?? "";
        }
        await saveSeoSettings(verificationData);
        setMessage({ type: "success", text: "Verification settings saved." });
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
        title="Search Engine Verification"
        desc="Add verification codes for Google, Bing, Yandex, Baidu, and Pinterest to prove site ownership."
      >
        <div className="space-y-2">
          {ENGINES.map((engine) => {
            const isExpanded = expandedEngines.has(engine.key);
            const value = data[engine.key] ?? "";
            const isConfigured = value.length > 0;

            return (
              <div
                key={engine.key}
                className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Collapsed/Clickable Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(engine.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {/* Status Dot */}
                  {isConfigured ? (
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <circle cx="10" cy="10" r="10" />
                      <path
                        d="M7 10l2 2 4-4"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <circle cx="10" cy="10" r="10" />
                    </svg>
                  )}

                  {/* Engine Name */}
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90 flex-1">
                    {engine.name}
                  </span>

                  {/* Status Text */}
                  <span
                    className={`text-xs font-medium ${
                      isConfigured
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {isConfigured ? "Connected" : "Not configured"}
                  </span>

                  {/* Chevron */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-3">
                    {/* Input Field */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Verification Code
                      </label>
                      <InputField
                        placeholder={engine.placeholder}
                        defaultValue={value}
                        onChange={(e) =>
                          updateField(engine.key, e.target.value)
                        }
                      />
                    </div>

                    {/* Meta Tag Reference */}
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                        &lt;meta name=&quot;{engine.metaName}&quot;
                        content=&quot;{value || "..."}&quot;&gt;
                      </code>
                    </div>

                    {/* Copy Button */}
                    {isConfigured && (
                      <button
                        type="button"
                        onClick={() => handleCopy(engine.key)}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedKey === engine.key ? "Copied!" : "Copy code"}
                      </button>
                    )}

                    {/* Help Text */}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {engine.help}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ComponentCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Verification Settings"}
        </Button>
      </div>
    </div>
  );
}
