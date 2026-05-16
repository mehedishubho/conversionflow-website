"use client";

import { DashboardShell } from "./DashboardShell";
import { customerNavItems } from "@/data/dashboard-nav";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={customerNavItems}>{children}</DashboardShell>;
}
