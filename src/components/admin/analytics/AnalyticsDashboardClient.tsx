"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import AnalyticsStatsCards from "./AnalyticsStatsCards";
import EcommerceStatusCards from "./EcommerceStatusCards";
import TrafficChart from "./TrafficChart";
import TopPagesTable from "./TopPagesTable";
import TrafficSources from "./TrafficSources";
import DeviceUsage from "./DeviceUsage";
import GeographicDistribution from "./GeographicDistribution";
import ConversionFunnel from "./ConversionFunnel";
import CustomerLifetimeValue from "./CustomerLifetimeValue";
import CustomerRetention from "./CustomerRetention";
import PurchaseFrequency from "./PurchaseFrequency";
import CustomerSegmentation from "./CustomerSegmentation";
import RealTimeAnalytics from "./RealTimeAnalytics";
import RevenueForecasting from "./RevenueForecasting";
import GoalTracking from "./GoalTracking";
import AnomalyDetection from "./AnomalyDetection";
import ComponentCard from "@/components/common/ComponentCard";
import DateRangeSelector from "../DateRangeSelector";
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
import type {
  AnalyticsStats,
  EcommerceStats,
  TrafficData,
  PageData,
  TrafficSource,
  DeviceData,
  CountryData,
  FunnelStep,
  CLVCohort,
  RetentionData,
  PurchaseFrequencyData,
  RepeatPurchaseData,
  CustomerSegment,
  ForecastData,
  Goal,
  KPIAlert,
  Anomaly,
} from "@/app/(admin)/actions/analytics-dashboard";

interface AnalyticsDashboardClientProps {
  initialStats: {
    current: AnalyticsStats;
    previous: Partial<AnalyticsStats>;
  };
  initialEcommerceStats: EcommerceStats;
  initialTrafficData: TrafficData;
  initialTopPages: PageData[];
  initialTrafficSources: TrafficSource[];
  initialDeviceUsage: {
    devices: DeviceData[];
    totalUsers: number;
  };
  initialGeographicDistribution: {
    countries: CountryData[];
    totalUsers: number;
  };
  initialConversionFunnel: {
    steps: FunnelStep[];
    totalConversionRate: number;
  };
  initialCustomerLifetimeValue: {
    cohorts: CLVCohort[];
    overallLTV: number;
    ltvGrowth: number;
  };
  initialCustomerRetention: {
    retentionData: RetentionData[];
    overallRetention: number;
    overallChurn: number;
  };
  initialPurchaseFrequency: {
    frequencyData: PurchaseFrequencyData[];
    repeatPurchaseData: RepeatPurchaseData[];
    overallRepeatRate: number;
    avgTimeBetweenPurchases: string;
  };
  initialCustomerSegmentation: {
    segments: CustomerSegment[];
  };
  initialRealTimeAnalytics: {
    activeUsers: number;
    pageViews: number;
  };
  initialRevenueForecasting: {
    forecastData: ForecastData[];
    totalPredicted: number;
    growthRate: number;
    confidence: number;
    nextQuarterPrediction: number;
  };
  initialGoalTracking: {
    goals: Goal[];
    alerts: KPIAlert[];
    overallProgress: number;
  };
  initialAnomalyDetection: {
    anomalies: Anomaly[];
    totalAnomalies: number;
    highSeverityCount: number;
    systemHealth: "healthy" | "degraded" | "critical";
  };
  initialRange: string;
}

