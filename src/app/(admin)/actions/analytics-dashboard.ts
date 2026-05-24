"use server";

import { db } from "@/lib/db";
import { orders, licenses, user } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";

// Types for analytics data
export interface AnalyticsStats {
  sessions: number;
  pageViews: number;
  realTimeUsers: number;
  avgOrderValue: number;
  conversionRate: number;
  customerLifetimeValue: number;
  revenueGrowthRate: number;
}

export interface EcommerceStats {
  pendingOrders: number;
  processingOrders: number;
  completedToday: number;
  refundRate: number;
  totalOrders: number;
  avgFulfillmentTime: string;
}

export interface TrafficData {
  categories: string[];
  sessionsData: number[];
  pageViewsData: number[];
}

export interface PageData {
  path: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgTimeOnPage: string;
}

export interface TrafficSource {
  name: string;
  visits: number;
  percentage: number;
  change: number;
  color: string;
}

export interface DeviceData {
  name: string;
  users: number;
  percentage: number;
  change: number;
  icon: React.ReactNode;
}

export interface CountryData {
  name: string;
  code: string;
  users: number;
  percentage: number;
  change: number;
  flag: string;
}

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
  conversionRate: number;
  color: string;
  icon: React.ReactNode;
}

// Phase 3: Customer Analytics Types
export interface CLVCohort {
  period: string;
  newCustomers: number;
  avgLTV: number;
  totalRevenue: number;
  retention: number;
}

export interface RetentionData {
  month: string;
  startCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  retainedCustomers: number;
  retentionRate: number;
  churnRate: number;
}

export interface PurchaseFrequencyData {
  frequency: string;
  customers: number;
  percentage: number;
  avgOrderValue: number;
  totalRevenue: number;
}

export interface RepeatPurchaseData {
  month: string;
  firstTimeBuyers: number;
  repeatBuyers: number;
  repeatRate: number;
}

export interface CustomerSegment {
  name: string;
  customers: number;
  percentage: number;
  avgLTV: number;
  avgOrders: number;
  avgOrderValue: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

// Phase 4: Advanced Features Types
export interface RealTimeActivity {
  type: "page_view" | "add_to_cart" | "purchase" | "signup";
  user: string;
  action: string;
  timestamp: Date;
  page?: string;
}

export interface ForecastData {
  month: string;
  actual: number;
  predicted: number;
  confidence: number;
}

export interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline: string;
  status: "on_track" | "ahead" | "behind" | "at_risk";
  trend: "up" | "down" | "stable";
}

export interface KPIAlert {
  id: string;
  type: "warning" | "success" | "critical";
  metric: string;
  message: string;
  value: number;
  threshold: number;
}

export interface Anomaly {
  id: string;
  type: "spike" | "drop" | "pattern" | "outlier";
  metric: string;
  severity: "low" | "medium" | "high";
  description: string;
  detectedAt: Date;
  value: number;
  expected: number;
  deviation: number;
  status: "investigating" | "resolved" | "false_positive";
}

// Helper function to get date range
function getDateRange(range: "7d" | "30d" | "90d" | "year") {
  const now = new Date();
  const ranges = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    year: 365,
  };
  const days = ranges[range];
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate: now, days };
}

// Helper function to get previous period
function getPreviousDateRange(range: "7d" | "30d" | "90d" | "year") {
  const { startDate, endDate, days } = getDateRange(range);
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);
  const prevEndDate = new Date(endDate);
  prevEndDate.setDate(prevEndDate.getDate() - days);
  return { startDate: prevStartDate, endDate: prevEndDate };
}

