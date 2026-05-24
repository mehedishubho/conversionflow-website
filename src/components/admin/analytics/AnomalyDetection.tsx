"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";

interface Anomaly {
  id: string;
  type: "spike" | "drop" | "pattern" | "outlier";
  metric: string;
  severity: "low" | "medium" | "high";
  description: string;
  detectedAt: Date;
  value: number;
  expected: number;
  deviation: number;
  status: "investigating" | "resolved" | "false_positive";
}

interface AnomalyDetectionProps {
  anomalies: Anomaly[];
  totalAnomalies: number;
  highSeverityCount: number;
  systemHealth: "healthy" | "degraded" | "critical";
}

export default function AnomalyDetection({
  anomalies,
  totalAnomalies,
  highSeverityCount,
  systemHealth,
}: AnomalyDetectionProps) {
  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "spike":
        return <TrendingUp className="w-5 h-5" />;
      case "drop":
        return <TrendingDown className="w-5 h-5" />;
      case "pattern":
        return <Activity className="w-5 h-5" />;
      case "outlier":
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-600 border-red-300 dark:bg-red-900/30 dark:border-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-600 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "investigating":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "false_positive":
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSystemHealth = () => {
    switch (systemHealth) {
      case "healthy":
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          color: "text-green-600 bg-green-50 dark:bg-green-900/20",
          label: "System Healthy",
          description: "All metrics within normal ranges",
        };
      case "degraded":
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
          label: "Performance Degraded",
          description: "Some anomalies detected",
        };
      case "critical":
        return {
          icon: <XCircle className="w-6 h-6" />,
          color: "text-red-600 bg-red-50 dark:bg-red-900/20",
          label: "Critical Issues",
          description: "Multiple high-severity anomalies",
        };
    }
  };

  const health = getSystemHealth();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Anomaly Detection
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-powered anomaly detection and alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${health.color}`}>
              {health.icon}
              <div>
                <p className="text-xs font-medium">{health.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {health.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Total Anomalies
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalAnomalies}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last 30 days
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              High Severity
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {highSeverityCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Requires attention
          </p>
        </div>

        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Resolved
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {anomalies.filter((a) => a.status === "resolved").length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Successfully handled
          </p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Recent Detections
        </h4>
        {anomalies.map((anomaly, index) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800">
                  {getAnomalyIcon(anomaly.type)}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {anomaly.metric}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {anomaly.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  {getStatusIcon(anomaly.status)}
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {anomaly.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Detected</p>
                <p className="font-mono font-medium text-gray-900 dark:text-white">
                  {anomaly.detectedAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Value vs Expected</p>
                <p className="font-mono font-medium text-gray-900 dark:text-white">
                  {anomaly.value} vs {anomaly.expected}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Deviation</p>
                <p className="font-mono font-medium text-gray-900 dark:text-white">
                  {anomaly.deviation > 0 ? "+" : ""}
                  {anomaly.deviation.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {anomalies.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No anomalies detected in the last 30 days
            </p>
          </div>
        )}
      </div>

      {/* Detection Settings */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Detection Algorithm
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Statistical + ML Ensemble
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Sensitivity
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Medium (2σ threshold)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Last Scan
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              5 minutes ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}