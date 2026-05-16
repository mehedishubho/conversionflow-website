import React from "react";
import { Shield, Clock, Download, Ticket } from "lucide-react";
import { MetricCard } from "@/components/portal/MetricCard";

interface DashboardMetricsProps {
  metrics: {
    activeLicenses: number;
    expiringSoon: number;
    recentDownloads: number;
    openTickets: number;
  };
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      <MetricCard
        icon={<Shield className="text-green dark:text-green size-6" />}
        label="Active Licenses"
        value={metrics.activeLicenses}
        iconBgClass="bg-green-lt dark:bg-green-lt"
      />
      <MetricCard
        icon={<Clock className="text-orange dark:text-orange size-6" />}
        label="Expiring Soon"
        value={metrics.expiringSoon}
        iconBgClass="bg-orange-lt dark:bg-orange-lt"
      />
      <MetricCard
        icon={<Download className="text-accent dark:text-accent size-6" />}
        label="Downloads"
        value={metrics.recentDownloads}
        iconBgClass="bg-accent-light dark:bg-accent-light"
      />
      <MetricCard
        icon={<Ticket className="text-orange dark:text-orange size-6" />}
        label="Open Tickets"
        value={metrics.openTickets}
        iconBgClass="bg-orange-lt dark:bg-orange-lt"
      />
    </div>
  );
}
