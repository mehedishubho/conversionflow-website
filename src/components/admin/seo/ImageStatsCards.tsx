import ComponentCard from "@/components/common/ComponentCard";
import { Image, CheckCircle, TrendingDown } from "lucide-react";

const STATS = [
  {
    label: "Total Images",
    value: "--",
    icon: Image,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    label: "Optimized",
    value: "--",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
  },
  {
    label: "Savings",
    value: "--",
    icon: TrendingDown,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
] as const;

export default function ImageStatsCards() {
  return (
    <ComponentCard
      title="Image Statistics"
      desc="Overview of image optimization performance."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-lg border border-gray-200 p-5 dark:border-gray-700"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-500/5">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Image statistics require server-side integration. Connect your image processing pipeline to see real data.
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
