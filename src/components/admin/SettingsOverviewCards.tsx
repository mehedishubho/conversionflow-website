"use client";

import React from "react";
import Link from "next/link";
import {
  Settings,
  CreditCard,
  Mail,
  Search,
} from "lucide-react";

interface SettingsOverviewCardsProps {
  className?: string;
}

interface CardConfig {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const CARDS: CardConfig[] = [
  {
    label: "Overview",
    description: "General settings overview",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Payment Gateway",
    description: "Configure payment methods and accounts",
    href: "/admin/settings/payment",
    icon: CreditCard,
  },
  {
    label: "SMTP / Email",
    description: "Email server configuration",
    href: "/admin/settings/smtp",
    icon: Mail,
  },
  {
    label: "SEO Settings",
    description: "SEO, meta tags, schema, and more",
    href: "/admin/settings/seo",
    icon: Search,
  },
];

export default function SettingsOverviewCards({
  className = "",
}: SettingsOverviewCardsProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-brand-500/10 dark:group-hover:text-brand-400">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {card.label}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
