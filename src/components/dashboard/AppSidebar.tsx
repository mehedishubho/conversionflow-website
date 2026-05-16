"use client";

import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { NavItem } from "@/data/dashboard-nav";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar({ navItems }: { navItems: NavItem[] }) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={cn(
        "fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-surface border-r border-border h-screen transition-all duration-300 ease-in-out z-50 px-5",
        showText ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={cn(
          "py-8 flex",
          !showText ? "lg:justify-center" : "justify-start"
        )}
      >
        <Link href="/">
          {showText ? (
            <span className="font-syne font-extrabold text-lg text-foreground">
              ConversionFlow
            </span>
          ) : (
            <span className="font-syne font-extrabold text-lg text-foreground">
              CF
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {/* Section header */}
              <h2
                className={cn(
                  "mb-4 text-xs uppercase flex leading-[20px] text-muted",
                  !showText ? "lg:justify-center" : "justify-start"
                )}
              >
                {showText ? "Menu" : <MoreHorizontal className="w-5 h-5" />}
              </h2>

              {/* Nav items */}
              <ul className="flex flex-col gap-4">
                {navItems.map((nav) => (
                  <li key={nav.name}>
                    <Link
                      href={nav.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        !showText && "lg:justify-center",
                        pathname === nav.path
                          ? "bg-accent-light text-accent"
                          : "text-text2 hover:bg-accent-light hover:text-foreground"
                      )}
                    >
                      <nav.icon className="w-5 h-5 flex-shrink-0" />
                      {showText && <span>{nav.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
