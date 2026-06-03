"use client";

import React, { useState, useTransition } from "react";
import DateRangeSelector from "../DateRangeSelector";
import LicenseKPIs from "../LicenseKPIs";
import LicenseTrendChart from "../LicenseTrendChart";
import ProductBreakdownChart from "../ProductBreakdownChart";
import ActivationGeoTable from "../ActivationGeoTable";
import ComponentCard from "@/components/common/ComponentCard";
import {
  getLicenseChartData,
} from "@/app/(admin)/actions/admin-license-analytics";
import type { LicenseKPIData, GeoRow } from "@/app/(admin)/actions/admin-license-analytics";

interface LicenseAnalyticsClientProps {
  initialKPIs: LicenseKPIData;
  initialCharts: {
    categories: string[];
    trendSeries: { name: string; data: number[] }[];
    productSeries: { name: string; data: number[] }[];
    productCategories: string[];
  };
  initialGeo: GeoRow[];
  initialRange: string;
  cacheEmpty: boolean;
}

export default function LicenseAnalyticsClient({
  initialKPIs,
  initialCharts,
  initialGeo,
  initialRange,
  cacheEmpty,
}: LicenseAnalyticsClientProps) {
  const [range, setRange] = useState(initialRange);
  const [chartData, setChartData] = useState(initialCharts);
  const [isPending, startTransition] = useTransition();

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    startTransition(async () => {
      const data = await getLicenseChartData(
        newRange as "7d" | "30d" | "90d" | "year"
      );
      setChartData(data);
    });
  };

  // Extract trend data for LicenseTrendChart
  const activeData = chartData.trendSeries.find((s) => s.name === "Active")?.data || [];
  const expiredData = chartData.trendSeries.find((s) => s.name === "Expired")?.data || [];
  const revokedData = chartData.trendSeries.find((s) => s.name === "Revoked")?.data || [];
  const graceData = chartData.trendSeries.find((s) => s.name === "Grace Period")?.data || [];

  // Compute total activations for geo percentage
  const totalActivations = initialGeo.reduce((sum, g) => sum + g.count, 0);

  return (
    <div>
      <DateRangeSelector activeRange={range} onRangeChange={handleRangeChange} />

      {cacheEmpty && (
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          No analytics snapshot available yet. Data will appear after the daily aggregation runs.
        </div>
      )}

      <LicenseKPIs kpis={initialKPIs} />

      <p className="text-xs text-gray-400 mt-2 mb-6">
        Data refreshed daily at 1:00 AM UTC
      </p>

      <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
        <div className="mb-6">
          <ComponentCard title="License Trend">
            <LicenseTrendChart
              categories={chartData.categories}
              activeData={activeData}
              expiredData={expiredData}
              revokedData={revokedData}
              graceData={graceData}
            />
          </ComponentCard>
        </div>

        <div className="mb-6">
          <ComponentCard title="Product Breakdown">
            <ProductBreakdownChart
              productCategories={chartData.productCategories}
              productSeries={chartData.productSeries}
            />
          </ComponentCard>
        </div>

        <div className="mb-6">
          <ComponentCard title="Activation Geography">
            <ActivationGeoTable
              countries={initialGeo}
              totalActivations={totalActivations}
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
