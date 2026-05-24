"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Package,
  CheckCircle,
  XCircle,
  TrendingDown,
  ShoppingCart,
  Hourglass,
} from "lucide-react";

interface StatusCard {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "red" | "purple" | "orange";
  description: string;
}

interface EcommerceStatusCardsProps {
  stats: {
    pendingOrders: number;
    processingOrders: number;
    completedToday: number;
    refundRate: number;
    totalOrders: number;
    avgFulfillmentTime: string; // in hours or days
  };
  previousDay?: {
    completedToday: number;
    refundRate: number;
  };
}

export default function EcommerceStatusCards({
  stats,
  previousDay,
}: EcommerceStatusCardsProps) {
  const calculateChange = (current: number, previous: number): number => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
      },
      yellow: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const cards: StatusCard[] = [
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <Clock className="w-5 h-5" />,
      color: "yellow",
      description: "Awaiting processing",
    },
    {
      title: "Processing Orders",
      value: stats.processingOrders,
      icon: <Package className="w-5 h-5" />,
      color: "blue",
      description: "Currently being fulfilled",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      change: previousDay ? calculateChange(stats.completedToday, previousDay.completedToday) : undefined,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green",
      description: "Successfully delivered",
    },
    {
      title: "Refund Rate",
      value: `${stats.refundRate.toFixed(1)}%`,
      change: previousDay ? calculateChange(stats.refundRate, previousDay.refundRate) : undefined,
      icon: <XCircle className="w-5 h-5" />,
      color: "red",
      description: "Refund percentage",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "purple",
      description: "All time orders",
    },
    {
      title: "Avg. Fulfillment",
      value: stats.avgFulfillmentTime,
      icon: <Hourglass className="w-5 h-5" />,
      color: "orange",
      description: "Average processing time",
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {cards.map((card, index) => {
        const colorClasses = getColorClasses(card.color);
        return (
          <motion.div key={index} variants={item}>
            <div
              className={`relative overflow-hidden rounded-xl border ${colorClasses.border} ${colorClasses.bg} p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${colorClasses.text}`}
                  >
                    {card.title}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </h3>
                    {card.change !== undefined && card.change !== 0 && (
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          card.change > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendingDown
                          className={`w-3 h-3 ${card.change < 0 ? "" : "rotate-180"}`}
                        />
                        {Math.abs(card.change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}