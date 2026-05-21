import React from "react";
import {
  Clock,
  Move,
  MousePointerClick,
  Server,
  Gauge,
  Info,
} from "lucide-react";
import ComponentCard from "@/components/common/ComponentCard";

interface MetricConfig {
  key: string;
  name: string;
  icon: React.ElementType;
  value: string;
  description: string;
  target: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "lcp",
    name: "LCP",
    icon: Clock,
    value: "--",
    description: "Measures loading performance.",
    target: "Target: under 2.5s",
  },
  {
    key: "cls",
    name: "CLS",
    icon: Move,
    value: "--",
    description: "Measures visual stability.",
    target: "Target: under 0.1",
  },
  {
    key: "inp",
    name: "INP",
    icon: MousePointerClick,
    value: "--",
    description: "Measures interactivity.",
    target: "Target: under 200ms",
  },
  {
    key: "ttfb",
    name: "TTFB",
    icon: Server,
    value: "--",
    description: "Measures server response time.",
    target: "Target: under 800ms",
  },
];

const OVERALL_METRIC: MetricConfig = {
  key: "overall",
  name: "Overall Score",
  icon: Gauge,
  value: "--",
  description: "Combined performance score.",
  target: "Target: 90+",
};

export default function CoreWebVitalsCards() {
  return (
    <ComponentCard
      title="Core Web Vitals"
      desc="Monitor your site's performance metrics."
    >
      <div className="space-y-6">
        {/* 4 Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.key}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {metric.name}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-300 dark:text-gray-600">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {metric.description}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {metric.target}
                </p>
              </div>
            );
          })}
        </div>

        {/* Overall Score Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <Gauge className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {OVERALL_METRIC.name}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-300 dark:text-gray-600">
            {OVERALL_METRIC.value}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {OVERALL_METRIC.description}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {OVERALL_METRIC.target}
          </p>
        </div>

        {/* API Info Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-500/5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Connect Google PageSpeed Insights API for real monitoring data.
            Current values are placeholders.
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
