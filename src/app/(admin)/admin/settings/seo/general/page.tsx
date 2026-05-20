import ComponentCard from "@/components/common/ComponentCard";

export default function SeoGeneralPage() {
  return (
    <ComponentCard
      title="General SEO Settings"
      desc="Configure website title, meta defaults, canonical URL, URL formatting, and auto meta generation."
    >
      <div className="flex items-center gap-3 py-4">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-400">
          Coming in Phase 10
        </span>
      </div>
    </ComponentCard>
  );
}
