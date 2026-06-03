"use client";

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface LicenseTrendChartProps {
  categories: string[];
  activeData: number[];
  expiredData: number[];
  revokedData: number[];
  graceData: number[];
}

export default function LicenseTrendChart({
  categories,
  activeData,
  expiredData,
  revokedData,
  graceData,
}: LicenseTrendChartProps) {
  const options: ApexOptions = {
    colors: ["#12b76a", "#f79009", "#f04438", "#0ba5ec"],
    chart: {
      fontFamily: "DM Sans, sans-serif",
      height: 310,
      type: "area",
      stacked: true,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
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
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  };

  const series = [
    { name: "Active", data: activeData },
    { name: "Expired", data: expiredData },
    { name: "Revoked", data: revokedData },
    { name: "Grace Period", data: graceData },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[600px]">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
