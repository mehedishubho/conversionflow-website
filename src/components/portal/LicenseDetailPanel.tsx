"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { LicenseKeyCopy } from "@/components/portal/LicenseKeyCopy";
import { format } from "date-fns";

type ActivationDomain = string;

export type LicenseDetail = {
  id: string;
  licenseKey: string;
  plan: string;
  productId: string;
  status: "active" | "expired" | "revoked" | "suspended";
  activationDomains: ActivationDomain[];
  maxActivations: number;
  currentActivations: number;
  expiresAt: Date | null;
  createdAt: Date | null;
};

interface LicenseDetailPanelProps {
  license: LicenseDetail;
  isOpen: boolean;
  onClose: () => void;
  onDeactivate?: (domain: string) => Promise<void>;
}

const statusBadgeMap: Record<
  LicenseDetail["status"],
  "success" | "warning" | "error" | "light"
> = {
  active: "success",
  expired: "warning",
  revoked: "error",
  suspended: "light",
};

export function LicenseDetailPanel({
  license,
  isOpen,
  onClose,
  onDeactivate,
}: LicenseDetailPanelProps) {
  const [confirmDomain, setConfirmDomain] = useState<string | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleDeactivateClick = (domain: string) => {
    if (confirmDomain === domain) {
      onDeactivate?.(domain);
      setConfirmDomain(null);
    } else {
      setConfirmDomain(domain);
      setTimeout(() => setConfirmDomain(null), 3000);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-gray-400/50 backdrop-blur-[32px] z-40"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 overflow-y-auto shadow-theme-lg z-50"
        style={{
          transform: "translateX(0)",
          transition: "transform 300ms ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Panel content */}
        <div className="p-6">
          {/* Header: license key + status */}
          <div className="flex items-center gap-3 pr-10">
            <LicenseKeyCopy licenseKey={license.licenseKey} />
            <Badge variant="light" color={statusBadgeMap[license.status]}>
              {license.status}
            </Badge>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {license.plan}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Product
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {license.productId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {license.createdAt
                  ? format(new Date(license.createdAt), "MMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expiry
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {license.expiresAt
                  ? format(new Date(license.expiresAt), "MMM d, yyyy")
                  : "Never"}
              </p>
            </div>
          </div>

          {/* Activation domains */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                Activation Domains
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {license.currentActivations} / {license.maxActivations}
              </span>
            </div>

            {license.activationDomains.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No domains activated yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {license.activationDomains.map((domain) => (
                  <li
                    key={domain}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3"
                  >
                    <span className="text-sm text-gray-800 dark:text-white/90">
                      {domain}
                    </span>
                    {onDeactivate && (
                      <button
                        onClick={() => handleDeactivateClick(domain)}
                        className={`text-sm font-medium transition-colors ${
                          confirmDomain === domain
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        }`}
                      >
                        {confirmDomain === domain ? "Confirm?" : "Deactivate"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
