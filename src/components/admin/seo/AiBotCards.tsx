"use client";

import Switch from "@/components/form/switch/Switch";
import ComponentCard from "@/components/common/ComponentCard";

const AI_BOTS = [
  { key: "GPTBot", name: "GPTBot", org: "OpenAI", desc: "OpenAI's web crawler for GPT models" },
  { key: "ChatGPT-User", name: "ChatGPT-User", org: "OpenAI", desc: "ChatGPT's user-facing web crawler" },
  { key: "ClaudeBot", name: "ClaudeBot", org: "Anthropic", desc: "Anthropic's web crawler for Claude" },
  { key: "PerplexityBot", name: "PerplexityBot", org: "Perplexity AI", desc: "Perplexity AI's web crawler" },
  { key: "Google-Extended", name: "Google-Extended", org: "Google", desc: "Google's AI training data crawler" },
  { key: "Bytespider", name: "Bytespider", org: "TikTok/ByteDance", desc: "ByteDance's web crawler" },
  { key: "FacebookBot", name: "FacebookBot", org: "Meta", desc: "Meta's web crawler" },
  { key: "Applebot-Extended", name: "Applebot-Extended", org: "Apple", desc: "Apple's AI training crawler" },
] as const;

interface AiBotCardsProps {
  bots: Record<string, boolean>;
  onChange: (bots: Record<string, boolean>) => void;
}

export default function AiBotCards({ bots, onChange }: AiBotCardsProps) {
  const handleToggle = (botKey: string, checked: boolean) => {
    onChange({ ...bots, [botKey]: checked });
  };

  return (
    <ComponentCard
      title="AI Bot Controls"
      desc="Control which AI crawlers can access your site"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AI_BOTS.map((bot) => (
          <div
            key={bot.key}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {bot.name}
                </p>
                <p className="text-xs text-gray-400">{bot.org}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {bot.desc}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  label={bots[bot.key] !== false ? "Allowed" : "Blocked"}
                  defaultChecked={bots[bot.key] !== false}
                  onChange={(checked) => handleToggle(bot.key, checked)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}
