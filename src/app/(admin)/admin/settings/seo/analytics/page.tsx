import ComponentCard from "@/components/common/ComponentCard";

export default function SeoAnalyticsPage() {
  return (
    <ComponentCard
      title="SEO Analytics"
      desc="View indexed pages, keyword rankings, CTR data, 404 reports, and crawl issues."
    >
      <div className="flex items-center gap-3 py-4">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-400">
          Coming in Phase 13
        </span>
      </div>
    </ComponentCard>
  );
}
