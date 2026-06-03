"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Eye, Edit, GitBranch, CreditCard } from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ProductInfo {
  id: string;
  name: string;
  slug: string;
}

interface ProductDetailShellProps {
  product: ProductInfo;
  children: React.ReactNode;
}

// ──────────────────────────────────────────────
// Tab configuration
// ──────────────────────────────────────────────

function getDetailTabs(productId: string) {
  return [
    { label: "Overview", href: `/admin/products/${productId}`, icon: Eye },
    { label: "Edit", href: `/admin/products/${productId}/edit`, icon: Edit },
    { label: "Versions", href: `/admin/products/${productId}/versions`, icon: GitBranch },
    { label: "Plans", href: `/admin/products/${productId}/plans`, icon: CreditCard },
  ];
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ProductDetailShell({
  product,
  children,
}: ProductDetailShellProps) {
  const pathname = usePathname();
  const tabs = getDetailTabs(product.id);

  return (
    <div className="space-y-6">
      {/* Product header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {product.name}
        </h2>
        <code className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          {product.slug}
        </code>
      </div>

      {/* Horizontal tab navigation */}
      <nav className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Content area */}
      <main>{children}</main>
    </div>
  );
}
