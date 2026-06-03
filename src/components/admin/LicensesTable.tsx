"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { revokeLicense, activateLicense, suspendLicense } from "@/app/(admin)/actions/admin-licenses";
import type { LicenseRow } from "@/app/(admin)/actions/admin-licenses";

const statusBadgeMap: Record<string, { color: "success" | "warning" | "error" | "light"; label: string }> = {
  active: { color: "success", label: "Active" },
  expired: { color: "warning", label: "Expired" },
  revoked: { color: "error", label: "Revoked" },
  suspended: { color: "light", label: "Suspended" },
};

export default function LicensesTable({ licenses }: { licenses: LicenseRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    licenseId: string;
    action: "revoke" | "activate" | "suspend";
    label: string;
  }>({ open: false, licenseId: "", action: "revoke", label: "" });

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const shortKey = (key: string) =>
    key.length > 12 ? `${key.slice(0, 6)}...${key.slice(-6)}` : key;

  const handleAction = () => {
    setActionError(null);
    const fn =
      confirmModal.action === "revoke"
        ? revokeLicense
        : confirmModal.action === "activate"
          ? activateLicense
          : suspendLicense;

    startTransition(async () => {
      const result = await fn(confirmModal.licenseId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setConfirmModal({ open: false, licenseId: "", action: "revoke", label: "" });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                License Key
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                User
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Product
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Plan
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Activations
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Expires
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No licenses found.
                </TableCell>
              </TableRow>
            ) : (
              licenses.map((lic) => {
                const badge = statusBadgeMap[lic.status] ?? { color: "light" as const, label: lic.status };
                return (
                  <TableRow
                    key={lic.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <TableCell className="px-5 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white/90">
                      {shortKey(lic.licenseKey)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div>{lic.userName ?? "Unknown"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lic.userEmail ?? ""}</div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {lic.productId}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm capitalize text-gray-700 dark:text-gray-300">
                      {lic.plan}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      <Badge variant="light" color={badge.color} size="sm">
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {lic.currentActivations ?? 0}/{lic.maxActivations ?? 1}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(lic.expiresAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/licenses/${lic.id}/activations`}
                          className="text-xs px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          Activations
                        </Link>
                        {lic.status !== "active" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              setConfirmModal({
                                open: true,
                                licenseId: lic.id,
                                action: "activate",
                                label: "Activate",
                              })
                            }
                            disabled={isPending}
                          >
                            Activate
                          </Button>
                        )}
                        {lic.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setConfirmModal({
                                open: true,
                                licenseId: lic.id,
                                action: "suspend",
                                label: "Suspend",
                              })
                            }
                            disabled={isPending}
                          >
                            Suspend
                          </Button>
                        )}
                        {lic.status !== "revoked" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
                            onClick={() =>
                              setConfirmModal({
                                open: true,
                                licenseId: lic.id,
                                action: "revoke",
                                label: "Revoke",
                              })
                            }
                            disabled={isPending}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, licenseId: "", action: "revoke", label: "" })}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {confirmModal.label} this license?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Are you sure you want to {confirmModal.label.toLowerCase()} this license? This action will be logged.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmModal({ open: false, licenseId: "", action: "revoke", label: "" })}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleAction}
            disabled={isPending}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
