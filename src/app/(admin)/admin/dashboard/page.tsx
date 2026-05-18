import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getDashboardKPIs,
  getRevenueChartData,
  getRecentActivity,
  getRecentOrders,
} from "@/app/(admin)/actions/admin-dashboard";
import DashboardPageClient from "@/components/admin/DashboardPageClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole !== "admin" &&
    userRole !== "super_admin" &&
    userRole !== "support_staff"
  ) {
    redirect("/dashboard");
  }

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
