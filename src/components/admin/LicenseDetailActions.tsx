"use client";

import React, { useTransition } from "react";
import PiracyFlagBadge from "@/components/admin/PiracyFlagBadge";
import {
  dismissPiracyFlag,
  suspendLicense,
  revokeLicense,
} from "@/app/(admin)/actions/admin-licenses";
import type { PiracyFlag } from "@/lib/piracy-detection";

interface LicenseDetailActionsProps {
  licenseId: string;
  licenseKey: string;
  flags: PiracyFlag[];
}

export default function LicenseDetailActions({
  licenseId,
  licenseKey,
  flags,
}: LicenseDetailActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleDismiss(flagType: string) {
    const confirmed = window.confirm(
      `Dismiss piracy flag on license ${licenseKey.slice(0, 12)}...?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await dismissPiracyFlag(licenseId, flagType);
      window.location.reload();
    });
  }

  function handleSuspend() {
    const confirmed = window.confirm(
      `Suspend license ${licenseKey.slice(0, 12)}...? The customer will lose access immediately.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await suspendLicense(licenseId, "Piracy detected");
      window.location.reload();
    });
  }

  function handleRevoke() {
    const confirmed = window.confirm(
      `Revoke license ${licenseKey.slice(0, 12)}...? This is permanent and cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await revokeLicense(licenseId, "Piracy detected");
      window.location.reload();
    });
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div
          key={flag.type}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <div className="flex items-center gap-3">
            <PiracyFlagBadge severity={flag.severity} type={flag.type} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {flag.description}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDismiss(flag.type)}
              disabled={isPending}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dismiss
            </button>
            <button
              onClick={handleSuspend}
              disabled={isPending}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suspend
            </button>
            <button
              onClick={handleRevoke}
              disabled={isPending}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revoke
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
