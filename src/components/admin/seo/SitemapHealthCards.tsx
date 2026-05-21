import React from "react";
import { FileText, Link2, Clock, ShieldCheck } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

interface SitemapHealth {
  totalUrls: number;
  lastGenerated: string;
  xmlValid: boolean;
  sitemapEnabled: boolean;
}

interface SitemapHealthCardsProps {
  health: SitemapHealth;
}

const cards = [
  {
    key: "status",
    name: "Sitemap Status",
    icon: FileText,
    getValue: (h: SitemapHealth) => (
      <Badge color={h.sitemapEnabled ? "success" : "error"} size="sm">
        {h.sitemapEnabled ? "Enabled" : "Disabled"}
      </Badge>
    ),
  },
  {
    key: "urls",
    name: "Total URLs",
    icon: Link2,
    getValue: (h: SitemapHealth) => (
      <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
        {h.totalUrls.toLocaleString()}
      </p>
    ),
  },
  {
    key: "generated",
    name: "Last Generated",
    icon: Clock,
    getValue: (h: SitemapHealth) => (
      <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
        {h.lastGenerated}
      </p>
    ),
  },
  {
    key: "valid",
    name: "XML Valid",
    icon: ShieldCheck,
    getValue: (h: SitemapHealth) => (
      <Badge color={h.xmlValid ? "success" : "error"} size="sm">
        {h.xmlValid ? "Valid" : "Invalid"}
      </Badge>
    ),
  },
] as const;

export default function SitemapHealthCards({ health }: SitemapHealthCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {card.name}
              </span>
            </div>
            {card.getValue(health)}
          </div>
        );
      })}
    </div>
  );
}
