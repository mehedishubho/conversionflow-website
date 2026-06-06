import { requireAdmin } from "@/lib/auth-guard";
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
  await requireAdmin(["super_admin", "admin", "support_staff"]);

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