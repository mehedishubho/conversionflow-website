"use client";

import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { Bell, Menu, X } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-surface border-b border-border z-[99999]">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* Left section: toggle + mobile logo */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-border sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-text2 rounded-lg z-[99999] lg:flex lg:h-11 lg:w-11 lg:border lg:border-border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden">
            <span className="font-syne font-extrabold text-lg text-foreground">
              CF
            </span>
          </Link>

          {/* Spacer for mobile layout balance */}
          <div className="w-10 lg:hidden" />
        </div>

        {/* Right section: theme + bell + user */}
        <div className="hidden items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0">
          <ThemeToggleButton />

          {/* Notification bell -- icon only, no dropdown */}
          <button className="relative flex items-center justify-center text-text2 bg-surface border border-border rounded-full h-11 w-11 hover:bg-accent-light transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
