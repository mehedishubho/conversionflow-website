"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Diamond,
  Star,
  Heart,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

interface CustomerSegment {
  name: string;
  customers: number;
  percentage: number;
  avgLTV: number;
  avgOrders: number;
  avgOrderValue: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface CustomerSegmentationProps {
  segments: CustomerSegment[];
}

export default function CustomerSegmentation({
  segments,
}: CustomerSegmentationProps) {
  const getSegmentBgColor = (color: string) => {
    const colors = {
      diamond: "bg-gray-100 dark:bg-gray-800",
      platinum: "bg-gray-100 dark:bg-gray-800",
      gold: "bg-yellow-50 dark:bg-yellow-900/20",
      silver: "bg-blue-50 dark:bg-blue-900/20",
      bronze: "bg-orange-50 dark:bg-orange-900/20",
    };
    return colors[color as keyof typeof colors] || "bg-gray-50 dark:bg-gray-800/50";
  };

  const getSegmentTextColor = (color: string) => {
    const colors = {
      diamond: "text-gray-600 dark:text-gray-400",
      platinum: "text-gray-600 dark:text-gray-400",
      gold: "text-yellow-600 dark:text-yellow-400",
      silver: "text-blue-600 dark:text-blue-400",
      bronze: "text-orange-600 dark:text-orange-400",
    };
    return colors[color as keyof typeof colors] || "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer Segmentation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Categorize customers by value and behavior
        </p>
      </div>

      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-xl border-2 ${
              segment.color === "diamond"
                ? "border-gray-300 dark:border-gray-600"
                : segment.color === "gold"
                ? "border-yellow-300 dark:border-yellow-600"
                : segment.color === "silver"
                ? "border-blue-300 dark:border-blue-600"
                : "border-orange-300 dark:border-orange-600"
            } ${getSegmentBgColor(segment.color)} p-4 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${getSegmentTextColor(
                    segment.color
                  )} ${getSegmentBgColor(segment.color)}`}
                >
                  {segment.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {segment.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {segment.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Customers
                </span>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {segment.customers.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({segment.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Avg LTV
                </span>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    ৳{segment.avgLTV.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Avg Orders
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {segment.avgOrders.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Avg Order Value
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  ৳{segment.avgOrderValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                <div
                  className={`h-full rounded-full ${
                    segment.color === "diamond"
                      ? "bg-gray-500"
                      : segment.color === "gold"
                      ? "bg-yellow-500"
                      : segment.color === "silver"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${segment.percentage}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Segment Insights */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Top Performing Segment
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {segments.reduce((best, current) =>
                  current.avgLTV > best.avgLTV ? current : best
                ).name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Highest Value Customers
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {
                segments.reduce((best, current) =>
                  current.avgLTV > best.avgLTV ? current : best
                ).customers
              }
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {" "}
                customers
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Opportunity Analysis */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Growth Opportunities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Upgrade Potential
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {segments
                  .filter((s) => s.color === "bronze" || s.color === "silver")
                  .reduce((sum, s) => sum + s.customers, 0)
                  .toLocaleString()}{" "}
                customers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Retention Priority
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {segments
                  .filter((s) => s.color === "gold" || s.color === "platinum")
                  .reduce((sum, s) => sum + s.customers, 0)
                  .toLocaleString()}{" "}
                customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}