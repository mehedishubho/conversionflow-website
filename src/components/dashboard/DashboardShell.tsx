"use client";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";
import type { NavItem } from "@/data/dashboard-nav";
import { cn } from "@/lib/utils";

function DashboardLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar navItems={navItems} />
      <Backdrop />
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          mainContentMargin
        )}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
}) {
  return (
    <SidebarProvider>
      <DashboardLayout navItems={navItems}>{children}</DashboardLayout>
    </SidebarProvider>
  );
}
