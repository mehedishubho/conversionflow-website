import React from "react";
import Badge from "@/components/ui/badge/Badge";
import type { ActivationDomain } from "@/lib/webhook-types";

interface LicenseDomainTableProps {
  domains: ActivationDomain[];
}

export default function LicenseDomainTable({ domains }: LicenseDomainTableProps) {
  if (!domains.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
        No activation domains recorded for this license.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Domain
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              First Seen
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Last Verified
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Country
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Multisite
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => (
            <tr
              key={domain.domain}
              className="border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                {domain.domain}
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                {new Date(domain.activatedAt).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                {new Date(domain.lastVerifiedAt).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                {domain.country}
              </td>
              <td className="py-3 px-4">
                {domain.isMultisite ? (
                  <Badge variant="light" color="info" size="sm">
                    Yes
                  </Badge>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">No</span>
                )}
              </td>
              <td className="py-3 px-4">
                {domain.isActive ? (
                  <Badge variant="light" color="success" size="sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="light" color="light" size="sm">
                    Inactive
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
