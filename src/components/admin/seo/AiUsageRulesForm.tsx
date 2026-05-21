"use client";

import { useState, useEffect, useCallback } from "react";
import Switch from "@/components/form/switch/Switch";
import ComponentCard from "@/components/common/ComponentCard";
import { getSeoSettings, saveSeoSettings } from "@/app/(admin)/actions/admin-seo";

interface UsageRules {
  allowSummarization: boolean;
  allowTraining: boolean;
  requireAttribution: boolean;
  allowCommercialUse: boolean;
}

const DEFAULT_RULES: UsageRules = {
  allowSummarization: true,
  allowTraining: false,
  requireAttribution: true,
  allowCommercialUse: false,
};

const RULE_CONFIG = [
  {
    key: "allowSummarization" as const,
    label: "Allow Summarization",
    desc: "AI models may summarize your content",
  },
  {
    key: "allowTraining" as const,
    label: "Allow Training",
    desc: "AI models may use content for training",
  },
  {
    key: "requireAttribution" as const,
    label: "Require Attribution",
    desc: "AI must credit your site when using content",
  },
  {
    key: "allowCommercialUse" as const,
    label: "Allow Commercial Use",
    desc: "AI may use content for commercial purposes",
  },
];

export default function AiUsageRulesForm() {
  const [rules, setRules] = useState<UsageRules>(DEFAULT_RULES);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadRules() {
      try {
        const data = await getSeoSettings(["seo_ai_usage_rules"]);
        const raw = data["seo_ai_usage_rules"];
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<UsageRules>;
          setRules({
            allowSummarization: parsed.allowSummarization ?? DEFAULT_RULES.allowSummarization,
            allowTraining: parsed.allowTraining ?? DEFAULT_RULES.allowTraining,
            requireAttribution: parsed.requireAttribution ?? DEFAULT_RULES.requireAttribution,
            allowCommercialUse: parsed.allowCommercialUse ?? DEFAULT_RULES.allowCommercialUse,
          });
        }
      } catch {
        // Use defaults on parse error
      }
    }
    loadRules();
  }, []);

  const handleToggle = useCallback((key: keyof UsageRules, checked: boolean) => {
    setRules((prev) => ({ ...prev, [key]: checked }));
  }, []);

  const handleSave = async () => {
    setIsPending(true);
    setMessage(null);
    try {
      await saveSeoSettings({
        seo_ai_usage_rules: JSON.stringify(rules),
      });
      setMessage({ type: "success", text: "AI usage rules saved successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save AI usage rules." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ComponentCard
      title="AI Content Usage Rules"
      desc="Configure how AI models may use your site content"
    >
      <div className="space-y-4">
        {RULE_CONFIG.map((rule) => (
          <div
            key={rule.key}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {rule.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {rule.desc}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <Switch
                label={rules[rule.key] ? "Enabled" : "Disabled"}
                checked={rules[rule.key]}
                onChange={(checked) => handleToggle(rule.key, checked)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-sm hover:bg-brand-600 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Usage Rules"}
        </button>
        {message && (
          <span
            className={`text-sm ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {message.text}
          </span>
        )}
      </div>
    </ComponentCard>
  );
}