// Get analytics stats
export async function getAnalyticsStats(
  range: "7d" | "30d" | "90d" | "year" = "30d"
): Promise<{
  current: AnalyticsStats;
  previous: Partial<AnalyticsStats>;
}> {
  const { startDate, endDate } = getDateRange(range);
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(range);

  // Current period data
  const [currentOrders, currentCompletedOrders, currentRevenue] = await Promise.all([
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate)
        )
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate),
          eq(orders.status, "completed")
        )
      ),
    db
      .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate),
          lte(orders.createdAt, endDate),
          eq(orders.status, "completed")
        )
      ),
  ]);

  // Previous period data for comparison
  const [prevOrders, prevCompletedOrders, prevRevenue] = await Promise.all([
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, prevStartDate),
          lte(orders.createdAt, prevEndDate)
        )
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, prevStartDate),
          lte(orders.createdAt, prevEndDate),
          eq(orders.status, "completed")
        )
      ),
    db
      .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, prevStartDate),
          lte(orders.createdAt, prevEndDate),
          eq(orders.status, "completed")
        )
      ),
  ]);

  const currentOrderCount = currentOrders[0]?.count || 0;
  const currentCompletedCount = currentCompletedOrders[0]?.count || 0;
  const currentRevenueTotal = currentRevenue[0]?.total || 0;

  const prevOrderCount = prevOrders[0]?.count || 0;
  const prevCompletedCount = prevCompletedOrders[0]?.count || 0;
  const prevRevenueTotal = prevRevenue[0]?.total || 0;

  // Calculate metrics
  const avgOrderValue = currentCompletedCount > 0 ? currentRevenueTotal / currentCompletedCount : 0;
  const conversionRate = currentOrderCount > 0 ? (currentCompletedCount / currentOrderCount) * 100 : 0;

  // Estimate sessions and page views (in real implementation, these would come from analytics tracking)
  const sessions = currentOrderCount * 3; // Rough estimate
  const pageViews = sessions * 4; // Rough estimate

  // Real-time users (random for demo)
  const realTimeUsers = Math.floor(Math.random() * 200) + 50;

  // Customer lifetime value (average order value * average purchases per customer)
  const avgPurchasesPerCustomer = currentCompletedCount > 0 ? currentCompletedCount / Math.max(currentCompletedCount * 0.8, 1) : 0;
  const customerLifetimeValue = avgOrderValue * avgPurchasesPerCustomer * 2; // Assume 2 purchases lifespan

  // Revenue growth rate
  const revenueGrowthRate = prevRevenueTotal > 0
    ? ((currentRevenueTotal - prevRevenueTotal) / prevRevenueTotal) * 100
    : 0;

  const prevAvgOrderValue = prevCompletedCount > 0 ? prevRevenueTotal / prevCompletedCount : 0;
  const prevConversionRate = prevOrderCount > 0 ? (prevCompletedCount / prevOrderCount) * 100 : 0;

  return {
    current: {
      sessions,
      pageViews,
      realTimeUsers,
      avgOrderValue,
      conversionRate,
      customerLifetimeValue,
      revenueGrowthRate,
    },
    previous: {
      sessions: prevOrderCount * 3,
      pageViews: prevOrderCount * 4,
      avgOrderValue: prevAvgOrderValue,
      conversionRate: prevConversionRate,
    },
  };
}

// Get e-commerce stats
export async function getEcommerceStats(): Promise<EcommerceStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pendingOrders, processingOrders, completedToday, refundedOrders, totalOrders] = await Promise.all([
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending")),
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "completed")), // Using completed as "processing" for now
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, today),
          lte(orders.createdAt, tomorrow),
          eq(orders.status, "completed")
        )
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "refunded")),
    db
      .select({ count: count() })
      .from(orders),
  ]);

  const pendingCount = pendingOrders[0]?.count || 0;
  const processingCount = processingOrders[0]?.count || 0; // Using completed count
  const completedTodayCount = completedToday[0]?.count || 0;
  const refundedCount = refundedOrders[0]?.count || 0;
  const totalCount = totalOrders[0]?.count || 0;

  const refundRate = totalCount > 0 ? (refundedCount / totalCount) * 100 : 0;

  // Average fulfillment time (mock - would need order tracking timestamps)
  const avgFulfillmentTime = "2-3 business days";

  return {
    pendingOrders: pendingCount,
    processingOrders: processingCount,
    completedToday: completedTodayCount,
    refundRate,
    totalOrders: totalCount,
    avgFulfillmentTime,
  };
}

