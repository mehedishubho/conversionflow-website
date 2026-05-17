"use client";

import React, { useState, useMemo, useTransition } from "react";
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
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type OrderStatus = "pending" | "completed" | "failed" | "refunded";
type PaymentMethod = "bkash" | "nagad" | "rocket" | "bank_transfer" | "ssl_commerz";

interface OrderRow {
  id: string;
  userName: string | null;
  userEmail: string | null;
  plan: string;
  amount: number;
  paymentMethod: PaymentMethod | null;
  status: OrderStatus;
  paymentRef: string | null;
  createdAt: Date;
}

interface OrdersTableProps {
  orders: OrderRow[];
  onVerify: (id: string) => Promise<{ success?: boolean; error?: string }>;
  onReject: (id: string, reason: string) => Promise<{ success?: boolean; error?: string }>;
  onRefund: (id: string, reason?: string) => Promise<{ success?: boolean; error?: string }>;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const statusBadgeMap: Record<OrderStatus, { color: "warning" | "success" | "error" | "light"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  completed: { color: "success", label: "Completed" },
  failed: { color: "error", label: "Failed" },
  refunded: { color: "light", label: "Refunded" },
};

const paymentMethodLabels: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
  ssl_commerz: "SSL Commerce",
};

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const methodFilterOptions = [
  { value: "", label: "All Methods" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "ssl_commerz", label: "SSL Commerce" },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function OrdersTable({
  orders,
  onVerify,
  onReject,
  onRefund,
}: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    orderId: string;
  }>({ open: false, orderId: "" });
  const [refundModal, setRefundModal] = useState<{
    open: boolean;
    orderId: string;
  }>({ open: false, orderId: "" });
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false;
      if (methodFilter && order.paymentMethod !== methodFilter) return false;
      return true;
    });
  }, [orders, statusFilter, methodFilter]);

  // Format amount in BDT
  const formatBDT = (amount: number) => {
    return amount.toLocaleString("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    });
  };

  // Truncate ID
  const shortId = (id: string) => id.substring(0, 8).toUpperCase();

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Capitalize plan
  const formatPlan = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  // Handlers
  const handleVerify = (orderId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await onVerify(orderId);
      if (result.error) {
        setActionError(result.error);
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const result = await onReject(rejectModal.orderId, rejectionReason);
      if (result.error) {
        setActionError(result.error);
      } else {
        setRejectModal({ open: false, orderId: "" });
        setRejectionReason("");
      }
    });
  };

  const handleRefund = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await onRefund(refundModal.orderId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setRefundModal({ open: false, orderId: "" });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-44">
          <Select
            options={statusFilterOptions}
            placeholder="All Statuses"
            onChange={setStatusFilter}
            defaultValue={statusFilter}
          />
        </div>
        <div className="w-44">
          <Select
            options={methodFilterOptions}
            placeholder="All Methods"
            onChange={setMethodFilter}
            defaultValue={methodFilter}
          />
        </div>
      </div>

      {/* Error display */}
      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Order ID
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Customer
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Plan
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Amount
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Method
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Date
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No orders match your filters. Try adjusting the status, payment method, or date range.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const badge = statusBadgeMap[order.status];
                return (
                  <TableRow
                    key={order.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {shortId(order.id)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div>{order.userName ?? "Unknown"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.userEmail ?? ""}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatPlan(order.plan)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatBDT(order.amount)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {order.paymentMethod
                        ? paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      <Badge variant="light" color={badge.color} size="sm">
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleVerify(order.id)}
                              disabled={isPending}
                            >
                              Verify &amp; Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
                              onClick={() =>
                                setRejectModal({ open: true, orderId: order.id })
                              }
                              disabled={isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
                            onClick={() =>
                              setRefundModal({ open: true, orderId: order.id })
                            }
                            disabled={isPending}
                          >
                            Refund
                          </Button>
                        )}
                        {(order.status === "failed" || order.status === "refunded") && (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">
                            No actions
                          </span>
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

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, orderId: "" });
          setRejectionReason("");
        }}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Reject this order?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Please provide a reason for rejecting this order. The customer will be notified.
        </p>
        <TextArea
          placeholder="Reason for rejection..."
          rows={3}
          value={rejectionReason}
          onChange={setRejectionReason}
        />
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRejectModal({ open: false, orderId: "" });
              setRejectionReason("");
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={handleReject}
            disabled={isPending || !rejectionReason.trim()}
          >
            Reject Order
          </Button>
        </div>
      </Modal>

      {/* Refund Confirmation Modal */}
      <Modal
        isOpen={refundModal.open}
        onClose={() => setRefundModal({ open: false, orderId: "" })}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Issue refund?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will mark the order as refunded. For SSL Commerce payments, process the refund
          through your merchant dashboard.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefundModal({ open: false, orderId: "" })}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="!bg-error-500 hover:!bg-error-600 text-white"
            onClick={handleRefund}
            disabled={isPending}
          >
            Confirm Refund
          </Button>
        </div>
      </Modal>
    </div>
  );
}
