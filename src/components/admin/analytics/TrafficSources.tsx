"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  Link as LinkIcon,
  Share2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface TrafficSource {
  name: string;
  visits: number;
  percentage: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface TrafficSourcesProps {
  sources: TrafficSource[];
}

export default function TrafficSources({ sources }: TrafficSourcesProps) {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Traffic Sources
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Where your visitors come from
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {sources.map((source, index) => (
          <motion.div key={index} variants={item}>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-800/50 dark:hover:bg-gray-800">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl ${source.color} text-white`}
              >
                {source.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {source.name}
                  </h4>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      source.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {source.change > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(source.change).toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {source.visits.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      visits
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${source.percentage}%`,
                          backgroundColor: source.color.replace("text-", "").replace("bg-", ""),
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                      {source.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total traffic sources
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {sources.length} channels
          </span>
        </div>
      </div>
    </div>
  );
}