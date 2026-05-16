"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ChangelogExpandableProps {
  changelog: string | null;
}

export function ChangelogExpandable({ changelog }: ChangelogExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!changelog) {
    return <span className="text-sm text-gray-400">No changelog</span>;
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
      >
        {isExpanded ? "Hide changelog" : "View changelog"}
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {isExpanded && (
        <div className="mt-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 whitespace-pre-wrap dark:bg-white/5 dark:text-gray-400">
          {changelog}
        </div>
      )}
    </div>
  );
}
