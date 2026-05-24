"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Users,
  Eye,
  ShoppingCart,
  TrendingUp,
  Clock,
  Zap,
  Globe,
} from "lucide-react";

interface RealTimeUser {
  id: string;
  page: string;
  duration: number;
  source: string;
  device: string;
  country: string;
}

interface RealTimeActivity {
  type: "page_view" | "add_to_cart" | "purchase" | "signup";
  user: string;
  action: string;
  timestamp: Date;
  page?: string;
}

interface RealTimeAnalyticsProps {
  initialActiveUsers: number;
  initialPageViews: number;
}

export default function RealTimeAnalytics({
  initialActiveUsers,
  initialPageViews,
}: RealTimeAnalyticsProps) {
  const [activeUsers, setActiveUsers] = useState(initialActiveUsers);
  const [pageViews, setPageViews] = useState(initialPageViews);
  const [recentActivity, setRecentActivity] = useState<RealTimeActivity[]>([]);
  const [topPages, setTopPages] = useState<Array<{ page: string; visitors: number }>>([]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update active users randomly
      setActiveUsers((prev) => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(50, prev + change);
      });

      // Update page views randomly
      setPageViews((prev) => prev + Math.floor(Math.random() * 3));

      // Add new activity
      const activities = [
        { type: "page_view" as const, action: "Viewed pricing page", page: "/pricing" },
        { type: "page_view" as const, action: "Viewed features page", page: "/features" },
        { type: "add_to_cart" as const, action: "Added item to cart", page: "/pricing" },
        { type: "signup" as const, action: "Started free trial", page: "/signup" },
        { type: "purchase" as const, action: "Completed purchase", page: "/checkout" },
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const newActivity: RealTimeActivity = {
        ...randomActivity,
        user: `User_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date(),
      };

      setRecentActivity((prev) => [newActivity, ...prev].slice(0, 10));

      // Update top pages
      setTopPages((prev) => {
        const pages = [
          { page: "/", visitors: Math.floor(Math.random() * 100) + 50 },
          { page: "/pricing", visitors: Math.floor(Math.random() * 80) + 30 },
          { page: "/features", visitors: Math.floor(Math.random() * 60) + 20 },
          { page: "/dashboard", visitors: Math.floor(Math.random() * 40) + 10 },
          { page: "/docs", visitors: Math.floor(Math.random() * 30) + 5 },
        ];
        return pages.sort((a, b) => b.visitors - a.visitors);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "page_view":
        return <Eye className="w-4 h-4" />;
      case "add_to_cart":
        return <ShoppingCart className="w-4 h-4" />;
      case "purchase":
        return <TrendingUp className="w-4 h-4" />;
      case "signup":
        return <Users className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "page_view":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "add_to_cart":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "purchase":
        return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
      case "signup":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-800/50";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Real-Time Analytics
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Live user activity and engagement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Active Users
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeUsers}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Currently online
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Page Views
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {pageViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last 30 minutes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Avg Session
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            4m 32s
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Duration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Countries
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            12
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Active now
          </p>
        </motion.div>
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Live Activity Feed
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(
                    activity.type
                  )} shrink-0`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.user} • {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Waiting for activity...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Pages Right Now */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Top Pages Right Now
          </h4>
          <div className="space-y-2">
            {topPages.map((page, index) => (
              <motion.div
                key={page.page}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20"
                        : index === 1
                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {page.page === "/" ? "Home" : page.page}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {page.page}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {page.visitors}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Data updates automatically every 3 seconds</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}