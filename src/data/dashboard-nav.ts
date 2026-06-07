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
  PenTool,
  Bell,
  Webhook,
  ScrollText,
  Package,
  HardDrive,
  Ticket,
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
  { name: "Products", icon: Package, path: "/admin/products" },
  { name: "Coupons", icon: Ticket, path: "/admin/coupons" },
  {
    name: "Licenses",
    icon: Key,
    path: "/admin/licenses",
    subItems: [
      { name: "All Licenses", path: "/admin/licenses" },
      { name: "Analytics", path: "/admin/licenses/analytics" },
    ],
  },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Invoices", icon: FileText, path: "/admin/invoices" },
  { name: "Activity", icon: Activity, path: "/admin/activity" },
  { name: "Notifications", icon: Bell, path: "/admin/notifications" },
  { name: "Webhooks", icon: Webhook, path: "/admin/webhooks" },
  { name: "Backups", icon: HardDrive, path: "/admin/backup" },
  { name: "Blog", icon: PenTool, path: "/admin/blog" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];
