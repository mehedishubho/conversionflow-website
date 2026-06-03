import React from "react";
import { Key, ShieldCheck, Clock, XCircle, AlertTriangle, Activity } from "lucide-react";

interface LicenseKPIData {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  gracePeriodLicenses: number;
  activationRate: number;
}

interface LicenseKPIsProps {
  kpis: LicenseKPIData;
}

const kpiConfig = [
  { key: "totalLicenses" as const, label: "Total Licenses", icon: Key, suffix: "" },
  { key: "activeLicenses" as const, label: "Active", icon: ShieldCheck, suffix: "" },
  { key: "expiredLicenses" as const, label: "Expired", icon: Clock, suffix: "" },
  { key: "revokedLicenses" as const, label: "Revoked", icon: XCircle, suffix: "" },
  { key: "gracePeriodLicenses" as const, label: "Grace Period", icon: AlertTriangle, suffix: "" },
  { key: "activationRate" as const, label: "Activation Rate", icon: Activity, suffix: "%" },
];

export default function LicenseKPIs({ kpis }: LicenseKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {kpiConfig.map((config) => {
        const value = kpis[config.key];
        return (
          <div
            key={config.key}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <config.icon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {config.label}
              </span>
              <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                {value.toLocaleString()}{config.suffix}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
}
