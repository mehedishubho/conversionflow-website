import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboardClient from "@/components/admin/analytics/AnalyticsDashboardClient";
import {
  getAnalyticsStats,
  getEcommerceStats,
  getTrafficData,
  getTopPages,
  getTrafficSources,
  getDeviceUsage,
  getGeographicDistribution,
  getConversionFunnel,
  getCustomerLifetimeValue,
  getCustomerRetention,
  getPurchaseFrequency,
  getCustomerSegmentation,
  getRealTimeAnalytics,
  getRevenueForecasting,
  getGoalTracking,
  getAnomalyDetection,
} from "@/app/(admin)/actions/analytics-dashboard";

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
    userRole !== "admin" &&
    userRole !== "super_admin" &&
    userRole !== "support_staff"
  ) {
    redirect("/dashboard");
  }

  // Fetch initial data
  const [stats, ecommerceStats, trafficData, topPages, trafficSources, deviceUsage, geographicDistribution, conversionFunnel, customerLifetimeValue, customerRetention, purchaseFrequency, customerSegmentation, realTimeAnalytics, revenueForecasting, goalTracking, anomalyDetection] = await Promise.all([
    getAnalyticsStats("30d"),
    getEcommerceStats(),
    getTrafficData("30d"),
    getTopPages(10),
    getTrafficSources(),
    getDeviceUsage(),
    getGeographicDistribution(),
    getConversionFunnel(),
    getCustomerLifetimeValue(),
    getCustomerRetention(),
    getPurchaseFrequency(),
    getCustomerSegmentation(),
    getRealTimeAnalytics(),
    getRevenueForecasting(),
    getGoalTracking(),
    getAnomalyDetection(),
  ]);

  return (
    <AnalyticsDashboardClient
      initialStats={stats}
      initialEcommerceStats={ecommerceStats}
      initialTrafficData={trafficData}
      initialTopPages={topPages}
      initialTrafficSources={trafficSources}
      initialDeviceUsage={deviceUsage}
      initialGeographicDistribution={geographicDistribution}
      initialConversionFunnel={conversionFunnel}
      initialCustomerLifetimeValue={customerLifetimeValue}
      initialCustomerRetention={customerRetention}
      initialPurchaseFrequency={purchaseFrequency}
      initialCustomerSegmentation={customerSegmentation}
      initialRealTimeAnalytics={realTimeAnalytics}
      initialRevenueForecasting={revenueForecasting}
      initialGoalTracking={goalTracking}
      initialAnomalyDetection={anomalyDetection}
      initialRange="30d"
    />
  );
}