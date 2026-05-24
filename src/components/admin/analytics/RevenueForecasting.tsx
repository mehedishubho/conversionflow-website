"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import ApexChart from "react-apexcharts";

interface ForecastData {
  month: string;
  actual: number;
  predicted: number;
  confidence: number;
}

interface RevenueForecastingProps {
  forecastData: ForecastData[];
  totalPredicted: number;
  growthRate: number;
  confidence: number;
  nextQuarterPrediction: number;
}

export default function RevenueForecasting({
  forecastData,
  totalPredicted,
  growthRate,
  confidence,
  nextQuarterPrediction,
}: RevenueForecastingProps) {
  const chartOptions = {
    chart: {
      type: "line",
      height: 350,
      fontFamily: "DM Sans, sans-serif",
      background: "transparent",
      toolbar: { show: false },
    },
    colors: ["#465FFF", "#00D4AA", "#FFA600"],
    stroke: {
      curve: "smooth",
      width: [3, 3, 0],
      dashArray: [0, 5, 0],
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
      categories: forecastData.map((d) => d.month),
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
        formatter: (value: number) => `৳${(value / 1000).toFixed(0)}K`,
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
        formatter: (value: number, { seriesIndex }) => {
          return seriesIndex === 1
            ? `Predicted: ৳${value.toLocaleString()}`
            : `Actual: ৳${value.toLocaleString()}`;
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
      name: "Actual Revenue",
      data: forecastData.map((d) => d.actual),
    },
    {
      name: "Predicted Revenue",
      data: forecastData.map((d) => d.predicted),
    },
    {
      name: "Confidence Interval",
      data: forecastData.map((d) => [
        d.predicted * (1 - d.confidence / 100),
        d.predicted * (1 + d.confidence / 100),
      ]),
    },
  ];

  const getConfidenceLevel = (score: number) => {
    if (score >= 85) return { label: "High", color: "text-green-600 bg-green-50 dark:bg-green-900/20" };
    if (score >= 70) return { label: "Medium", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" };
    return { label: "Low", color: "text-red-600 bg-red-50 dark:bg-red-900/20" };
  };

  const confidenceLevel = getConfidenceLevel(confidence);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Forecasting
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-powered revenue predictions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Model Confidence
              </p>
              <div
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${confidenceLevel.color}`}
              >
                {confidenceLevel.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Predicted Revenue
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ৳{totalPredicted.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Next 6 months
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Growth Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {growthRate > 0 ? "+" : ""}
            {growthRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Year over year
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Next Quarter
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ৳{nextQuarterPrediction.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Q3 2026 estimate
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ApexChart options={chartOptions} series={series} type="line" height={350} />
      </div>

      {/* Insights */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              AI Forecast Insights
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  Revenue predicted to grow by {growthRate.toFixed(1)}% over the next 6 months
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  Seasonal patterns indicate strong performance in Q4 2026
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <span>
                  Consider increasing marketing budget in Q3 to maximize growth potential
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Forecast Accuracy
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {confidence.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Data Points
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {forecastData.length} months
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Model Type
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ARIMA + ML
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}