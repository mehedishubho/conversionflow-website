import React from "react";
import { format } from "date-fns";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";

export type OrderWithUser = {
  id: string;
  userId: string;
  centralOrderId: string | null;
  productId: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: "bkash" | "nagad" | "rocket" | "bank_transfer" | "ssl_commerz" | null;
  paymentRef: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  couponCode: string | null;
  discountAmount: number | null;
  taxAmount: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  userName: string;
  userEmail: string;
  userPhone: string;
};

const statusBadgeMap: Record<
  OrderWithUser["status"],
  "success" | "warning" | "error" | "light"
> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "light",
};

const paymentMethodMap: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank Transfer",
  ssl_commerz: "SSL Commerce",
};

function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface InvoiceHTMLProps {
  order: OrderWithUser;
  vatRate?: number;
}

export function InvoiceHTML({ order, vatRate = 15 }: InvoiceHTMLProps) {
  const invoiceNumber = `CF-${order.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = format(new Date(order.createdAt), "MMMM d, yyyy");

  const baseAmount = order.amount;
  const taxAmount = order.taxAmount ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const total = baseAmount + taxAmount - discountAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            INVOICE
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ConversionFlow by Devsroom
          </p>
        </div>
        <a
          href={`/api/invoices/${order.id}/pdf`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#465fff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3b50e6] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </a>
      </div>

      {/* Invoice metadata */}
      <div className="flex flex-col sm:flex-row gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Invoice #:
          </span>{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {invoiceNumber}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Date:</span>{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {invoiceDate}
          </span>
        </div>
      </div>

      {/* Two-column info: Bill To + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Bill To
          </h4>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {order.userName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {order.userEmail}
          </p>
          {order.userPhone && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {order.userPhone}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Company
          </h4>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            Devsroom
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dhaka, Bangladesh
          </p>
        </div>
      </div>

      {/* Line items table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            <tr>
              <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                {order.plan} Plan
              </td>
              <td className="px-4 py-3 text-right text-gray-800 dark:text-white/90">
                {formatBDT(baseAmount)}
              </td>
            </tr>
            {taxAmount > 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                  VAT ({vatRate}%)
                </td>
                <td className="px-4 py-3 text-right text-gray-800 dark:text-white/90">
                  {formatBDT(taxAmount)}
                </td>
              </tr>
            )}
            {discountAmount > 0 && order.couponCode && (
              <tr>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">
                  Discount ({order.couponCode})
                </td>
                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                  -{formatBDT(discountAmount)}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
              <td className="px-4 py-4 text-base font-bold text-gray-800 dark:text-white/90">
                Total
              </td>
              <td className="px-4 py-4 text-right text-base font-bold text-gray-800 dark:text-white/90">
                {formatBDT(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Payment Details
        </h4>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Method:</span>{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {paymentMethodMap[order.paymentMethod ?? ""] ??
                order.paymentMethod ??
                "N/A"}
            </span>
          </div>
          {order.paymentRef && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Transaction ID:
              </span>{" "}
              <span className="font-mono font-medium text-gray-800 dark:text-white/90">
                {order.paymentRef}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>{" "}
            <Badge
              variant="light"
              color={statusBadgeMap[order.status]}
            >
              {order.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
