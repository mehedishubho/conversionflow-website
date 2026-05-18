import React from "react";
import { DollarSign, TrendingUp, Users, ShoppingCart, ArrowUp, ArrowDown } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

interface KPIMetric {
  value: number;
  trend: number;
  trendDirection: "up" | "down" | "flat";
}

interface DashboardKPIsProps {
  kpis: {
    totalRevenue: KPIMetric;
    mrr: KPIMetric;
    activeCustomers: KPIMetric;
    totalOrders: KPIMetric;
  };
}

function formatBDT(amount: number): string {
  return amount.toLocaleString("en-BD") + " BDT";
}

const kpiConfig = [
  { key: "totalRevenue" as const, label: "Total Revenue", icon: DollarSign, format: formatBDT },
  { key: "mrr" as const, label: "MRR", icon: TrendingUp, format: formatBDT },
  { key: "activeCustomers" as const, label: "Active Customers", icon: Users, format: (v: number) => v.toLocaleString() },
  { key: "totalOrders" as const, label: "Total Orders", icon: ShoppingCart, format: (v: number) => v.toLocaleString() },
];

export default function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiConfig.map((config) => {
        const kpi = kpis[config.key];
        return (
          <div
            key={config.key}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <config.icon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.label}
                </span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                  {config.format(kpi.value)}
                </h4>
              </div>
              {kpi.trendDirection === "up" && (
                <Badge color="success" size="sm">
                  <ArrowUp className="w-3 h-3" />
                  {kpi.trend.toFixed(1)}%
                </Badge>
              )}
              {kpi.trendDirection === "down" && (
                <Badge color="error" size="sm">
                  <ArrowDown className="w-3 h-3" />
                  {kpi.trend.toFixed(1)}%
                </Badge>
              )}
              {kpi.trendDirection === "flat" && (
                <Badge color="light" size="sm">
                  No change
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
