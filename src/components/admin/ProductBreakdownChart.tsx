"use client";

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ProductBreakdownChartProps {
  productCategories: string[];
  productSeries: {
    name: string;
    data: number[];
  }[];
}

export default function ProductBreakdownChart({
  productCategories,
  productSeries,
}: ProductBreakdownChartProps) {
  const options: ApexOptions = {
    colors: ["#465FFF", "#12b76a", "#0ba5ec"],
    chart: {
      fontFamily: "DM Sans, sans-serif",
      height: 310,
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        columnWidth: "50%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: productCategories,
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
        formatter: (val: number) => val.toLocaleString() + " licenses",
      },
    },
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[600px]">
        <ReactApexChart
          options={options}
          series={productSeries}
          type="bar"
          height={310}
        />
      </div>
    </div>
  );
}
