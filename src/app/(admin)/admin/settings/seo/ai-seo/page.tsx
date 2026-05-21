"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const saveBotsData = useCallback(async (botsToSave: Record<string, boolean>) => {
    setIsPending(true);
    setMessage(null);
    try {
      await saveSeoSettings({
        seo_ai_bots: JSON.stringify(botsToSave),
      });
      setMessage({ type: "success", text: "Bot settings saved." });
    } catch {
      setMessage({ type: "error", text: "Failed to save bot settings." });
    } finally {
      setIsPending(false);
    }
  }, []);

  const handleBotChange = useCallback((updatedBots: Record<string, boolean>) => {
    setBotsData(updatedBots);
    setMessage({ type: "success", text: "Saving..." });

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveBotsData(updatedBots);
    }, 800);
  }, [saveBotsData]);

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
              <div className="mt-3 flex items-center gap-3 text-sm">
                {isPending ? (
                  <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : message && (
                  <span className={`${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
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
