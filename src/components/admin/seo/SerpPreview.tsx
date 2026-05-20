"use client";

interface SerpPreviewProps {
  title: string;
  description: string;
  url: string;
}

export default function SerpPreview({ title, description, url }: SerpPreviewProps) {
  const displayUrl = url || "https://salesconversionflow.com";
  const truncatedTitle = title.length > 60 ? title.slice(0, 60) + "..." : title;
  const truncatedDesc =
    description.length > 160 ? description.slice(0, 160) + "..." : description;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        SERP Preview
      </p>

      <div className="space-y-1">
        {/* Favicon + URL */}
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="block h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-500" />
          </span>
          <span className="truncate text-sm text-green-700 dark:text-green-400">
            {displayUrl}
          </span>
        </div>

        {/* Title */}
        <p className="text-[18px] leading-snug text-blue-700 hover:underline dark:text-blue-400">
          {truncatedTitle || "Page Title"}
        </p>

        {/* Description */}
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {truncatedDesc || "Meta description will appear here..."}
        </p>
      </div>
    </div>
  );
}
