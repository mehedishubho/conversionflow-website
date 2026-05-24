"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Users } from "lucide-react";

interface CountryData {
  name: string;
  code: string;
  users: number;
  percentage: number;
  change: number;
  flag: string;
}

interface GeographicDistributionProps {
  countries: CountryData[];
  totalUsers: number;
}

export default function GeographicDistribution({
  countries,
  totalUsers,
}: GeographicDistributionProps) {
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Geographic Distribution
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Where your customers are located
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {totalUsers.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Countries</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {countries.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Top Country</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {countries[0]?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Country List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {countries.map((country, index) => (
          <motion.div key={index} variants={item}>
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-800">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-2xl">
                {country.flag}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {country.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {country.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {country.users.toLocaleString()}
                    </div>
                    <div
                      className={`flex items-center justify-end gap-1 text-xs font-medium ${
                        country.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {country.change > 0 ? "+" : ""}
                      {country.change.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-right">
                    {country.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing top {countries.length} countries by user count
        </p>
      </div>
    </div>
  );
}