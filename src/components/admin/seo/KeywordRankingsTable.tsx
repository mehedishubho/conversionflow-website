import React from "react";
import { Info } from "lucide-react";

const placeholderRows = Array.from({ length: 5 }, (_, i) => i + 1);

export default function KeywordRankingsTable() {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                URL
              </th>
            </tr>
          </thead>
          <tbody>
            {placeholderRows.map((num) => (
              <tr
                key={num}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 text-gray-400">
                  {num}
                </td>
                <td className="px-4 py-3 text-gray-300 dark:text-gray-600">
                  --
                </td>
                <td className="px-4 py-3 text-gray-300 dark:text-gray-600">
                  --
                </td>
                <td className="px-4 py-3 text-gray-300 dark:text-gray-600">
                  --
                </td>
                <td className="px-4 py-3 text-gray-300 dark:text-gray-600">
                  --
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info banner */}
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-500/5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Connect Google Search Console API for real keyword ranking data.
          Current values are placeholders.
        </p>
      </div>
    </div>
  );
}