// Get traffic data for chart
export async function getTrafficData(
  range: "7d" | "30d" | "90d" | "year" = "30d"
): Promise<TrafficData> {
  const { days } = getDateRange(range);
  const categories: string[] = [];
  const sessionsData: number[] = [];
  const pageViewsData: number[] = [];

  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get orders for this day as proxy for traffic
    const [dayOrders] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, dayStart),
          lte(orders.createdAt, dayEnd)
        )
      );

    const orderCount = dayOrders[0]?.count || 0;

    // Format date label
    if (days <= 7) {
      categories.push(date.toLocaleDateString("en-US", { weekday: "short" }));
    } else if (days <= 30) {
      categories.push(date.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    } else {
      categories.push(date.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    }

    // Estimate traffic from orders (in real implementation, use actual analytics)
    sessionsData.push(orderCount * 3); // Rough estimate
    pageViewsData.push(orderCount * 4); // Rough estimate
  }

  return {
    categories,
    sessionsData,
    pageViewsData,
  };
}

// Get top pages (mock data - would need analytics tracking in production)
export async function getTopPages(limit: number = 10): Promise<PageData[]> {
  // In a real implementation, this would query an analytics table
  // For now, return mock data based on typical pages
  const mockPages: PageData[] = [
    {
      path: "/",
      views: 15234,
      uniqueVisitors: 8934,
      bounceRate: 35.2,
      avgTimeOnPage: "2m 34s",
    },
    {
      path: "/pricing",
      views: 8234,
      uniqueVisitors: 5421,
      bounceRate: 45.8,
      avgTimeOnPage: "3m 12s",
    },
    {
      path: "/features",
      views: 6543,
      uniqueVisitors: 4232,
      bounceRate: 38.9,
      avgTimeOnPage: "4m 56s",
    },
    {
      path: "/docs/installation",
      views: 4521,
      uniqueVisitors: 3211,
      bounceRate: 28.4,
      avgTimeOnPage: "6m 23s",
    },
    {
      path: "/blog/getting-started",
      views: 3876,
      uniqueVisitors: 2876,
      bounceRate: 52.1,
      avgTimeOnPage: "3m 45s",
    },
    {
      path: "/support",
      views: 2345,
      uniqueVisitors: 1876,
      bounceRate: 41.3,
      avgTimeOnPage: "2m 18s",
    },
    {
      path: "/dashboard",
      views: 1987,
      uniqueVisitors: 1654,
      bounceRate: 22.1,
      avgTimeOnPage: "8m 34s",
    },
    {
      path: "/license",
      views: 1654,
      uniqueVisitors: 1234,
      bounceRate: 55.7,
      avgTimeOnPage: "1m 45s",
    },
    {
      path: "/faq",
      views: 1432,
      uniqueVisitors: 1098,
      bounceRate: 32.8,
      avgTimeOnPage: "4m 12s",
    },
    {
      path: "/changelog",
      views: 1187,
      uniqueVisitors: 987,
      bounceRate: 67.3,
      avgTimeOnPage: "1m 23s",
    },
  ];

  return mockPages.slice(0, limit);
}

