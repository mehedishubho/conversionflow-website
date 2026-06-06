"use client";

import { useState, useTransition, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import AiBotCards from "@/components/admin/seo/AiBotCards";
import { saveSeoSettings } from "@/app/(admin)/actions/admin-seo";
import { ROBOTS_SEO_KEYS, type SeoSettingsData } from "@/lib/seo-keys";

interface RobotsEditorProps {
  initialData: SeoSettingsData;
}

type TabMode = "visual" | "raw";
type CrawlPreset = "allow_all" | "block_ai" | "block_all" | "custom";

const PRESET_OPTIONS: { value: CrawlPreset; label: string; desc: string }[] = [
  { value: "allow_all", label: "Allow All", desc: "Allow all crawlers full access" },
  { value: "block_ai", label: "Block AI Bots", desc: "Block all AI crawlers, allow search engines" },
  { value: "block_all", label: "Block All", desc: "Block all crawlers from the site" },
  { value: "custom", label: "Custom", desc: "Configure manually" },
];

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

function parseRobotsTxt(raw: string): {
  userAgent: string;
  allowPaths: string;
  disallowPaths: string;
  crawlDelay: string;
  sitemapUrl: string;
} {
  const lines = raw.split("\n");
  let userAgent = "*";
  const allowPaths: string[] = [];
  const disallowPaths: string[] = [];
  let crawlDelay = "";
  let sitemapUrl = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const [, directive, value] = match;
    const normalizedDirective = directive.trim().toLowerCase();
    const trimmedValue = value.trim();

    switch (normalizedDirective) {
      case "user-agent":
        userAgent = trimmedValue;
        break;
      case "allow":
        allowPaths.push(trimmedValue);
        break;
      case "disallow":
        if (trimmedValue) disallowPaths.push(trimmedValue);
        break;
      case "crawl-delay":
        crawlDelay = trimmedValue;
        break;
      case "sitemap":
        sitemapUrl = trimmedValue;
        break;
    }
  }

  return {
    userAgent,
    allowPaths: allowPaths.join("\n"),
    disallowPaths: disallowPaths.join("\n"),
    crawlDelay,
    sitemapUrl,
  };
}

