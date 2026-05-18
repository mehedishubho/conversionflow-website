"use client";

import React, { useState, useTransition } from "react";
import DateRangeSelector from "./DateRangeSelector";
import DashboardKPIs from "./DashboardKPIs";
import RevenueChart from "./RevenueChart";
import ActivityFeed from "./ActivityFeed";
import RecentOrdersTable from "./RecentOrdersTable";
import ComponentCard from "@/components/common/ComponentCard";
import {
  getDashboardKPIs,
  getRevenueChartData,
} from "@/app/(admin)/actions/admin-dashboard";
import type { DashboardKPIs as KPIsData, RevenueChartData, AuditEvent, RecentOrder } from "@/app/(admin)/actions/admin-dashboard";

interface DashboardPageClientProps {
  initialKpis: KPIsData;
  initialChartData: RevenueChartData;
  initialActivity: AuditEvent[];
  initialRecentOrders: RecentOrder[];
  initialRange: string;
}

export default function DashboardPageClient({
  initialKpis,
  initialChartData,
  initialActivity,
  initialRecentOrders,
  initialRange,
}: DashboardPageClientProps) {
  const [activeRange, setActiveRange] = useState(initialRange);
  const [isPending, startTransition] = useTransition();

  const [kpis, setKpis] = useState(initialKpis);
  const [chartData, setChartData] = useState(initialChartData);
  const [activity] = useState(initialActivity);
  const [recentOrders] = useState(initialRecentOrders);

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    startTransition(async () => {
      const [newKpis, newChart] = await Promise.all([
        getDashboardKPIs(range as "7d" | "30d" | "90d" | "year"),
        getRevenueChartData(range as "7d" | "30d" | "90d" | "year"),
      ]);
      setKpis(newKpis);
      setChartData(newChart);
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 font-syne">
          Admin Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Key metrics and recent activity at a glance.
        </p>
      </div>

      <DateRangeSelector activeRange={activeRange} onRangeChange={handleRangeChange} />

      <DashboardKPIs kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ComponentCard title="Revenue Trend" desc="Completed order revenue over time.">
            <RevenueChart
              categories={chartData.categories}
              values={chartData.values}
              range={activeRange as "7d" | "30d" | "90d" | "year"}
            />
          </ComponentCard>
        </div>
        <div>
          <ComponentCard title="Recent Activity" desc="Latest system events.">
            <ActivityFeed events={activity} />
          </ComponentCard>
        </div>
      </div>

      <ComponentCard title="Recent Orders" desc="Latest 5 orders across all statuses.">
        <RecentOrdersTable orders={recentOrders} />
      </ComponentCard>
    </div>
  );
}
