"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserMinus,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

interface RetentionData {
  month: string;
  startCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  retainedCustomers: number;
  retentionRate: number;
  churnRate: number;
}

interface CustomerRetentionProps {
  retentionData: RetentionData[];
  overallRetention: number;
  overallChurn: number;
}

export default function CustomerRetention({
  retentionData,
  overallRetention,
  overallChurn,
}: CustomerRetentionProps) {
  const getRetentionColor = (rate: number): string => {
    if (rate >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (rate >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  const getChurnColor = (rate: number): string => {
    if (rate <= 5) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (rate <= 10) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Customer Retention & Churn
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track customer loyalty and attrition
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Retention Rate
              </p>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-green-600" />
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {overallRetention.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Churn Rate
              </p>
              <div className="flex items-center gap-1">
                <UserMinus className="w-4 h-4 text-red-600" />
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {overallChurn.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retention Trend */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600 text-white">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Customer Health
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {overallRetention >= 80
                  ? "Excellent - Strong customer loyalty"
                  : overallRetention >= 60
                  ? "Good - Room for improvement"
                  : "Needs attention - High churn rate"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {retentionData[retentionData.length - 1]?.retainedCustomers || 0}{" "}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                active customers
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-3">
        {retentionData.map((data, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.month}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Started with {data.startCustomers.toLocaleString()} customers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRetentionColor(
                    data.retentionRate
                  )}`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {data.retentionRate.toFixed(1)}%
                </div>
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getChurnColor(
                    data.churnRate
                  )}`}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {data.churnRate.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Customer Flow */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Start
                </p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {data.startCustomers.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  New
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  +{data.newCustomers.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Churned
                </p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  -{data.churnedCustomers.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Retained
                </p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {data.retainedCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Best Month
            </p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {
                retentionData.reduce((best, current) =>
                  current.retentionRate > best.retentionRate ? current : best
                ).month
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {
                retentionData.reduce((best, current) =>
                  current.retentionRate > best.retentionRate ? current : best
                ).retentionRate.toFixed(1)
              }
              % retention
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Total Churned
            </p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {retentionData.reduce((sum, d) => sum + d.churnedCustomers, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              customers
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Net Growth
            </p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {retentionData
                .reduce((sum, d) => sum + (d.newCustomers - d.churnedCustomers), 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}