export default function AnalyticsDashboardClient({
  initialStats,
  initialEcommerceStats,
  initialTrafficData,
  initialTopPages,
  initialTrafficSources,
  initialDeviceUsage,
  initialGeographicDistribution,
  initialConversionFunnel,
  initialCustomerLifetimeValue,
  initialCustomerRetention,
  initialPurchaseFrequency,
  initialCustomerSegmentation,
  initialRealTimeAnalytics,
  initialRevenueForecasting,
  initialGoalTracking,
  initialAnomalyDetection,
  initialRange,
}: AnalyticsDashboardClientProps) {
  const [activeRange, setActiveRange] = useState(initialRange);
  const [isPending, startTransition] = useTransition();

  const [stats, setStats] = useState(initialStats);
  const [ecommerceStats, setEcommerceStats] = useState(initialEcommerceStats);
  const [trafficData, setTrafficData] = useState(initialTrafficData);
  const [topPages] = useState(initialTopPages);
  const [trafficSources] = useState(initialTrafficSources);
  const [deviceUsage] = useState(initialDeviceUsage);
  const [geographicDistribution] = useState(initialGeographicDistribution);
  const [conversionFunnel] = useState(initialConversionFunnel);
  const [customerLifetimeValue] = useState(initialCustomerLifetimeValue);
  const [customerRetention] = useState(initialCustomerRetention);
  const [purchaseFrequency] = useState(initialPurchaseFrequency);
  const [customerSegmentation] = useState(initialCustomerSegmentation);
  const [realTimeAnalytics] = useState(initialRealTimeAnalytics);
  const [revenueForecasting] = useState(initialRevenueForecasting);
  const [goalTracking] = useState(initialGoalTracking);
  const [anomalyDetection] = useState(initialAnomalyDetection);

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    startTransition(async () => {
      const [newStats, newTrafficData] = await Promise.all([
        getAnalyticsStats(range as "7d" | "30d" | "90d" | "year"),
        getTrafficData(range as "7d" | "30d" | "90d" | "year"),
      ]);
      setStats(newStats);
      setTrafficData(newTrafficData);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-syne">
            Analytics Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your site performance and user engagement
          </p>
        </div>
        <DateRangeSelector activeRange={activeRange} onRangeChange={handleRangeChange} />
      </div>

      {/* Analytics Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h2>
        <AnalyticsStatsCards
          stats={stats.current}
          previousPeriod={stats.previous}
        />
      </div>

      {/* E-commerce Status Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          E-commerce Overview
        </h2>
        <EcommerceStatusCards stats={ecommerceStats} />
      </div>

      {/* Traffic Chart */}
      <div>
        <ComponentCard
          title="Traffic Analytics"
          desc="Sessions and page views over time"
        >
          <TrafficChart
            categories={trafficData.categories}
            sessionsData={trafficData.sessionsData}
            pageViewsData={trafficData.pageViewsData}
            range={activeRange as "7d" | "30d" | "90d" | "year"}
          />
        </ComponentCard>
      </div>

      {/* Top Pages Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Pages
        </h2>
        <TopPagesTable pages={topPages} limit={10} />
      </div>

      {/* Phase 2: Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <TrafficSources sources={trafficSources} />

        {/* Device Usage */}
        <div>
          <DeviceUsage
            devices={deviceUsage.devices}
            totalUsers={deviceUsage.totalUsers}
          />
        </div>
      </div>

      {/* Geographic Distribution */}
      <div>
        <GeographicDistribution
          countries={geographicDistribution.countries}
          totalUsers={geographicDistribution.totalUsers}
        />
      </div>

      {/* Conversion Funnel */}
      <div>
        <ConversionFunnel
          steps={conversionFunnel.steps}
          totalConversionRate={conversionFunnel.totalConversionRate}
        />
      </div>

      {/* Phase 3: Customer Analytics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Customer Analytics
        </h2>

        {/* Customer Lifetime Value */}
        <div className="mb-6">
          <CustomerLifetimeValue
            cohorts={customerLifetimeValue.cohorts}
            overallLTV={customerLifetimeValue.overallLTV}
            ltvGrowth={customerLifetimeValue.ltvGrowth}
          />
        </div>

        {/* Customer Retention & Purchase Frequency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CustomerRetention
            retentionData={customerRetention.retentionData}
            overallRetention={customerRetention.overallRetention}
            overallChurn={customerRetention.overallChurn}
          />
          <PurchaseFrequency
            frequencyData={purchaseFrequency.frequencyData}
            repeatPurchaseData={purchaseFrequency.repeatPurchaseData}
            overallRepeatRate={purchaseFrequency.overallRepeatRate}
            avgTimeBetweenPurchases={purchaseFrequency.avgTimeBetweenPurchases}
          />
        </div>

        {/* Customer Segmentation */}
        <div>
          <CustomerSegmentation segments={customerSegmentation.segments} />
        </div>
      </div>

      {/* Phase 4: Advanced Features */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Advanced Analytics
        </h2>

        {/* Real-time Analytics & Revenue Forecasting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RealTimeAnalytics
            initialActiveUsers={realTimeAnalytics.activeUsers}
            initialPageViews={realTimeAnalytics.pageViews}
          />
          <RevenueForecasting
            forecastData={revenueForecasting.forecastData}
            totalPredicted={revenueForecasting.totalPredicted}
            growthRate={revenueForecasting.growthRate}
            confidence={revenueForecasting.confidence}
            nextQuarterPrediction={revenueForecasting.nextQuarterPrediction}
          />
        </div>

        {/* Goal Tracking & Anomaly Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalTracking
            goals={goalTracking.goals}
            alerts={goalTracking.alerts}
            overallProgress={goalTracking.overallProgress}
          />
          <AnomalyDetection
            anomalies={anomalyDetection.anomalies}
            totalAnomalies={anomalyDetection.totalAnomalies}
            highSeverityCount={anomalyDetection.highSeverityCount}
            systemHealth={anomalyDetection.systemHealth}
          />
        </div>
      </div>
    </div>
  );
}