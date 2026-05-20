"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  CreditCard,
  Mail,
  Search,
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
} from "lucide-react";

const SETTINGS_NAV = [
  { label: "Overview", href: "/admin/settings", icon: Settings },
  { label: "Payment Gateway", href: "/admin/settings/payment", icon: CreditCard },
  { label: "SMTP / Email", href: "/admin/settings/smtp", icon: Mail },
  {
    label: "SEO Settings",
    href: "/admin/settings/seo",
    icon: Search,
    children: [
      { label: "General", href: "/admin/settings/seo/general", icon: Globe },
      { label: "Verification", href: "/admin/settings/seo/verification", icon: Shield },
      { label: "Sitemaps", href: "/admin/settings/seo/sitemaps", icon: FileText },
      { label: "Robots.txt", href: "/admin/settings/seo/robots", icon: FileCode },
      { label: "Social / OG", href: "/admin/settings/seo/social", icon: Share2 },
      { label: "Meta Pixel", href: "/admin/settings/seo/meta-pixel", icon: Target },
      { label: "TikTok", href: "/admin/settings/seo/tiktok", icon: Music },
      { label: "Google", href: "/admin/settings/seo/google", icon: BarChart3 },
      { label: "Schema", href: "/admin/settings/seo/schema", icon: Code },
      { label: "Redirects", href: "/admin/settings/seo/redirects", icon: ArrowRightLeft },
      { label: "AI SEO", href: "/admin/settings/seo/ai-seo", icon: Bot },
      { label: "Image SEO", href: "/admin/settings/seo/image-seo", icon: ImageIcon },
      { label: "Performance", href: "/admin/settings/seo/performance", icon: Zap },
      { label: "Analytics", href: "/admin/settings/seo/analytics", icon: LineChart },
    ],
  },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSeoActive = pathname.startsWith("/admin/settings/seo");

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Secondary Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 lg:border-r lg:border-gray-200 dark:lg:border-gray-800 lg:pr-6">
        <nav className="space-y-1">
          {/* Section header */}
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Settings
          </h3>
          {SETTINGS_NAV.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "settings-nav-item",
                  pathname === item.href
                    ? "settings-nav-item-active"
                    : "settings-nav-item-inactive"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
              {/* SEO sub-items when SEO is active */}
              {item.children && isSeoActive && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "settings-nav-subitem",
                        pathname === child.href
                          ? "settings-nav-subitem-active"
                          : "settings-nav-subitem-inactive"
                      )}
                    >
                      <child.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
