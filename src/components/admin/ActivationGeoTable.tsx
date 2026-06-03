import React from "react";

interface GeoRow {
  code: string;
  name: string;
  count: number;
}

interface ActivationGeoTableProps {
  countries: GeoRow[];
  totalActivations: number;
}

export default function ActivationGeoTable({
  countries,
  totalActivations,
}: ActivationGeoTableProps) {
  if (countries.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No activation geo data available yet.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Country
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Activations
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {countries.map((country) => {
              const percentage =
                totalActivations > 0
                  ? ((country.count / totalActivations) * 100).toFixed(1)
                  : "0.0";
              return (
                <tr key={country.code}>
                  <td className="px-5 py-3 text-sm text-gray-800 dark:text-white/90">
                    {country.name}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-800 dark:text-white/90">
                    {country.count.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Showing top {countries.length} countries by activation count
        </p>
      </div>
    </div>
  );
}
