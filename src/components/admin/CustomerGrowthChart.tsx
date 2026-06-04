"use client";

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface CustomerGrowthChartProps {
  categories: string[];
  newSignups: number[];
  cumulativeTotal: number[];
}

export default function CustomerGrowthChart({
  categories,
  newSignups,
  cumulativeTotal,
}: CustomerGrowthChartProps) {
  const options: ApexOptions = {
    colors: ["#465FFF", "#12b76a"],
    chart: {
      fontFamily: "DM Sans, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      width: [0, 2],
      curve: "smooth",
    },
    fill: {
      type: "solid",
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
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
    yaxis: [
      {
        title: { text: "New Signups" },
        labels: {
          style: { fontSize: "12px", colors: ["#465FFF"] },
        },
      },
      {
        opposite: true,
        title: { text: "Total Customers" },
        labels: {
          style: { fontSize: "12px", colors: ["#12b76a"] },
        },
      },
    ],
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
    { name: "New Signups", type: "column", data: newSignups },
    { name: "Total Customers", type: "line", data: cumulativeTotal },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[600px]">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={310}
        />
      </div>
    </div>
  );
}
