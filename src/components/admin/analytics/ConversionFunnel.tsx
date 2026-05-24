"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  MousePointerClick,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  TrendingUp,
  ArrowDown,
} from "lucide-react";

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
  conversionRate: number;
  icon: React.ReactNode;
  color: string;
}

interface ConversionFunnelProps {
  steps: FunnelStep[];
  totalConversionRate: number;
}

export default function ConversionFunnel({
  steps,
  totalConversionRate,
}: ConversionFunnelProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversion Funnel
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customer journey through your site
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Conversion
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalConversionRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="relative">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={item}>
              <div className="relative">
                {/* Step Card */}
                <div
                  className={`relative overflow-hidden rounded-xl border-2 ${
                    step.color === "blue"
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                      : step.color === "green"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : step.color === "purple"
                      ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20"
                      : step.color === "orange"
                      ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
                  } p-4`}
                  style={{
                    width: `${100 - index * 15}%`,
                    margin: "0 auto",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          step.color === "blue"
                            ? "bg-blue-600 text-white"
                            : step.color === "green"
                            ? "bg-green-600 text-white"
                            : step.color === "purple"
                            ? "bg-purple-600 text-white"
                            : step.color === "orange"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {step.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {step.percentage.toFixed(1)}% of previous step
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {step.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {step.conversionRate.toFixed(2)}% conv.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop-off Indicator */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <ArrowDown className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {step.dropOff.toFixed(1)}% drop-off
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Best Performing Step
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {steps.reduce((best, step) =>
                step.conversionRate > best.conversionRate ? step : best
              ).name}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Biggest Drop-off
            </p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {Math.max(...steps.map((s) => s.dropOff)).toFixed(1)}%
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Funnel Efficiency
            </p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {totalConversionRate > 5 ? "Excellent" : totalConversionRate > 2 ? "Good" : "Needs Work"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}