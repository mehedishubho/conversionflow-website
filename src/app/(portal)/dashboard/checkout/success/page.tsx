"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { getOrderDetails } from "@/app/(portal)/actions/checkout";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";

type OrderDetails = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  status: string;
  discountAmount: number | null;
  taxAmount: number | null;
  createdAt: Date;
};

function formatBDT(amount: number): string {
  return amount.toLocaleString("en-BD") + " BDT";
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

    getOrderDetails(orderId)
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
              ? "Your payment was successful! Your license key has been generated."
              : "Your payment is being verified. We will email your license key within 24 hours once confirmed."}
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
                {formatBDT(order.amount)}
              </span>
            </div>
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
