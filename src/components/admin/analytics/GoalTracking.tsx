"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Zap,
} from "lucide-react";

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline: string;
  status: "on_track" | "ahead" | "behind" | "at_risk";
  trend: "up" | "down" | "stable";
}

interface KPIAlert {
  id: string;
  type: "warning" | "success" | "critical";
  metric: string;
  message: string;
  value: number;
  threshold: number;
}

interface GoalTrackingProps {
  goals: Goal[];
  alerts: KPIAlert[];
  overallProgress: number;
}

export default function GoalTracking({
  goals,
  alerts,
  overallProgress,
}: GoalTrackingProps) {
  const getGoalStatus = (status: string) => {
    switch (status) {
      case "ahead":
        return {
          icon: <Award className="w-5 h-5" />,
          color: "text-green-600 bg-green-50 dark:bg-green-900/20",
          label: "Ahead of Target",
        };
      case "on_track":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
          label: "On Track",
        };
      case "behind":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
          label: "Behind Target",
        };
      case "at_risk":
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: "text-red-600 bg-red-50 dark:bg-red-900/20",
          label: "At Risk",
        };
      default:
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
          label: "Unknown",
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-600";
    if (percentage >= 75) return "bg-blue-600";
    if (percentage >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Goal Tracking & KPIs
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor business objectives and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {overallProgress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Overall Goal Progress
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {overallProgress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-full rounded-full ${getProgressColor(overallProgress)}`}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {goals.map((goal, index) => {
          const status = getGoalStatus(goal.status);
          const progress = (goal.current / goal.target) * 100;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {goal.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: {goal.target} {goal.unit} by {goal.deadline}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${status.color}`}
                >
                  {status.icon}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {goal.current} / {goal.target}
                    </span>
                    <div className="flex items-center gap-1">
                      {goal.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : goal.trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Zap className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${getProgressColor(progress)}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* KPI Alerts */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Active KPI Alerts
        </h4>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                alert.type === "critical"
                  ? "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  : alert.type === "warning"
                  ? "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                  : "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 shrink-0">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.metric}
                  </p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {alert.value} / {alert.threshold}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All KPIs are within normal ranges
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              On Track
            </p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {goals.filter((g) => g.status === "on_track" || g.status === "ahead").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Need Attention
            </p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {goals.filter((g) => g.status === "behind").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              At Risk
            </p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {goals.filter((g) => g.status === "at_risk").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}