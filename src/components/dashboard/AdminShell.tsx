"use client";

import { DashboardShell } from "./DashboardShell";
import { adminNavItems } from "@/data/dashboard-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={adminNavItems}>{children}</DashboardShell>;
}
