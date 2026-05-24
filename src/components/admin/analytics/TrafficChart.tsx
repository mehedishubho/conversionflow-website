"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, Users, Eye } from "lucide-react";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TrafficChartProps {
  categories: string[];
  sessionsData: number[];
  pageViewsData: number[];
  range: "7d" | "30d" | "90d" | "year";
}

export default function TrafficChart({
  categories,
  sessionsData,
  pageViewsData,
  range,
}: TrafficChartProps) {
  const chartOptions = useMemo(() => {
    const isShortPeriod = range === "7d" || range === "90d";

    return {
      chart: {
        type: isShortPeriod ? "bar" : "area",
        stacked: false,
        height: 350,
        toolbar: {
          show: false,
        },
        fontFamily: "DM Sans, sans-serif",
        background: "transparent",
      },
      plotOptions: isShortPeriod
        ? {
            bar: {
              horizontal: false,
              columnWidth: "55%",
              endingShape: "rounded",
            },
          }
        : {
            area: {
              fillTo: "origin",
            },
          },
      colors: ["#465FFF", "#00D4AA"],
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: true,
        borderColor: "#f1f1f1",
        strokeDashArray: 4,
        row: {
          colors: ["transparent"],
          opacity: 0.5,
        },
      },
      stroke: isShortPeriod
        ? {
            show: true,
            width: 2,
            colors: ["transparent"],
          }
        : {
            show: true,
            width: 2,
            colors: ["#465FFF", "#00D4AA"],
            curve: "smooth",
          },
      xaxis: {
        categories: categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#64748B",
            fontSize: "12px",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 400,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#64748B",
            fontSize: "12px",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 400,
          },
          formatter: (value: number) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toString();
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "14px",
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 500,
        markers: {
          radius: 12,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 0,
        },
      },
      fill: isShortPeriod
        ? {
            opacity: 1,
          }
        : {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.2,
              stops: [0, 90, 100],
            },
          },
      tooltip: {
        y: {
          formatter: (value: number) => {
            if (value >= 1000) {
              return `${value.toLocaleString()} views`;
            }
            return `${value} views`;
          },
        },
      },
      theme: {
        mode: "light",
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250,
            },
            legend: {
              position: "bottom",
              horizontalAlign: "center",
            },
          },
        },
      ],
    };
  }, [categories, range]);

  const series = useMemo(
    () => [
      {
        name: "Sessions",
        data: sessionsData,
      },
      {
        name: "Page Views",
        data: pageViewsData,
      },
    ],
    [sessionsData, pageViewsData]
  );

  const totalSessions = sessionsData.reduce((sum, val) => sum + val, 0);
  const totalPageViews = pageViewsData.reduce((sum, val) => sum + val, 0);
  const avgSessions = Math.round(totalSessions / sessionsData.length);
  const avgPageViews = Math.round(totalPageViews / pageViewsData.length);

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Sessions</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {totalSessions >= 1000 ? `${(totalSessions / 1000).toFixed(1)}K` : totalSessions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40">
            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Page Views</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {totalPageViews >= 1000 ? `${(totalPageViews / 1000).toFixed(1)}K` : totalPageViews}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Sessions</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {avgSessions >= 1000 ? `${(avgSessions / 1000).toFixed(1)}K` : avgSessions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Page Views</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {avgPageViews >= 1000 ? `${(avgPageViews / 1000).toFixed(1)}K` : avgPageViews}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <ApexChart
          options={chartOptions}
          series={series}
          type={range === "7d" || range === "90d" ? "bar" : "area"}
          height={350}
        />
      </div>
    </div>
  );
}