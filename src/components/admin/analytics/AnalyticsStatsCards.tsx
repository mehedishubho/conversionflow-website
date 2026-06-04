"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Eye,
  Activity,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Percent,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down" | "flat";
  prefix?: string;
  suffix?: string;
  description?: string;
}

interface AnalyticsStatsCardsProps {
  stats: {
    sessions: number;
    pageViews: number;
    realTimeUsers: number;
    avgOrderValue: number;
    conversionRate: number;
    customerLifetimeValue: number;
    revenueGrowthRate: number;
  };
  previousPeriod?: Partial<{
    sessions: number;
    pageViews: number;
    avgOrderValue: number;
    conversionRate: number;
  }>;
}

export default function AnalyticsStatsCards({
  stats,
  previousPeriod,
}: AnalyticsStatsCardsProps) {
  const calculateTrend = (current: number, previous: number): "up" | "down" | "flat" => {
    if (!previous) return "flat";
    const change = ((current - previous) / previous) * 100;
    if (change > 0.5) return "up";
    if (change < -0.5) return "down";
    return "flat";
  };

  const calculateChange = (current: number, previous: number): number => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `৳${formatNumber(amount)}`;
  };

  const cards: StatCard[] = [
    {
      title: "Sessions",
      value: stats.sessions,
      change: previousPeriod ? calculateChange(stats.sessions, previousPeriod.sessions ?? 0) : 0,
      icon: <Users className="w-5 h-5" />,
      trend: previousPeriod ? calculateTrend(stats.sessions, previousPeriod.sessions ?? 0) : "flat",
      description: "Total user sessions",
    },
    {
      title: "Page Views",
      value: stats.pageViews,
      change: previousPeriod ? calculateChange(stats.pageViews, previousPeriod.pageViews ?? 0) : 0,
      icon: <Eye className="w-5 h-5" />,
      trend: previousPeriod ? calculateTrend(stats.pageViews, previousPeriod.pageViews ?? 0) : "flat",
      description: "Total pages viewed",
    },
    {
      title: "Real-time Users",
      value: stats.realTimeUsers,
      change: 0,
      icon: <Activity className="w-5 h-5 animate-pulse" />,
      trend: "flat",
      description: "Currently active",
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(stats.avgOrderValue),
      change: previousPeriod ? calculateChange(stats.avgOrderValue, previousPeriod.avgOrderValue ?? 0) : 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      trend: previousPeriod ? calculateTrend(stats.avgOrderValue, previousPeriod.avgOrderValue ?? 0) : "flat",
      description: "Per order average",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(2)}%`,
      change: previousPeriod ? calculateChange(stats.conversionRate, previousPeriod.conversionRate ?? 0) : 0,
      icon: <Percent className="w-5 h-5" />,
      trend: previousPeriod ? calculateTrend(stats.conversionRate, previousPeriod.conversionRate ?? 0) : "flat",
      description: "Visitors to customers",
    },
    {
      title: "Customer LTV",
      value: formatCurrency(stats.customerLifetimeValue),
      change: 0,
      icon: <DollarSign className="w-5 h-5" />,
      trend: "flat",
      description: "Lifetime value per customer",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {cards.map((card, index) => (
        <motion.div key={index} variants={item}>
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </h3>
                  {card.change !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        card.trend === "up"
                          ? "text-green-600"
                          : card.trend === "down"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 ${
                          card.trend === "down" ? "rotate-180" : ""
                        }`}
                      />
                      {Math.abs(card.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                {card.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                {card.icon}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}