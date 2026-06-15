"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateCoupon, calculateVAT, createManualOrder, getPaymentAccounts, getActiveGateways, getPlanBySlugAction } from "@/app/(portal)/actions/checkout";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderSummary from "@/components/checkout/OrderSummary";
import GatewaySelector from "@/components/checkout/GatewaySelector";
import CurrencyToggle from "@/components/checkout/CurrencyToggle";
import CouponInput from "@/components/checkout/CouponInput";
import ManualPaymentForm from "@/components/checkout/ManualPaymentForm";
import PaymentInstructions from "@/components/checkout/PaymentInstructions";
import SSLCommerzForm from "@/components/checkout/SSLCommerzForm";
import BKashAPIForm from "@/components/checkout/BKashAPIForm";
import PaddleRedirectButton from "@/components/checkout/PaddleRedirectButton";

type PaymentAccount = {
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  branch: string | null;
  routingNumber: string | null;
  instructions: string | null;
};

// Resolved plan shape used by the checkout page. The full ResolvedPlan
// (from @/lib/plans via getPlanBySlugAction) includes more fields; we only
// keep what the UI needs to avoid carrying unused state.
type ResolvedPlan = {
  slug: string;
  name: string;
  description: string | null;
  priceBDT: number;
  priceUSD: number;
  maxActivations: number;
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan")?.toLowerCase() || "";

  // ── Plan resolution state (D-3: decoupled from gateway/VAT/payment loading) ──
  // The plan is resolved from the DB by slug, NOT from hardcoded pricingTiers.
  // planExists: null = still resolving, true = found, false = confirmed missing.
  const [plan, setPlan] = useState<ResolvedPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planExists, setPlanExists] = useState<boolean | null>(null);

  // ── Pricing / payment state ──
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
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
  const [gatewayTestModes, setGatewayTestModes] = useState<Record<string, boolean>>({});

  // Manual methods list
  const manualMethods = ["bkash", "nagad", "rocket", "bank_transfer"];
  const disabledMethods = manualMethods.filter(
    (m) => !paymentAccounts[m] || paymentAccounts[m].length === 0
  );

  // ── Effect 1: Resolve plan from DB by slug (runs once on mount) ──
  // Independent of gateway/VAT/payment loading so a DB error here cannot be
  // masked by an unrelated failure, and an unrelated failure cannot blank
  // the plan.
  useEffect(() => {
    let cancelled = false;
    async function resolvePlan() {
      if (!planParam) {
        if (!cancelled) {
          setPlanExists(false);
          setPlanLoading(false);
        }
        return;
      }
      try {
        const resolved = await getPlanBySlugAction(planParam);
        if (cancelled) return;
        if (!resolved) {
          setPlanExists(false);
          setPlanLoading(false);
          return;
        }
        setPlan({
          slug: resolved.slug,
          name: resolved.name,
          description: resolved.description,
          priceBDT: resolved.priceBDT,
          priceUSD: resolved.priceUSD,
          maxActivations: resolved.maxActivations,
        });
        setPlanExists(true);
        setPlanLoading(false);
      } catch {
        if (!cancelled) {
          setPlanExists(false);
          setPlanLoading(false);
        }
      }
    }
    resolvePlan();
    return () => {
      cancelled = true;
    };
  }, [planParam]);

  // ── Effect 2: Pricing + ancillary loading (VAT / payment accounts / gateways) ──
  // basePrice comes directly from the resolved plan (authoritative DB value),
  // NOT from a client-fetched price map. Each ancillary call gets its own
  // try/catch so a gateway/VAT/payment-account failure cannot cascade and
  // blank the price (the original "Invalid plan selected" root cause).
  useEffect(() => {
    if (!plan) return; // wait until the plan is resolved

    let cancelled = false;
    const initialPrice = currency === "BDT" ? plan.priceBDT : plan.priceUSD;
    setBasePrice(initialPrice);

    async function loadAncillary() {
      // VAT — independent try/catch
      try {
        const vat = await calculateVAT(initialPrice);
        if (!cancelled) setVatInfo(vat);
      } catch {
        /* VAT stays null → component falls back to no-VAT total */
      }

      // Payment accounts — independent try/catch
      try {
        const paymentData = await getPaymentAccounts();
        if (!cancelled) {
          setPaymentAccounts(
            (paymentData as Record<string, unknown>).accounts as Record<string, PaymentAccount[]>
          );
        }
      } catch {
        /* paymentAccounts stays {} → manual methods disabled */
      }

      // Gateways — independent try/catch
      try {
        const gateways = await getActiveGateways(currency);
        if (!cancelled) {
          const testModeMap: Record<string, boolean> = {};
          for (const g of gateways.automatic) {
            testModeMap[g.gatewayId] = g.testMode;
          }
          setGatewayTestModes(testModeMap);
        }
      } catch {
        /* gatewayTestModes stays {} */
      }
    }
    loadAncillary();
    return () => {
      cancelled = true;
    };
  }, [plan, currency]);

  // Clear gateway selection when currency changes (D-04)
  useEffect(() => {
    setSelectedGateway(null);
  }, [currency]);

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
      if (!plan) return;
      setCouponLoading(true);
      setCouponError(null);
      try {
        const result = await validateCoupon(code, basePrice, plan.name) as Record<string, unknown>;
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
    [basePrice, plan]
  );

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, []);

  // Manual order submit
  const handleManualSubmit = useCallback(
    async (transactionId: string) => {
      if (!plan) return;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const formData = new FormData();
        formData.append("plan", plan.name);
        formData.append("paymentMethod", selectedGateway!);
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
    [plan, selectedGateway, appliedCoupon, basePrice, vatAmount, discountAmount, router]
  );

  // Gateway order success handler
  const handleGatewaySuccess = useCallback(
    (orderId: string) => {
      router.push(
        `/dashboard/checkout/success?order=${orderId}`
      );
    },
    [router]
  );

  // While resolving the plan, show the loading spinner (NOT the invalid-plan block).
  // This prevents a false "Invalid plan selected" flash before the DB responds.
  if (planLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Checkout" basePath="/dashboard" />
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-16 text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-2 border-brand-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  // Only show invalid-plan when the DB confirmed the plan does not exist.
  // A gateway/VAT/payment-account failure can no longer trigger this block
  // (the original root cause of the false "Invalid plan selected" error).
  if (planExists === false || !plan) {
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

  // Get current payment account for selected manual method
  const currentAccount =
    selectedGateway && paymentAccounts[selectedGateway]
      ? paymentAccounts[selectedGateway][0]
      : null;

  const isManual =
    selectedGateway &&
    manualMethods.includes(selectedGateway) &&
    currentAccount;

  // Format currency display
  const currencySymbol = currency === "BDT" ? "৳" : "$";
  const currencyCode = currency;

  return (
    <div>
      <PageBreadcrumb pageTitle="Checkout" basePath="/dashboard" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Order Summary */}
        <div className="space-y-6">
          <OrderSummary
            planName={plan.name}
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
            currency={currencyCode}
          />
        </div>

        {/* Right Column: Payment */}
        <div className="space-y-6">
          {/* Currency Toggle (D-19) */}
          <CurrencyToggle
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          {/* Gateway Selector (D-04, D-20) */}
          <GatewaySelector
            currency={currency}
            selectedGateway={selectedGateway}
            onGatewaySelect={setSelectedGateway}
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

          {/* Gateway-specific content */}
          {selectedGateway === "ssl_commerz" && (
            <SSLCommerzForm
              plan={plan.name}
              currency={currency}
              couponCode={appliedCoupon?.code}
              discountAmount={discountAmount}
              taxAmount={vatAmount}
              totalAmount={total}
              onSuccess={handleGatewaySuccess}
            />
          )}

          {selectedGateway === "bkash_api" && (
            <BKashAPIForm
              plan={plan.name}
              currency={currency}
              couponCode={appliedCoupon?.code}
              discountAmount={discountAmount}
              taxAmount={vatAmount}
              totalAmount={total}
              testMode={gatewayTestModes["bkash_api"] ?? true}
              onSuccess={handleGatewaySuccess}
            />
          )}

          {selectedGateway === "paddle" && (
            <PaddleRedirectButton
              plan={plan.name}
              currency={currency}
              couponCode={appliedCoupon?.code}
              discountAmount={discountAmount}
              taxAmount={vatAmount}
              totalAmount={total}
              onSuccess={handleGatewaySuccess}
            />
          )}

          {/* Manual payment methods */}
          {isManual && currentAccount && (
            <>
              <PaymentInstructions
                method={selectedGateway}
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
