import { requireAdmin } from "@/lib/auth-guard";
import {
  getDashboardKPIs,
  getRevenueChartData,
  getRecentActivity,
  getRecentOrders,
} from "@/app/(admin)/actions/admin-dashboard";
import DashboardPageClient from "@/components/admin/DashboardPageClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { session } = await requireAdmin(["super_admin", "admin", "support_staff"]);

  const [kpis, chartData, activity, recentOrders] = await Promise.all([
    getDashboardKPIs("30d"),
    getRevenueChartData("30d"),
    getRecentActivity(15),
    getRecentOrders(5),
  ]);

  return (
    <DashboardPageClient
      initialKpis={kpis}
      initialChartData={chartData}
      initialActivity={activity}
      initialRecentOrders={recentOrders}
      initialRange="30d"
    />
  );
}
