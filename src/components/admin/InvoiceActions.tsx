"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { verifyOrder } from "@/app/(admin)/actions/admin-orders";
import { sendPaymentReminder } from "@/app/(admin)/actions/admin-invoices";

type OrderStatus = "pending" | "completed" | "failed" | "refunded";

interface InvoiceOrder {
  id: string;
  userName: string | null;
  userEmail: string | null;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  taxAmount: number | null;
  status: OrderStatus;
  createdAt: Date;
}

interface InvoiceActionsProps {
  orders: InvoiceOrder[];
}

const statusBadgeMap: Record<string, { color: "warning" | "success" | "error" | "light"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  completed: { color: "success", label: "Paid" },
  failed: { color: "error", label: "Failed" },
  refunded: { color: "light", label: "Refunded" },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "completed", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
] as const;

type TabKey = typeof tabs[number]["key"];

export default function InvoiceActions({ orders }: InvoiceActionsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "markPaid" | "sendReminder";
    orderId: string;
    email: string;
  } | null>(null);

  const counts = useMemo(() => ({
    all: orders.length,
    completed: orders.filter((o) => o.status === "completed").length,
    pending: orders.filter((o) => o.status === "pending").length,
    failed: orders.filter((o) => o.status === "failed").length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const formatBDT = (amount: number) =>
    amount.toLocaleString("en-BD") + " BDT";

  const handleMarkPaid = () => {
    if (!confirmModal) return;
    setActionError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await verifyOrder(confirmModal.orderId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setConfirmModal(null);
        setSuccessMsg("Order marked as paid. License created and confirmation email sent.");
        router.refresh();
      }
    });
  };

  const handleSendReminder = () => {
    if (!confirmModal) return;
    setActionError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await sendPaymentReminder(confirmModal.orderId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setConfirmModal(null);
        setSuccessMsg(`Payment reminder sent to ${confirmModal.email}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              activeTab === tab.key
                ? "bg-brand-50 text-brand-500 border-brand-500 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label} ({counts[tab.key as keyof typeof counts]})
          </button>
        ))}
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-success-50 text-success-600 text-sm dark:bg-success-500/10 dark:text-success-400">
          {successMsg}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Invoice #</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Plan</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Discount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">VAT</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Method</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400 dark:text-gray-500">
                  No orders found for this filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((inv) => {
                const badge = statusBadgeMap[inv.status] ?? { color: "light" as const, label: inv.status };
                return (
                  <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="py-3 px-4 font-mono text-xs text-gray-800 dark:text-white/90">
                      {inv.id.toString().slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90">{inv.userName || "—"}</p>
                        <p className="text-xs text-gray-400">{inv.userEmail || ""}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">{inv.plan}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white/90">{formatBDT(inv.amount)}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{inv.discountAmount ? formatBDT(inv.discountAmount) : "—"}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{inv.taxAmount ? formatBDT(inv.taxAmount) : "—"}</td>
                    <td className="py-3 px-4 capitalize text-gray-700 dark:text-gray-300">{inv.paymentMethod?.replace(/_/g, " ") || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant="light" color={badge.color} size="sm">
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              setConfirmModal({
                                type: "markPaid",
                                orderId: inv.id,
                                email: inv.userEmail ?? "",
                              })
                            }
                            disabled={isPending}
                          >
                            Mark as Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setConfirmModal({
                                type: "sendReminder",
                                orderId: inv.id,
                                email: inv.userEmail ?? "",
                              })
                            }
                            disabled={isPending}
                          >
                            Send Reminder
                          </Button>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/billing/${inv.id}`}
                          className="text-sm font-medium text-brand-500 hover:text-brand-600"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        className="max-w-md p-6"
      >
        {confirmModal?.type === "markPaid" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Mark this order as paid?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This will trigger license creation and send a confirmation email to the customer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmModal(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleMarkPaid} disabled={isPending}>
                Confirm
              </Button>
            </div>
          </>
        )}
        {confirmModal?.type === "sendReminder" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Send payment reminder?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              A payment reminder will be sent to <strong>{confirmModal.email}</strong>.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmModal(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSendReminder} disabled={isPending}>
                Send Reminder
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
