import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboardClient from "@/components/portal/analytics/AnalyticsDashboardClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "support_staff"
  ) {
    redirect("/admin/dashboard");
  }

  // Mock data for demonstration - replace with real data fetching
  const initialStats = {
    sessions: 12458,
    realTimeUsers: 142,
    pageViews: 45231,
    uniqueVisitors: 8934,
    bounceRate: 42.3,
    avgSessionDuration: "4m 32s",
  };

  const initialTrafficData = {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [1245, 1589, 1423, 1687, 1834, 2134, 1928],
  };

  const initialTopPages = [
    { path: "/", views: 15234, uniqueVisitors: 8934, bounceRate: 35.2 },
    { path: "/pricing", views: 8234, uniqueVisitors: 5421, bounceRate: 45.8 },
    { path: "/features", views: 6543, uniqueVisitors: 4232, bounceRate: 38.9 },
    { path: "/blog/getting-started", views: 4521, uniqueVisitors: 3211, bounceRate: 52.1 },
    { path: "/docs/installation", views: 3876, uniqueVisitors: 2876, bounceRate: 28.4 },
  ];

  return (
    <AnalyticsDashboardClient
      initialStats={initialStats}
      initialTrafficData={initialTrafficData}
      initialTopPages={initialTopPages}
      initialRange="7d"
    />
  );
}