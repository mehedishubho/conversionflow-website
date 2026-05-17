"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pricingTiers } from "@/data/pricing";
import { validateCoupon, calculateVAT, createManualOrder, getPaymentAccounts } from "@/app/(portal)/actions/checkout";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethodGrid from "@/components/checkout/PaymentMethodGrid";
import CouponInput from "@/components/checkout/CouponInput";
import ManualPaymentForm from "@/components/checkout/ManualPaymentForm";
import PaymentInstructions from "@/components/checkout/PaymentInstructions";

// Authoritative price map (matches server-side PLAN_PRICES in checkout.ts)
const planPrices: Record<string, number> = {
  starter: 2150,
  professional: 3000,
  agency: 8000,
};

type PaymentAccount = {
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  branch: string | null;
  routingNumber: string | null;
  instructions: string | null;
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan")?.toLowerCase() || "";

  // Find matching pricing tier
  const tier = pricingTiers.find(
    (t) => t.plan.toLowerCase() === planParam
  );
  const basePrice = planPrices[planParam] ?? 0;

  // State
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [vatInfo, setVatInfo] = useState<{
    taxAmount: number;
    total: number;
    rate: number;
    mode: string;
  } | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<
    Record<string, PaymentAccount[]>
  >({});
  const [sslLoading, setSslLoading] = useState(false);
  const [sslError, setSslError] = useState<string | null>(null);

  // Disabled methods = those without active payment accounts (for manual methods)
  const manualMethods = ["bkash", "nagad", "rocket", "bank_transfer"];
  const disabledMethods = manualMethods.filter(
    (m) => !paymentAccounts[m] || paymentAccounts[m].length === 0
  );

  // Load VAT and payment accounts on mount
  useEffect(() => {
    if (!tier || !basePrice) return;

    async function load() {
      try {
        const [vat, accounts] = await Promise.all([
          calculateVAT(basePrice),
          getPaymentAccounts(),
        ]);
        setVatInfo(vat);
        setPaymentAccounts(accounts as Record<string, PaymentAccount[]>);
      } catch {
        // Silently handle -- components will show fallback
      }
    }
    load();
  }, [tier, basePrice]);

  // Computed values
  const discountAmount = appliedCoupon?.discount ?? 0;
  const vatAmount = vatInfo?.taxAmount ?? 0;
  const vatRate = vatInfo?.rate ?? 15;
  const vatMode = vatInfo?.mode ?? "exclusive";
  const total = vatInfo
    ? vatMode === "inclusive"
      ? basePrice - discountAmount
      : basePrice - discountAmount + vatAmount
    : basePrice - discountAmount;

  // Coupon handlers
  const handleApplyCoupon = useCallback(
    async (code: string) => {
      setCouponLoading(true);
      setCouponError(null);
      try {
        const result = await validateCoupon(code, basePrice) as Record<string, unknown>;
        if ("error" in result && typeof result.error === "string") {
          setCouponError(result.error);
        } else if ("success" in result && result.success) {
          setAppliedCoupon({ code: code.toUpperCase(), discount: result.discount as number });
          setCouponError(null);
        }
      } catch {
        setCouponError("Failed to validate coupon. Please try again.");
      } finally {
        setCouponLoading(false);
      }
    },
    [basePrice]
  );

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, []);

  // Manual order submit
  const handleManualSubmit = useCallback(
    async (transactionId: string) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const formData = new FormData();
        formData.append("plan", tier!.plan);
        formData.append("paymentMethod", selectedMethod!);
        formData.append("paymentRef", transactionId);
        if (appliedCoupon) {
          formData.append("couponCode", appliedCoupon.code);
        }
        formData.append("amount", basePrice.toString());
        formData.append("taxAmount", vatAmount.toString());
        formData.append("discountAmount", discountAmount.toString());

        const result = await createManualOrder(formData) as Record<string, unknown>;
        if ("error" in result && typeof result.error === "string") {
          setSubmitError(result.error);
        } else if ("success" in result && result.success && result.orderId) {
          router.push(
            `/dashboard/checkout/success?order=${String(result.orderId)}&status=pending`
          );
        }
      } catch {
        setSubmitError("Failed to create order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [tier, selectedMethod, appliedCoupon, basePrice, vatAmount, discountAmount, router]
  );

  // SSL Commerce handler
  const handleSSLPayment = useCallback(async () => {
    if (!tier) return;
    setSslLoading(true);
    setSslError(null);
    try {
      const response = await fetch("/api/ssl-commerz/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: tier.plan,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount,
          taxAmount: vatAmount,
          totalAmount: total,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSslError(
          data.error ||
            "Unable to connect to payment gateway. Please try again or use a different payment method."
        );
      }
    } catch {
      setSslError(
        "Unable to connect to payment gateway. Please try again or use a different payment method."
      );
    } finally {
      setSslLoading(false);
    }
  }, [tier, appliedCoupon, discountAmount, vatAmount, total]);

  // Invalid plan state
  if (!tier || !basePrice) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Checkout" basePath="/dashboard" />
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-12 text-center">
          <p className="text-sm text-error-500 mb-4">
            Invalid plan selected. Please go back to pricing and select a plan.
          </p>
          <Link
            href="/pricing"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  // Get current payment account for selected method
  const currentAccount =
    selectedMethod && paymentAccounts[selectedMethod]
      ? paymentAccounts[selectedMethod][0]
      : null;

  const isManual =
    selectedMethod &&
    manualMethods.includes(selectedMethod) &&
    currentAccount;

  return (
    <div>
      <PageBreadcrumb pageTitle="Checkout" basePath="/dashboard" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Order Summary */}
        <div className="space-y-6">
          <OrderSummary
            planName={tier.plan}
            basePrice={basePrice}
            vatAmount={vatAmount}
            vatRate={vatRate}
            vatMode={vatMode}
            discountAmount={discountAmount}
            discountLabel={
              appliedCoupon
                ? `Discount (${appliedCoupon.code})`
                : "Discount"
            }
            total={total}
            currency="BDT"
          />
        </div>

        {/* Right Column: Payment */}
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <PaymentMethodGrid
            selectedMethod={selectedMethod}
            onMethodSelect={setSelectedMethod}
            disabledMethods={disabledMethods}
          />

          {/* Coupon Input */}
          <CouponInput
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
            appliedCode={appliedCoupon?.code ?? null}
            appliedDiscount={discountAmount}
            error={couponError}
            isLoading={couponLoading}
          />

          {/* Method-specific content */}
          {isManual && currentAccount && (
            <>
              <PaymentInstructions
                method={selectedMethod}
                accountName={currentAccount.accountName}
                accountNumber={currentAccount.accountNumber}
                instructions={currentAccount.instructions || ""}
                bankName={currentAccount.bankName || undefined}
                branch={currentAccount.branch || undefined}
                routingNumber={currentAccount.routingNumber || undefined}
                amountToSend={total}
              />
              <ManualPaymentForm
                onSubmit={handleManualSubmit}
                isLoading={isSubmitting}
                error={submitError}
              />
            </>
          )}

          {/* SSL Commerce */}
          {selectedMethod === "ssl_commerz" && (
            <div className="space-y-4">
              {sslError && (
                <p className="text-sm text-error-500">{sslError}</p>
              )}
              <button
                type="button"
                onClick={handleSSLPayment}
                disabled={sslLoading}
                className="inline-flex items-center justify-center w-full px-5 py-3.5 text-sm font-medium rounded-lg bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sslLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  "Pay with SSL Commerce"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div>
          <PageBreadcrumb pageTitle="Checkout" basePath="/dashboard" />
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-16 text-center">
            <div className="animate-spin h-8 w-8 mx-auto mb-4 border-2 border-brand-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading checkout...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
