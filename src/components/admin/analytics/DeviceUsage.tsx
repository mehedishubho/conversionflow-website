"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DeviceData {
  name: string;
  users: number;
  percentage: number;
  change: number;
  icon: React.ReactNode;
}

interface DeviceUsageProps {
  devices: DeviceData[];
  totalUsers: number;
}

export default function DeviceUsage({ devices, totalUsers }: DeviceUsageProps) {
  const chartOptions = {
    chart: {
      type: "donut",
      height: 350,
      fontFamily: "DM Sans, sans-serif",
      background: "transparent",
    },
    labels: devices.map((d) => d.name),
    colors: ["#465FFF", "#00D4AA", "#FFA600"],
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%";
      },
      style: {
        fontSize: "14px",
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 500,
      },
    },
    legend: {
      position: "bottom",
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
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 500,
              color: "#64748B",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 700,
              color: "#1E293B",
              formatter: function (val: number) {
                return val.toFixed(0) + "%";
              },
            },
            total: {
              show: true,
              label: "Total Users",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 500,
              color: "#64748B",
              formatter: function () {
                return totalUsers.toLocaleString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(1) + "%";
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
            height: 280,
          },
          legend: {
            position: "bottom",
            fontSize: "12px",
          },
        },
      },
    ],
  };

  const series = devices.map((d) => d.percentage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Device Stats */}
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Device Usage
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            How visitors access your site
          </p>
        </div>

        {devices.map((device, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-800/50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              {device.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {device.name}
                </h4>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    device.change > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {device.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(device.change).toFixed(1)}%
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {device.users.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    users
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {device.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center">
        <div className="w-full">
          <ApexChart
            options={chartOptions}
            series={series}
            type="donut"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}