"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  Shield,
  FileText,
  FileCode,
  Share2,
  Target,
  Music,
  BarChart3,
  Code,
  ArrowRightLeft,
  Bot,
  Image as ImageIcon,
  Zap,
  LineChart,
  Layers,
} from "lucide-react";

interface SeoOverviewCardsProps {
  settingsData: Record<string, string>;
}

interface CardConfig {
  label: string;
  href: string;
  icon: React.ElementType;
  isFilled: (data: Record<string, string>) => boolean;
}

const CARDS: CardConfig[] = [
  // Core SEO
  {
    label: "General",
    href: "/admin/settings/seo/general",
    icon: Globe,
    isFilled: (d) => !!(d["seo_title"] || d["seo_description"]),
  },
  {
    label: "Verification",
    href: "/admin/settings/seo/verification",
    icon: Shield,
    isFilled: (d) =>
      !!(
        d["seo_verify_google"] ||
        d["seo_verify_bing"] ||
        d["seo_verify_yandex"]
      ),
  },
  {
    label: "Sitemaps",
    href: "/admin/settings/seo/sitemaps",
    icon: FileText,
    isFilled: (d) => d["seo_sitemap_enabled"] === "true",
  },
  {
    label: "Robots.txt",
    href: "/admin/settings/seo/robots",
    icon: FileCode,
    isFilled: (d) => !!d["seo_robots_txt"],
  },
  // Structured Data
  {
    label: "Schema",
    href: "/admin/settings/seo/schema",
    icon: Code,
    isFilled: (d) =>
      d["seo_schema_auto_generate"] === "true" ||
      !!d["seo_schema_types_enabled"],
  },
  // Social & Analytics
  {
    label: "Social / OG",
    href: "/admin/settings/seo/social",
    icon: Share2,
    isFilled: (d) =>
      !!(d["seo_fb_app_id"] || d["seo_share_title"]),
  },
  {
    label: "Meta Pixel",
    href: "/admin/settings/seo/meta-pixel",
    icon: Target,
    isFilled: (d) => !!d["meta_pixel_id"],
  },
  {
    label: "TikTok",
    href: "/admin/settings/seo/tiktok",
    icon: Music,
    isFilled: (d) => !!d["tiktok_pixel_id"],
  },
  {
    label: "Google",
    href: "/admin/settings/seo/google",
    icon: BarChart3,
    isFilled: (d) => !!d["google_analytics_id"],
  },
  {
    label: "Analytics",
    href: "/admin/settings/seo/analytics",
    icon: LineChart,
    isFilled: (d) => !!d["google_analytics_id"],
  },
  // Advanced SEO
  {
    label: "Redirects",
    href: "/admin/settings/seo/redirects",
    icon: ArrowRightLeft,
    isFilled: (d) => false, // Redirects don't have a simple config check
  },
  {
    label: "AI SEO",
    href: "/admin/settings/seo/ai-seo",
    icon: Bot,
    isFilled: (d) =>
      d["seo_ai_bot_gptbot"] === "true" ||
      d["seo_ai_bot_claudebot"] === "true",
  },
  {
    label: "Image SEO",
    href: "/admin/settings/seo/image-seo",
    icon: ImageIcon,
    isFilled: (d) =>
      d["seo_image_auto_alt"] === "true" ||
      d["seo_image_webp"] === "true",
  },
  {
    label: "Performance",
    href: "/admin/settings/seo/performance",
    icon: Zap,
    isFilled: (d) =>
      d["seo_perf_critical_css"] === "true" ||
      d["seo_perf_js_defer"] === "true",
  },
  {
    label: "Page-Level SEO",
    href: "/admin/settings/seo/page-level",
    icon: Layers,
    isFilled: (d) => false, // Page-level SEO is per-page, not global
  },
];

export default function SeoOverviewCards({
  settingsData,
}: SeoOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const filled = card.isFilled(settingsData);

        return (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-brand-500/10 dark:group-hover:text-brand-400">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {card.label}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {filled ? "Configured" : "Not configured"}
              </p>
            </div>
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                filled
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              title={filled ? "Configured" : "Not configured"}
            />
          </Link>
        );
      })}
    </div>
  );
}
