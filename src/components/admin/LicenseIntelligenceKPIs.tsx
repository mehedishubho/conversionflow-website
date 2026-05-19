import React from "react";
import { Key, ShieldCheck, Clock, Activity } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

interface LicenseIntelligenceKPIsProps {
  kpis: {
    total: number;
    active: number;
    expiringSoon7d: number;
    expiringSoon30d: number;
    activationRate: number;
  };
}

export default function LicenseIntelligenceKPIs({ kpis }: LicenseIntelligenceKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Licenses */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Key className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Licenses
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {kpis.total.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Active Licenses */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ShieldCheck className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Licenses
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {kpis.active.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Clock className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Expiring Soon
          </span>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <span className="text-sm text-gray-400 dark:text-gray-500">7d:</span>{" "}
              <span className="text-title-sm font-bold text-gray-800 dark:text-white/90">
                {kpis.expiringSoon7d}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-400 dark:text-gray-500">30d:</span>{" "}
              <span className="text-title-sm font-bold text-gray-800 dark:text-white/90">
                {kpis.expiringSoon30d}
              </span>
            </div>
          </div>
          {(kpis.expiringSoon7d > 0 || kpis.expiringSoon30d > 0) && (
            <div className="mt-2">
              <Badge variant="light" color="warning" size="sm">
                Attention needed
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Activation Rate */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Activity className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Activation Rate
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {kpis.activationRate}%
            </h4>
          </div>
          {kpis.activationRate >= 80 ? (
            <Badge variant="light" color="success" size="sm">Healthy</Badge>
          ) : kpis.activationRate >= 50 ? (
            <Badge variant="light" color="warning" size="sm">Monitor</Badge>
          ) : (
            <Badge variant="light" color="error" size="sm">Low</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
