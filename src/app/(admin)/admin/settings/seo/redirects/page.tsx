import ComponentCard from "@/components/common/ComponentCard";

export default function SeoRedirectsPage() {
  return (
    <ComponentCard
      title="Redirect Manager"
      desc="Manage URL redirects with 301/302 support, regex patterns, bulk import/export, and hit tracking."
    >
      <div className="flex items-center gap-3 py-4">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-400">
          Coming in Phase 12
        </span>
      </div>
    </ComponentCard>
  );
}
