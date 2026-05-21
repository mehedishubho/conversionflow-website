"use client";

import { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AiBotCards from "@/components/admin/seo/AiBotCards";
import AiUsageRulesForm from "@/components/admin/seo/AiUsageRulesForm";
import LlmsTxtPreview from "@/components/admin/seo/LlmsTxtPreview";
import { getSeoSettings, saveSeoSettings } from "@/app/(admin)/actions/admin-seo";

const DEFAULT_BOTS: Record<string, boolean> = {
  GPTBot: true,
  "ChatGPT-User": true,
  ClaudeBot: true,
  PerplexityBot: true,
  "Google-Extended": true,
  Bytespider: true,
  FacebookBot: true,
  "Applebot-Extended": true,
};

export default function SeoAiSeoPage() {
  const [botsData, setBotsData] = useState<Record<string, boolean>>(DEFAULT_BOTS);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadBots() {
      try {
        const data = await getSeoSettings(["seo_ai_bots"]);
        const raw = data["seo_ai_bots"];
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, boolean>;
          setBotsData({ ...DEFAULT_BOTS, ...parsed });
        }
      } catch {
        // Use defaults on parse error
      } finally {
        setLoading(false);
      }
    }
    loadBots();
  }, []);

  const handleBotChange = (updatedBots: Record<string, boolean>) => {
    setBotsData(updatedBots);
  };

  const handleSaveBots = async () => {
    setIsPending(true);
    setMessage(null);
    try {
      await saveSeoSettings({
        seo_ai_bots: JSON.stringify(botsData),
      });
      setMessage({ type: "success", text: "Bot settings saved successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save bot settings." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="AI SEO & LLM Controls" basePath="/admin/settings" />

      <div className="space-y-6">
        {loading ? (
          <ComponentCard title="AI SEO & LLM Controls" desc="Loading settings...">
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </ComponentCard>
        ) : (
          <>
            {/* Section 1: AI Bot Controls */}
            <div>
              <AiBotCards bots={botsData} onChange={handleBotChange} />
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveBots}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-sm hover:bg-brand-600 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Bot Settings"}
                </button>
                {message && (
                  <span
                    className={`text-sm ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {message.text}
                  </span>
                )}
              </div>
            </div>

            {/* Section 2: AI Usage Rules */}
            <AiUsageRulesForm />

            {/* Section 3: llms.txt Preview */}
            <LlmsTxtPreview />
          </>
        )}
      </div>
    </div>
  );
}