function highlightRobots(raw: string): string {
  return raw
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("#")) {
        return `<span class="text-gray-400 dark:text-gray-500">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
      }
      const match = trimmed.match(/^([^:]+):\s*(.*)$/);
      if (!match) {
        return `<span class="text-gray-700 dark:text-gray-300">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
      }
      const [, directive, value] = match;
      const dl = directive.trim().toLowerCase();
      let directiveColor = "text-purple-600 dark:text-purple-400"; // default
      if (dl === "user-agent") directiveColor = "text-blue-600 dark:text-blue-400";
      else if (dl === "allow") directiveColor = "text-green-600 dark:text-green-400";
      else if (dl === "disallow") directiveColor = "text-red-600 dark:text-red-400";
      else if (dl === "sitemap") directiveColor = "text-cyan-600 dark:text-cyan-400";
      else if (dl === "crawl-delay") directiveColor = "text-amber-600 dark:text-amber-400";
      const escapedLine = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const prefix = line.substring(0, line.indexOf(directive));
      return `${prefix}<span class="${directiveColor} font-semibold">${directive}</span>:<span class="text-gray-700 dark:text-gray-300">${value.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
    })
    .join("\n");
}

export default function RobotsEditor({ initialData }: RobotsEditorProps) {
  // Parse DB data once during initialization (matches GeneralSeoForm pattern)
  const robotsTxt = initialData.seo_robots_txt ?? "";
  const aiBotsRaw = initialData.seo_ai_bots ?? "";
  const parsed = robotsTxt ? parseRobotsTxt(robotsTxt) : null;

  const initialBots = (() => {
    if (aiBotsRaw) {
      try {
        const parsedBots = JSON.parse(aiBotsRaw);
        if (typeof parsedBots === "object" && parsedBots !== null) {
          return { ...DEFAULT_BOTS, ...parsedBots };
        }
      } catch {
        // Keep defaults
      }
    }
    return { ...DEFAULT_BOTS };
  })();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<TabMode>("visual");
  const [rawContent, setRawContent] = useState<string>(robotsTxt);
  const [crawlPreset, setCrawlPreset] = useState<CrawlPreset>(
    robotsTxt ? "custom" : "allow_all"
  );

  // Visual mode state — initialized from DB data
  const [userAgent, setUserAgent] = useState(parsed?.userAgent ?? "*");
  const [allowPaths, setAllowPaths] = useState(parsed?.allowPaths || "/");
  const [disallowPaths, setDisallowPaths] = useState(
    parsed?.disallowPaths || "/_next/\n/api/"
  );
  const [crawlDelay, setCrawlDelay] = useState(parsed?.crawlDelay ?? "");
  const [sitemapUrl, setSitemapUrl] = useState(
    parsed?.sitemapUrl ?? "https://conversionflow.com/sitemap.xml"
  );
  const [bots, setBots] = useState<Record<string, boolean>>(initialBots);

  // Generate robots.txt from visual state
  const generateRobotsTxt = useCallback((): string => {
    const lines: string[] = [];

    // Main user-agent block
    lines.push(`User-agent: ${userAgent || "*"}`);

    // Allow paths
    const allows = allowPaths
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);
    for (const path of allows) {
      lines.push(`Allow: ${path}`);
    }

    // Disallow paths
    const disallows = disallowPaths
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);
    for (const path of disallows) {
      lines.push(`Disallow: ${path}`);
    }

    // Crawl delay
    if (crawlDelay) {
      lines.push(`Crawl-delay: ${crawlDelay}`);
    }

    // Blocked AI bots as separate user-agent blocks
    for (const [botKey, allowed] of Object.entries(bots)) {
      if (!allowed) {
        lines.push("");
        lines.push(`User-agent: ${botKey}`);
        lines.push("Disallow: /");
      }
    }

    // Sitemap
    lines.push("");
    if (sitemapUrl) {
      lines.push(`Sitemap: ${sitemapUrl}`);
    }

    return lines.join("\n");
  }, [userAgent, allowPaths, disallowPaths, crawlDelay, bots, sitemapUrl]);

  // Handle tab switching with state sync
  const handleTabSwitch = (tab: TabMode) => {
    if (tab === "raw" && activeTab === "visual") {
      // Visual -> Raw: generate raw content from visual state
      setRawContent(generateRobotsTxt());
    } else if (tab === "visual" && activeTab === "raw") {
      // Raw -> Visual: parse raw content into visual fields
      const parsed = parseRobotsTxt(rawContent);
      setUserAgent(parsed.userAgent);
      setAllowPaths(parsed.allowPaths || "/");
      setDisallowPaths(parsed.disallowPaths || "/_next/\n/api/");
      setCrawlDelay(parsed.crawlDelay);
      if (parsed.sitemapUrl) {
        setSitemapUrl(parsed.sitemapUrl);
      }
    }
    setActiveTab(tab);
  };

  // Apply crawl preset
  const applyPreset = (preset: CrawlPreset) => {
    setCrawlPreset(preset);
    switch (preset) {
      case "allow_all":
        setAllowPaths("/");
        setDisallowPaths("");
        setBots({ ...DEFAULT_BOTS }); // all allowed
        break;
      case "block_ai":
        setAllowPaths("/");
        setDisallowPaths("");
        const allBlocked: Record<string, boolean> = {};
        for (const key of Object.keys(DEFAULT_BOTS)) {
          allBlocked[key] = false;
        }
        setBots(allBlocked);
        break;
      case "block_all":
        setAllowPaths("");
        setDisallowPaths("/");
        setBots({ ...DEFAULT_BOTS }); // bots don't matter if global disallow
        break;
      case "custom":
        // No changes - user configures manually
        break;
    }
  };

  // Get preview content
  const getPreviewContent = (): string => {
    if (activeTab === "visual") {
      return generateRobotsTxt();
    }
    return rawContent;
  };

  // Copy preview to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPreviewContent());
      setMessage({ type: "success", text: "Copied to clipboard." });
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: "error", text: "Failed to copy." });
    }
  };

  // Save handler
  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const finalContent =
          activeTab === "visual" ? generateRobotsTxt() : rawContent;
        const data: SeoSettingsData = {};
        for (const key of ROBOTS_SEO_KEYS) {
          data[key] = "";
        }
        data.seo_robots_txt = finalContent;
        data.seo_ai_bots = JSON.stringify(bots);

        await saveSeoSettings(data);
        setMessage({ type: "success", text: "Robots.txt settings saved." });
      } catch {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      }
    });
  };

  const previewContent = getPreviewContent();

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

      {/* Tab Buttons */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => handleTabSwitch("visual")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "visual"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("raw")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "raw"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Raw
        </button>
      </div>

      {activeTab === "visual" && (
        <>
          {/* Crawl Presets */}
          <ComponentCard
            title="Crawl Presets"
            desc="Quickly apply common crawl rule configurations"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRESET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyPreset(option.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    crawlPreset === option.value
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {option.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>
          </ComponentCard>

          {/* Visual Mode Fields */}
          <ComponentCard
            title="Robots.txt Editor"
            desc="Configure robots.txt directives with a visual form builder"
          >
            <div className="space-y-5">
              {/* User-agent */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  User-agent
                </label>
                <InputField
                  placeholder="*"
                  defaultValue={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  The crawler user-agent this rule applies to. Use * for all crawlers.
                </p>
              </div>

              {/* Allow Paths */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Allow Paths
                </label>
                <textarea
                  placeholder={"/\n/blog/\n/docs/"}
                  defaultValue={allowPaths}
                  onChange={(e) => setAllowPaths(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-mono text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  One path per line. Paths that crawlers are allowed to access.
                </p>
              </div>

              {/* Disallow Paths */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Disallow Paths
                </label>
                <textarea
                  placeholder={"/_next/\n/api/\n/admin/"}
                  defaultValue={disallowPaths}
                  onChange={(e) => setDisallowPaths(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-mono text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  One path per line. Paths that crawlers are blocked from accessing.
                </p>
              </div>

              {/* Crawl Delay */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Crawl Delay (seconds)
                </label>
                <InputField
                  type="number"
                  placeholder="10"
                  defaultValue={crawlDelay}
                  onChange={(e) => setCrawlDelay(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Optional. Number of seconds between successive crawler requests.
                </p>
              </div>

              {/* Sitemap URL */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Sitemap URL
                </label>
                <InputField
                  placeholder="https://conversionflow.com/sitemap.xml"
                  defaultValue={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  URL of your XML sitemap for search engine crawlers.
                </p>
              </div>
            </div>
          </ComponentCard>

          {/* AI Bot Controls */}
          <AiBotCards bots={bots} onChange={setBots} />
        </>
      )}

      {activeTab === "raw" && (
        <ComponentCard
          title="Raw Robots.txt Editor"
          desc="Edit the robots.txt file content directly. Changes will be parsed when switching back to Visual mode."
        >
          <div className="relative">
            {/* Highlighted background layer */}
            <div
              className="absolute inset-0 overflow-auto rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none dark:border-gray-700 dark:bg-gray-900"
              aria-hidden="true"
              dangerouslySetInnerHTML={{
                __html:
                  highlightRobots(rawContent) ||
                  `<span class="text-gray-400 dark:text-gray-500">User-agent: *\nAllow: /\nDisallow: /_next/\nDisallow: /api/\n\nSitemap: https://conversionflow.com/sitemap.xml</span>`,
              }}
            />
            {/* Transparent textarea on top */}
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={15}
              spellCheck={false}
              className="relative w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-transparent caret-gray-800 dark:caret-gray-200 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:placeholder:text-white/30 dark:focus:border-brand-800 resize-y"
              placeholder={`User-agent: *\nAllow: /\nDisallow: /_next/\nDisallow: /api/\n\nSitemap: https://conversionflow.com/sitemap.xml`}
            />
          </div>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span> User-agent</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500"></span> Allow</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> Disallow</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-cyan-500"></span> Sitemap</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span> Crawl-delay</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-gray-400"></span> Comment</span>
          </div>
        </ComponentCard>
      )}

      {/* Live Preview */}
      <ComponentCard
        title="Preview"
        desc="Live preview of the robots.txt content that will be served"
      >
        <div className="relative">
          <pre className="rounded-lg bg-gray-100 p-4 font-mono text-sm leading-relaxed text-gray-800 overflow-x-auto dark:bg-gray-900 dark:text-gray-200">
            {previewContent || "# robots.txt is empty"}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Copy
          </button>
        </div>
      </ComponentCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Robots.txt Settings"}
        </Button>
      </div>
    </div>
  );
}