// Get traffic sources data
export async function getTrafficSources(): Promise<TrafficSource[]> {
  // Import icons for traffic sources
  const { Globe } = await import("lucide-react");
  const { Search } = await import("lucide-react");
  const { Share2 } = await import("lucide-react");
  const { Link } = await import("lucide-react");
  const { Mail } = await import("lucide-react");

  // Mock data - in production would come from analytics tracking
  const sources: TrafficSource[] = [
    {
      name: "Direct",
      visits: 4521,
      percentage: 35.2,
      change: 8.5,
      color: "bg-blue-600",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      name: "Organic Search",
      visits: 3876,
      percentage: 30.2,
      change: 12.3,
      color: "bg-green-600",
      icon: <Search className="w-5 h-5" />,
    },
    {
      name: "Social Media",
      visits: 2543,
      percentage: 19.8,
      change: -3.2,
      color: "bg-purple-600",
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      name: "Referral",
      visits: 1834,
      percentage: 14.3,
      change: 5.7,
      color: "bg-orange-600",
      icon: <Link className="w-5 h-5" />,
    },
    {
      name: "Email",
      visits: 567,
      percentage: 4.4,
      change: 15.2,
      color: "bg-red-600",
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  return sources;
}

// Get device usage data
export async function getDeviceUsage(): Promise<{
  devices: DeviceData[];
  totalUsers: number;
}> {
  // Import icons for devices
  const { Monitor } = await import("lucide-react");
  const { Smartphone } = await import("lucide-react");
  const { Tablet } = await import("lucide-react");

  // Mock data - in production would come from analytics tracking
  const devices: DeviceData[] = [
    {
      name: "Desktop",
      users: 8934,
      percentage: 58.2,
      change: 5.3,
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      name: "Mobile",
      users: 5421,
      percentage: 35.3,
      change: 12.8,
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      name: "Tablet",
      users: 1023,
      percentage: 6.5,
      change: -2.1,
      icon: <Tablet className="w-5 h-5" />,
    },
  ];

  const totalUsers = devices.reduce((sum, device) => sum + device.users, 0);

  return { devices, totalUsers };
}

// Get geographic distribution
export async function getGeographicDistribution(): Promise<{
  countries: CountryData[];
  totalUsers: number;
}> {
  // Mock data - focused on Bangladesh as per project context
  const countries: CountryData[] = [
    {
      name: "Bangladesh",
      code: "BD",
      users: 8934,
      percentage: 68.2,
      change: 15.3,
      flag: "🇧🇩",
    },
    {
      name: "United States",
      code: "US",
      users: 1834,
      percentage: 14.0,
      change: 8.7,
      flag: "🇺🇸",
    },
    {
      name: "United Kingdom",
      code: "UK",
      users: 987,
      percentage: 7.5,
      change: 5.2,
      flag: "🇬🇧",
    },
    {
      name: "India",
      code: "IN",
      users: 654,
      percentage: 5.0,
      change: 12.1,
      flag: "🇮🇳",
    },
    {
      name: "Canada",
      code: "CA",
      users: 432,
      percentage: 3.3,
      change: 3.8,
      flag: "🇨🇦",
    },
    {
      name: "Australia",
      code: "AU",
      users: 287,
      percentage: 2.2,
      change: -1.5,
      flag: "🇦🇺",
    },
  ];

  const totalUsers = countries.reduce((sum, country) => sum + country.users, 0);

  return { countries, totalUsers };
}

// Get conversion funnel data
export async function getConversionFunnel(): Promise<{
  steps: FunnelStep[];
  totalConversionRate: number;
}> {
  // Import icons for funnel steps
  const { Eye } = await import("lucide-react");
  const { MousePointer2 } = await import("lucide-react");
  const { ShoppingCart } = await import("lucide-react");
  const { CreditCard } = await import("lucide-react");
  const { CheckCircle } = await import("lucide-react");

  // Mock conversion funnel data
  const visitors = 50000;
  const pageViews = 35000;
  const addToCart = 8000;
  const checkout = 3500;
  const purchase = 1500;

  const steps: FunnelStep[] = [
    {
      name: "Visitors",
      count: visitors,
      percentage: 100,
      dropOff: 0,
      conversionRate: 100,
      color: "blue",
      icon: <Eye className="w-5 h-5" />,
    },
    {
      name: "Page Views",
      count: pageViews,
      percentage: ((pageViews / visitors) * 100),
      dropOff: ((visitors - pageViews) / visitors) * 100,
      conversionRate: ((pageViews / visitors) * 100),
      color: "green",
      icon: <MousePointer2 className="w-5 h-5" />,
    },
    {
      name: "Add to Cart",
      count: addToCart,
      percentage: ((addToCart / pageViews) * 100),
      dropOff: ((pageViews - addToCart) / pageViews) * 100,
      conversionRate: ((addToCart / visitors) * 100),
      color: "purple",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      name: "Checkout",
      count: checkout,
      percentage: ((checkout / addToCart) * 100),
      dropOff: ((addToCart - checkout) / addToCart) * 100,
      conversionRate: ((checkout / visitors) * 100),
      color: "orange",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      name: "Purchase",
      count: purchase,
      percentage: ((purchase / checkout) * 100),
      dropOff: ((checkout - purchase) / checkout) * 100,
      conversionRate: ((purchase / visitors) * 100),
      color: "blue",
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  const totalConversionRate = (purchase / visitors) * 100;

  return { steps, totalConversionRate };
}

// Phase 3: Customer Analytics Functions

// Get customer lifetime value cohorts
export async function getCustomerLifetimeValue(): Promise<{
  cohorts: CLVCohort[];
  overallLTV: number;
  ltvGrowth: number;
}> {
  // Mock CLV data by month
  const cohorts: CLVCohort[] = [
    {
      period: "Jan 2026",
      newCustomers: 145,
      avgLTV: 12500,
      totalRevenue: 1812500,
      retention: 78.5,
    },
    {
      period: "Feb 2026",
      newCustomers: 167,
      avgLTV: 13200,
      totalRevenue: 2204400,
      retention: 82.1,
    },
    {
      period: "Mar 2026",
      newCustomers: 189,
      avgLTV: 14500,
      totalRevenue: 2740500,
      retention: 79.8,
    },
    {
      period: "Apr 2026",
      newCustomers: 203,
      avgLTV: 15100,
      totalRevenue: 3065300,
      retention: 85.2,
    },
    {
      period: "May 2026",
      newCustomers: 234,
      avgLTV: 16800,
      totalRevenue: 3931200,
      retention: 83.7,
    },
  ];

  const overallLTV = cohorts.reduce((sum, c) => sum + c.avgLTV, 0) / cohorts.length;
  const ltvGrowth = ((cohorts[cohorts.length - 1].avgLTV - cohorts[0].avgLTV) / cohorts[0].avgLTV) * 100;

  return { cohorts, overallLTV, ltvGrowth };
}

// Get customer retention data
export async function getCustomerRetention(): Promise<{
  retentionData: RetentionData[];
  overallRetention: number;
  overallChurn: number;
}> {
  // Mock retention data by month
  const retentionData: RetentionData[] = [
    {
      month: "Jan 2026",
      startCustomers: 1200,
      newCustomers: 145,
      churnedCustomers: 45,
      retainedCustomers: 1155,
      retentionRate: 96.25,
      churnRate: 3.75,
    },
    {
      month: "Feb 2026",
      startCustomers: 1300,
      newCustomers: 167,
      churnedCustomers: 52,
      retainedCustomers: 1248,
      retentionRate: 96.0,
      churnRate: 4.0,
    },
    {
      month: "Mar 2026",
      startCustomers: 1415,
      newCustomers: 189,
      churnedCustomers: 48,
      retainedCustomers: 1367,
      retentionRate: 96.6,
      churnRate: 3.4,
    },
    {
      month: "Apr 2026",
      startCustomers: 1556,
      newCustomers: 203,
      churnedCustomers: 61,
      retainedCustomers: 1495,
      retentionRate: 96.08,
      churnRate: 3.92,
    },
    {
      month: "May 2026",
      startCustomers: 1698,
      newCustomers: 234,
      churnedCustomers: 55,
      retainedCustomers: 1643,
      retentionRate: 96.76,
      churnRate: 3.24,
    },
  ];

  const overallRetention = retentionData.reduce((sum, d) => sum + d.retentionRate, 0) / retentionData.length;
  const overallChurn = retentionData.reduce((sum, d) => sum + d.churnRate, 0) / retentionData.length;

  return { retentionData, overallRetention, overallChurn };
}

// Get purchase frequency data
export async function getPurchaseFrequency(): Promise<{
  frequencyData: PurchaseFrequencyData[];
  repeatPurchaseData: RepeatPurchaseData[];
  overallRepeatRate: number;
  avgTimeBetweenPurchases: string;
}> {
  // Mock frequency distribution
  const frequencyData: PurchaseFrequencyData[] = [
    {
      frequency: "One-time",
      customers: 2341,
      percentage: 45.2,
      avgOrderValue: 2500,
      totalRevenue: 5852500,
    },
    {
      frequency: "2-3 purchases",
      customers: 1678,
      percentage: 32.4,
      avgOrderValue: 3200,
      totalRevenue: 5369600,
    },
    {
      frequency: "4-6 purchases",
      customers: 892,
      percentage: 17.2,
      avgOrderValue: 4100,
      totalRevenue: 3657200,
    },
    {
      frequency: "7+ purchases",
      customers: 267,
      percentage: 5.2,
      avgOrderValue: 5800,
      totalRevenue: 1548600,
    },
  ];

  // Mock repeat purchase trend
  const repeatPurchaseData: RepeatPurchaseData[] = [
    {
      month: "Jan",
      firstTimeBuyers: 145,
      repeatBuyers: 87,
      repeatRate: 37.5,
    },
    {
      month: "Feb",
      firstTimeBuyers: 167,
      repeatBuyers: 103,
      repeatRate: 38.1,
    },
    {
      month: "Mar",
      firstTimeBuyers: 189,
      repeatBuyers: 124,
      repeatRate: 39.6,
    },
    {
      month: "Apr",
      firstTimeBuyers: 203,
      repeatBuyers: 142,
      repeatRate: 41.2,
    },
    {
      month: "May",
      firstTimeBuyers: 234,
      repeatBuyers: 168,
      repeatRate: 41.8,
    },
  ];

  const overallRepeatRate = repeatPurchaseData.reduce((sum, d) => sum + d.repeatRate, 0) / repeatPurchaseData.length;
  const avgTimeBetweenPurchases = "45 days";

  return { frequencyData, repeatPurchaseData, overallRepeatRate, avgTimeBetweenPurchases };
}

// Get customer segmentation
export async function getCustomerSegmentation(): Promise<{
  segments: CustomerSegment[];
}> {
  // Import icons for segments
  const { Diamond } = await import("lucide-react");
  const { Star } = await import("lucide-react");
  const { Award } = await import("lucide-react");
  const { Heart } = await import("lucide-react");

  // Mock customer segments
  const segments: CustomerSegment[] = [
    {
      name: "Diamond",
      customers: 45,
      percentage: 2.8,
      avgLTV: 45000,
      avgOrders: 12,
      avgOrderValue: 7500,
      color: "diamond",
      icon: <Diamond className="w-5 h-5" />,
      description: "Highest value customers",
    },
    {
      name: "Platinum",
      customers: 123,
      percentage: 7.6,
      avgLTV: 28000,
      avgOrders: 8,
      avgOrderValue: 5600,
      color: "platinum",
      icon: <Star className="w-5 h-5" />,
      description: "Premium customers",
    },
    {
      name: "Gold",
      customers: 345,
      percentage: 21.3,
      avgLTV: 15000,
      avgOrders: 5,
      avgOrderValue: 4200,
      color: "gold",
      icon: <Award className="w-5 h-5" />,
      description: "Loyal customers",
    },
    {
      name: "Silver",
      customers: 567,
      percentage: 35.0,
      avgLTV: 8500,
      avgOrders: 3,
      avgOrderValue: 3200,
      color: "silver",
      icon: <Heart className="w-5 h-5" />,
      description: "Regular customers",
    },
    {
      name: "Bronze",
      customers: 543,
      percentage: 33.4,
      avgLTV: 3200,
      avgOrders: 1,
      avgOrderValue: 2500,
      color: "bronze",
      icon: <Heart className="w-5 h-5" />,
      description: "New customers",
    },
  ];

  return { segments };
}

// Phase 4: Advanced Features Functions

// Get real-time analytics data
export async function getRealTimeAnalytics(): Promise<{
  activeUsers: number;
  pageViews: number;
}> {
  // Simulate real-time data
  return {
    activeUsers: Math.floor(Math.random() * 100) + 120,
    pageViews: Math.floor(Math.random() * 500) + 2000,
  };
}

// Get revenue forecasting data
export async function getRevenueForecasting(): Promise<{
  forecastData: ForecastData[];
  totalPredicted: number;
  growthRate: number;
  confidence: number;
  nextQuarterPrediction: number;
}> {
  const forecastData: ForecastData[] = [
    { month: "Jan", actual: 450000, predicted: 455000, confidence: 8 },
    { month: "Feb", actual: 478000, predicted: 482000, confidence: 7 },
    { month: "Mar", actual: 512000, predicted: 518000, confidence: 6 },
    { month: "Apr", actual: 545000, predicted: 538000, confidence: 8 },
    { month: "May", actual: 589000, predicted: 595000, confidence: 9 },
    { month: "Jun", actual: 623000, predicted: 618000, confidence: 10 },
    { month: "Jul", actual: 0, predicted: 678000, confidence: 12 },
    { month: "Aug", actual: 0, predicted: 712000, confidence: 13 },
    { month: "Sep", actual: 0, predicted: 756000, confidence: 14 },
    { month: "Oct", actual: 0, predicted: 823000, confidence: 15 },
    { month: "Nov", actual: 0, predicted: 891000, confidence: 16 },
    { month: "Dec", actual: 0, predicted: 956000, confidence: 18 },
  ];

  const totalPredicted = forecastData
    .filter((d) => d.actual === 0)
    .reduce((sum, d) => sum + d.predicted, 0);

  const growthRate = 15.7;
  const confidence = 82.3;
  const nextQuarterPrediction = 712000;

  return { forecastData, totalPredicted, growthRate, confidence, nextQuarterPrediction };
}

// Get goal tracking data
export async function getGoalTracking(): Promise<{
  goals: Goal[];
  alerts: KPIAlert[];
  overallProgress: number;
}> {
  const goals: Goal[] = [
    {
      id: "monthly-revenue",
      name: "Monthly Revenue Target",
      current: 623000,
      target: 650000,
      unit: "৳",
      deadline: "Jun 30, 2026",
      status: "on_track",
      trend: "up",
    },
    {
      id: "new-customers",
      name: "New Customers",
      current: 234,
      target: 200,
      unit: "customers",
      deadline: "Jun 30, 2026",
      status: "ahead",
      trend: "up",
    },
    {
      id: "conversion-rate",
      name: "Conversion Rate",
      current: 3.2,
      target: 4.0,
      unit: "%",
      deadline: "Jun 30, 2026",
      status: "behind",
      trend: "stable",
    },
    {
      id: "customer-satisfaction",
      name: "Customer Satisfaction",
      current: 87,
      target: 90,
      unit: "score",
      deadline: "Jun 30, 2026",
      status: "at_risk",
      trend: "down",
    },
  ];

  const alerts: KPIAlert[] = [
    {
      id: "conversion-alert",
      type: "warning",
      metric: "Conversion Rate",
      message: "Conversion rate below target for 3 consecutive days",
      value: 3.2,
      threshold: 4.0,
    },
    {
      id: "revenue-success",
      type: "success",
      metric: "Revenue Growth",
      message: "Revenue exceeded monthly target by 8.3%",
      value: 704000,
      threshold: 650000,
    },
  ];

  const overallProgress = 85.7;

  return { goals, alerts, overallProgress };
}

// Get anomaly detection data
export async function getAnomalyDetection(): Promise<{
  anomalies: Anomaly[];
  totalAnomalies: number;
  highSeverityCount: number;
  systemHealth: "healthy" | "degraded" | "critical";
}> {
  const anomalies: Anomaly[] = [
    {
      id: "anomaly-1",
      type: "spike",
      metric: "Traffic",
      severity: "medium",
      description: "Unusual traffic spike detected on pricing page",
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      value: 2341,
      expected: 1200,
      deviation: 95.1,
      status: "investigating",
    },
    {
      id: "anomaly-2",
      type: "drop",
      metric: "Conversion Rate",
      severity: "high",
      description: "Significant drop in conversion rate",
      detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      value: 2.1,
      expected: 3.5,
      deviation: -40.0,
      status: "investigating",
    },
    {
      id: "anomaly-3",
      type: "pattern",
      metric: "Cart Abandonment",
      severity: "low",
      description: "Unusual pattern in cart abandonment",
      detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      value: 78,
      expected: 65,
      deviation: 20.0,
      status: "false_positive",
    },
    {
      id: "anomaly-4",
      type: "outlier",
      metric: "Order Value",
      severity: "low",
      description: "High-value order detected",
      detectedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      value: 45000,
      expected: 5000,
      deviation: 800.0,
      status: "resolved",
    },
  ];

  const totalAnomalies = anomalies.length;
  const highSeverityCount = anomalies.filter((a) => a.severity === "high").length;
  const systemHealth: "healthy" | "degraded" | "critical" =
    highSeverityCount > 2 ? "critical" : highSeverityCount > 0 ? "degraded" : "healthy";

  return { anomalies, totalAnomalies, highSeverityCount, systemHealth };
}