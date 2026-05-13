"use client";

import { Link, usePathname } from "@/i18n/routing";
import { docsNav } from "@/data/docs-nav";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const categoryKeyMap: Record<string, string> = {
  "Getting Started": "gettingStarted",
  "Modules": "modules",
};

export function DocsSidebar() {
  const pathname = usePathname();
  const t = useTranslations("docsNav");

  return (
    <nav className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
      {docsNav.map((group) => {
        const key = categoryKeyMap[group.category];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const label = key ? t(key as any) : group.category;
        return (
          <div key={group.category}>
            <h2 className="font-dm-sans text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-3">
              {label}
            </h2>
            <div className="flex flex-col gap-0.5 mb-6">
              {group.items.map((item) => {
                const href = `/docs/${item.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.slug}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={href as any}
                    className={cn(
                      "text-[13.5px] font-semibold text-text2 py-1.5 transition-colors duration-200 hover:text-accent block",
                      active && "text-accent border-l-2 border-accent pl-3"
                    )}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {t(`items.${item.slug}` as any)}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
