"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/data/docs-nav";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
      {docsNav.map((group) => (
        <div key={group.category}>
          <h2 className="font-syne text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-3">
            {group.category}
          </h2>
          <div className="flex flex-col gap-0.5 mb-6">
            {group.items.map((item) => {
              const active = pathname === `/docs/${item.slug}`;

              return (
                <Link
                  key={item.slug}
                  href={`/docs/${item.slug}`}
                  className={cn(
                    "text-[13.5px] font-semibold text-text2 py-1.5 transition-colors duration-200 hover:text-accent block",
                    active && "text-accent border-l-2 border-accent pl-3"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
