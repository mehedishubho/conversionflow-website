"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Copy, Check, ExternalLink, FileDown } from "lucide-react";
import { getOrderForSuccessPage } from "@/app/(portal)/actions/checkout";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";

type ReceiptInfo = {
  type: "paddle" | "download_invoice" | "pending_verification";
  url?: string;
  label: string;
};

type OrderDetails = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  gatewayId: string | null;
  gatewayTransactionId: string | null;
  status: string;
  discountAmount: number | null;
  taxAmount: number | null;
  createdAt: Date;
  licenseKey: string | null;
  receiptInfo: ReceiptInfo;
  gatewayDisplayName: string;
};

function formatAmount(amount: number, currency: string): string {
  if (currency === "BDT") {
    return amount.toLocaleString("en-BD") + " BDT";
  }
  return "$" + amount.toLocaleString("en-US");
}

const statusBadgeVariant: Record<string, "success" | "warning" | "error" | "light"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "light",
};

const statusLabelMap: Record<string, string> = {
  completed: "Completed",
  pending: "Pending Verification",
  failed: "Failed",
  refunded: "Refunded",
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={label}
    >
      {copied ? (
        <span className="flex items-center gap-1 text-green-600 text-xs">
          <Check className="h-4 w-4" />
          Copied!
        </span>
      ) : (
        <Copy className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "";
  const statusParam = searchParams.get("status") || "";

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    getOrderForSuccessPage(orderId)
      .then((result) => {
        if (!result) {
          setError("Order not found.");
        } else {
          setOrder(result as unknown as OrderDetails);
        }
      })
      .catch(() => {
        setError("Failed to load order details.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const effectiveStatus = order?.status || statusParam;
  const isCompleted = effectiveStatus === "completed";

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Success" basePath="/dashboard" />
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-16 text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-2 border-brand-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Success" basePath="/dashboard" />
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-sm text-error-500 mb-4">
            {error || "Order not found."}
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Success" basePath="/dashboard" />

      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-10 text-center">
          <CheckCircle2
            className="mx-auto h-16 w-16 text-success-500 mb-4"
            strokeWidth={1.5}
          />

          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            {isCompleted ? "Payment Successful" : "Payment Submitted"}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isCompleted
              ? "Your payment was successful! Your license is ready."
              : "Your payment is being verified. This page will update automatically."}
          </p>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-6 py-4 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Order ID
              </span>
              <span className="font-mono text-sm font-semibold text-gray-800 dark:text-white/90">
                {order.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Plan
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {order.plan}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Amount
              </span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {formatAmount(order.amount, order.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Payment Method
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {order.gatewayDisplayName}
              </span>
            </div>
            {order.gatewayTransactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                  {order.gatewayTransactionId}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Status
              </span>
              <Badge
                variant="light"
                color={statusBadgeVariant[effectiveStatus] || "light"}
              >
                {statusLabelMap[effectiveStatus] || effectiveStatus}
              </Badge>
            </div>
          </div>

          {isCompleted && order.licenseKey && (
            <div
              role="region"
              aria-label="License credentials"
              className="space-y-3 mb-6"
            >
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-left">
                Your Credentials
              </h3>
              {/* License Key */}
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  License Key
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-sm font-semibold text-gray-800 dark:text-white/90 break-all">
                    {order.licenseKey}
                  </code>
                  <CopyButton text={order.licenseKey} label="Copy license key to clipboard" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use this key to activate ConversionFlow on your WooCommerce store.
                </p>
              </div>
              {/* API Token notice */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 px-4 py-3 text-left">
                <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  API Token
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your API token has been sent to your email. Check your inbox for the token -- it will not be shown here for security.
                </p>
              </div>
            </div>
          )}

          {/* Gateway-specific receipt/invoice (D-33) */}
          {order.receiptInfo && (
            <div className="mb-6">
              {order.receiptInfo.type === "paddle" && (
                <Link
                  href={order.receiptInfo.url || "#"}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition"
                >
                  <ExternalLink className="h-4 w-4" />
                  {order.receiptInfo.label}
                </Link>
              )}
              {order.receiptInfo.type === "download_invoice" && (
                <Link
                  href={`/dashboard/billing/${order.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition"
                >
                  <FileDown className="h-4 w-4" />
                  {order.receiptInfo.label}
                </Link>
              )}
              {order.receiptInfo.type === "pending_verification" && !isCompleted && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Your payment is being verified. We will email your license key once confirmed.
                </p>
              )}
            </div>
          )}

          {/* Pending state notice */}
          {!isCompleted && effectiveStatus === "pending" && (
            <div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-left">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Your payment is being verified. This page will update automatically. Please reload to check the latest status.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-lg bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 transition"
            >
              Go to Billing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div>
          <PageBreadcrumb pageTitle="Success" basePath="/dashboard" />
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-16 text-center">
            <div className="animate-spin h-8 w-8 mx-auto mb-4 border-2 border-brand-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
