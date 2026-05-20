"use client";

interface SeoScoreProps {
  filled: number;
  total: number;
  percentage: number;
}

export default function SeoScore({ filled, total, percentage }: SeoScoreProps) {
  const barColor =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          SEO Score
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filled} of {total} fields configured ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
