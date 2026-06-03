import React from "react";
import { format } from "date-fns";
import Badge from "@/components/ui/badge/Badge";

interface SubscriptionStatusProps {
  expiresAt: Date | null;
  status: string;
}

export default function SubscriptionStatus({
  expiresAt,
  status,
}: SubscriptionStatusProps) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Lifetime license
  if (expiresAt === null) {
    return (
      <div className="flex flex-col gap-3">
        <Badge variant="light" color="success">
          Lifetime License
        </Badge>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This license does not expire.
        </p>
      </div>
    );
  }

  const expiryDate = new Date(expiresAt);
  const now = Date.now();
  const daysRemaining = Math.ceil(
    (expiryDate.getTime() - now) / MS_PER_DAY
  );
  const formattedDate = format(expiryDate, "MMM d, yyyy");

  // Grace period
  if (status === "grace_period") {
    return (
      <div className="flex flex-col gap-3">
        <Badge variant="light" color="warning">
          Grace Period
        </Badge>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {daysRemaining > 0
            ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining in grace period`
            : "Grace period has ended"}
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-fit"
        >
          Renew License
        </a>
      </div>
    );
  }

  // Expired
  if (daysRemaining <= 0) {
    return (
      <div className="flex flex-col gap-3">
        <Badge variant="light" color="error">
          Expired
        </Badge>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Expired on {formattedDate}
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-fit"
        >
          Renew License
        </a>
      </div>
    );
  }

  // Expiring soon (< 30 days)
  if (daysRemaining < 30) {
    return (
      <div className="flex flex-col gap-3">
        <Badge variant="light" color="warning">
          {daysRemaining} Day{daysRemaining !== 1 ? "s" : ""} Remaining
        </Badge>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Expires on {formattedDate}
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-fit"
        >
          Renew License
        </a>
      </div>
    );
  }

  // Normal (> 30 days)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Expires on {formattedDate}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {daysRemaining} days remaining
      </p>
      <a
        href="/pricing"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors w-fit"
      >
        Renew License
      </a>
    </div>
  );
}
