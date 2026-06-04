"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";
import ApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface CLVCohort {
  period: string;
  newCustomers: number;
  avgLTV: number;
  totalRevenue: number;
  retention: number;
}

interface CustomerLifetimeValueProps {
  cohorts: CLVCohort[];
  overallLTV: number;
  ltvGrowth: number;
}

export default function CustomerLifetimeValue({
  cohorts,
  overallLTV,
  ltvGrowth,
}: CustomerLifetimeValueProps) {
  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      fontFamily: "DM Sans, sans-serif",
      background: "transparent",
      toolbar: { show: false },
    },
    colors: ["#465FFF", "#00D4AA"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: cohorts.map((c) => c.period),
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
          fontFamily: "DM Sans, sans-serif",
        },
      },
    },
    yaxis: [
      {
        seriesName: "LTV",
        labels: {
          style: {
            colors: "#64748B",
            fontSize: "12px",
            fontFamily: "DM Sans, sans-serif",
          },
          formatter: (value: number) => `৳${value.toLocaleString()}`,
        },
      },
      {
        seriesName: "Revenue",
        opposite: true,
        labels: {
          style: {
            colors: "#64748B",
            fontSize: "12px",
            fontFamily: "DM Sans, sans-serif",
          },
          formatter: (value: number) => `৳${value.toLocaleString()}`,
        },
      },
    ],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontFamily: "DM Sans, sans-serif",
      fontWeight: 500,
    },
    tooltip: {
      y: {
        formatter: (value: number, opts) => {
          const seriesName = opts?.series?.name;
          return seriesName === "LTV"
            ? `LTV: ৳${value.toLocaleString()}`
            : `Revenue: ৳${value.toLocaleString()}`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 280 },
          legend: { position: "bottom", horizontalAlign: "center" },
        },
      },
    ],
  };

  const series = [
    {
      name: "LTV",
      data: cohorts.map((c) => c.avgLTV),
    },
    {
      name: "Revenue",
      data: cohorts.map((c) => c.totalRevenue),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customer Lifetime Value
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track customer value over time
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Average LTV
            </p>
            <div className="flex items-center gap-2 justify-end">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ৳{overallLTV.toLocaleString()}
              </p>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  ltvGrowth > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${ltvGrowth < 0 ? "rotate-180" : ""}`}
                />
                {ltvGrowth > 0 ? "+" : ""}
                {ltvGrowth.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ApexChart options={chartOptions} series={series} type="area" height={350} />
      </div>

      {/* Cohorts Table */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                Period
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                New Customers
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                Avg LTV
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                Total Revenue
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
                Retention
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {cohorts.map((cohort, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {cohort.period}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cohort.newCustomers.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                  ৳{cohort.avgLTV.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                  ৳{cohort.totalRevenue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      cohort.retention >= 80
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : cohort.retention >= 60
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {cohort.retention.toFixed(1)}%
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Tracking Period
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {cohorts.length} months
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                LTV Growth
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {ltvGrowth > 0 ? "+" : ""}
                {ltvGrowth.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                ৳{cohorts.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}