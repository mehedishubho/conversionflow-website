"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Trash2, Power, PowerOff, Pencil } from "lucide-react";
import Link from "next/link";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type CouponType = "percentage" | "flat";
type CouponScope = "all" | "product" | "plan";

interface CouponRow {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  currentUses: number | null;
  expiresAt: Date | null;
  active: boolean | null;
  createdAt: Date;
  scope: CouponScope;
  productName: string | null;
  applicablePlans: string[];
}

interface CouponsTableProps {
  coupons: CouponRow[];
  onToggleActive: (id: string) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function CouponsTable({
  coupons,
  onToggleActive,
  onDelete,
}: CouponsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    couponId: string;
    couponCode: string;
  }>({ open: false, couponId: "", couponCode: "" });

  const formatValue = (type: CouponType, value: number) => {
    if (type === "percentage") return `${value}%`;
    return `${value.toLocaleString("en-BD")} BDT`;
  };

  const formatUses = (current: number | null, max: number | null) => {
    const c = current ?? 0;
    if (max !== null) return `${c} / ${max}`;
    return `${c} / ∞`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatScope = (coupon: CouponRow) => {
    if (coupon.scope === "all") {
      return <Badge variant="light" color="success" size="sm">All Products</Badge>;
    }
    if (coupon.scope === "product") {
      return (
        <Badge variant="light" color="info" size="sm">
          {coupon.productName ?? "Unknown Product"}
        </Badge>
      );
    }
    return (
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {coupon.applicablePlans.length > 0
          ? coupon.applicablePlans.join(", ")
          : "No plans"}
      </span>
    );
  };

  const handleToggle = (couponId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await onToggleActive(couponId);
      if (result.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await onDelete(deleteModal.couponId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setDeleteModal({ open: false, couponId: "", couponCode: "" });
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
                Code
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Type
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Value
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Applies To
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Min Order
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Uses
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Expires
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No coupons created yet.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isExpired = coupon.expiresAt ? new Date() > new Date(coupon.expiresAt) : false;
                return (
                  <TableRow
                    key={coupon.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <TableCell className="px-5 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white/90">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      <Badge
                        variant="light"
                        color={coupon.type === "percentage" ? "warning" : "info"}
                        size="sm"
                      >
                        {coupon.type === "percentage" ? "Percentage" : "Flat"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatValue(coupon.type, coupon.value)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      {formatScope(coupon)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {coupon.minOrderAmount
                        ? `${coupon.minOrderAmount.toLocaleString("en-BD")} BDT`
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatUses(coupon.currentUses, coupon.maxUses)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(coupon.expiresAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      {isExpired ? (
                        <Badge variant="light" color="error" size="sm">Expired</Badge>
                      ) : coupon.active ? (
                        <Badge variant="light" color="success" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="light" color="light" size="sm">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          title={coupon.active ? "Deactivate" : "Activate"}
                          onClick={() => handleToggle(coupon.id)}
                          disabled={isPending}
                        >
                          {coupon.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                          title="Delete"
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              couponId: coupon.id,
                              couponCode: coupon.code,
                            })
                          }
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => {
          setDeleteModal({ open: false, couponId: "", couponCode: "" });
          setActionError(null);
        }}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Delete coupon &ldquo;{deleteModal.couponCode}&rdquo;?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will permanently delete the coupon. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDeleteModal({ open: false, couponId: "", couponCode: "" });
              setActionError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete Coupon
          </Button>
        </div>
      </Modal>
    </div>
  );
}
