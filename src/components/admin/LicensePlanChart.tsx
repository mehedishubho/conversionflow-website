"use client";

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface LicensePlanChartProps {
  plans: { plan: string; count: number }[];
}

export default function LicensePlanChart({ plans }: LicensePlanChartProps) {
  const labels = plans.map((p) => p.plan.charAt(0).toUpperCase() + p.plan.slice(1));
  const series = plans.map((p) => p.count);

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const options: ApexOptions = {
    colors: ["#465FFF", "#00BF7A", "#FF8800", "#F53B5C", "#6B7280"],
    chart: {
      fontFamily: "DM Sans, sans-serif",
      type: "donut",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      labels: {
        colors: isDark ? "#9CA3AF" : "#6B7280",
      },
    },
    labels,
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
    stroke: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} license${val !== 1 ? "s" : ""}`,
      },
    },
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[400px]">
        {plans.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500 text-sm">
            No license data available.
          </div>
        ) : (
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={300}
          />
        )}
      </div>
    </div>
  );
}
