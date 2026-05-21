"use client";

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TrafficOverviewChartProps {
  topPages: Array<{ path: string; views: number }>;
  range: string;
}

export default function TrafficOverviewChart({
  topPages,
  range,
}: TrafficOverviewChartProps) {
  if (topPages.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        No traffic data available. Configure GA4 for traffic insights.
      </p>
    );
  }

  const categories = topPages.map((p) => p.path);
  const values = topPages.map((p) => p.views);
  const isBar = range === "7d" || range === "90d";

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "DM Sans, sans-serif",
      height: 310,
      type: isBar ? "bar" : "area",
      toolbar: { show: false },
    },
    ...(isBar
      ? {
          plotOptions: {
            bar: {
              borderRadius: 5,
              columnWidth: "50%",
            },
          },
        }
      : {
          stroke: { curve: "smooth", width: 2 },
          fill: {
            type: "gradient",
            gradient: { opacityFrom: 0.55, opacityTo: 0 },
          },
        }),
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  };

  const series = [{ name: "Pageviews", data: values }];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[600px]">
        <ReactApexChart
          options={options}
          series={series}
          type={isBar ? "bar" : "area"}
          height={310}
        />
      </div>
    </div>
  );
}
