import React from "react";

interface TopPagesTableProps {
  topPages: Array<{ path: string; views: number }>;
}

export default function TopPagesTable({ topPages }: TopPagesTableProps) {
  if (topPages.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        No page data available. Configure GA4 for traffic insights.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Page Path
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Views
            </th>
          </tr>
        </thead>
        <tbody>
          {topPages.map((page, index) => (
            <tr
              key={page.path}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3 text-gray-400">
                {index + 1}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                {page.path}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {page.views.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
