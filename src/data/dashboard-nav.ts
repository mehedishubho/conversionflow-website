import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Key,
  CreditCard,
  Download,
  MessageSquare,
  UserCog,
  BarChart3,
  Users,
  FileText,
  Settings,
  ShoppingCart,
  Activity,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon: LucideIcon;
  path: string;
  subItems?: { name: string; path: string }[];
};

export const customerNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Licenses", icon: Key, path: "/dashboard/licenses" },
  { name: "Billing", icon: CreditCard, path: "/dashboard/billing" },
  { name: "Downloads", icon: Download, path: "/dashboard/downloads" },
  { name: "Support", icon: MessageSquare, path: "/dashboard/support" },
  { name: "Account", icon: UserCog, path: "/dashboard/account" },
];

export const adminNavItems: NavItem[] = [
  { name: "Overview", icon: BarChart3, path: "/admin/dashboard" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Invoices", icon: FileText, path: "/admin/invoices" },
  { name: "Licenses", icon: Key, path: "/admin/licenses" },
  { name: "Activity", icon: Activity, path: "/admin/activity" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];
