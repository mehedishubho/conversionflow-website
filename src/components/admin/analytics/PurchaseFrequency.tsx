"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Repeat,
  Clock,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";
import ApexChart from "react-apexcharts";

interface PurchaseFrequencyData {
  frequency: string;
  customers: number;
  percentage: number;
  avgOrderValue: number;
  totalRevenue: number;
}

interface RepeatPurchaseData {
  month: string;
  firstTimeBuyers: number;
  repeatBuyers: number;
  repeatRate: number;
}

interface PurchaseFrequencyProps {
  frequencyData: PurchaseFrequencyData[];
  repeatPurchaseData: RepeatPurchaseData[];
  overallRepeatRate: number;
  avgTimeBetweenPurchases: string;
}

export default function PurchaseFrequency({
  frequencyData,
  repeatPurchaseData,
  overallRepeatRate,
  avgTimeBetweenPurchases,
}: PurchaseFrequencyProps) {
  const chartOptions = {
    chart: {
      type: "bar",
      height: 300,
      fontFamily: "DM Sans, sans-serif",
      background: "transparent",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    colors: ["#465FFF", "#00D4AA"],
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: "#f1f1f1",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: repeatPurchaseData.map((d) => d.month),
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
          fontFamily: "DM Sans, sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
          fontFamily: "DM Sans, sans-serif",
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontFamily: "DM Sans, sans-serif",
      fontWeight: 500,
    },
    tooltip: {
      y: {
        formatter: (value: number) => value.toLocaleString(),
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 250 },
          legend: { position: "bottom", horizontalAlign: "center" },
        },
      },
    ],
  };

  const series = [
    {
      name: "First-time Buyers",
      data: repeatPurchaseData.map((d) => d.firstTimeBuyers),
    },
    {
      name: "Repeat Buyers",
      data: repeatPurchaseData.map((d) => d.repeatBuyers),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Purchase Frequency & Repeat Behavior
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Understand customer purchase patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Repeat Rate
              </p>
              <div className="flex items-center gap-1">
                <Repeat className="w-4 h-4 text-blue-600" />
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {overallRepeatRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Avg Time Between
              </p>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {avgTimeBetweenPurchases}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ApexChart options={chartOptions} series={series} type="bar" height={300} />
      </div>

      {/* Frequency Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Purchase Frequency Distribution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {frequencyData.map((data, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-gray-50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                {index === 0 && <Star className="w-4 h-4 text-yellow-600" />}
                {index === 1 && <Award className="w-4 h-4 text-blue-600" />}
                {index === 2 && <ShoppingCart className="w-4 h-4 text-green-600" />}
                {index === 3 && <Repeat className="w-4 h-4 text-purple-600" />}
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                  {data.frequency}
                </h5>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Customers
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {data.customers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Share
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {data.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Avg Order
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    ৳{data.avgOrderValue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Customer Loyalty Tiers */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Customer Loyalty Distribution
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {frequencyData[0]?.frequency || "One-time"}:{" "}
                {frequencyData[0]?.percentage.toFixed(1) || 0}% |{" "}
                {frequencyData[1]?.frequency || "Repeat"}:{" "}
                {frequencyData[1]?.percentage.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {frequencyData
                .filter((d) => !d.frequency.includes("One-time"))
                .reduce((sum, d) => sum + d.customers, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              repeat customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}