interface OrderSummaryProps {
  planName: string;
  basePrice: number;
  vatAmount: number;
  vatRate: number;
  vatMode: string;
  discountAmount: number;
  discountLabel: string;
  total: number;
  currency: string;
}

function formatBDT(amount: number): string {
  return amount.toLocaleString("en-BD") + " BDT";
}

export default function OrderSummary({
  planName,
  basePrice,
  vatAmount,
  vatRate,
  vatMode,
  discountAmount,
  discountLabel,
  total,
  currency,
}: OrderSummaryProps) {
  const vatLabel =
    vatMode === "inclusive"
      ? `Includes VAT (${vatRate}%)`
      : `VAT (${vatRate}%)`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Order Summary
        </h3>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 space-y-4">
        {/* Plan name + base price */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {planName} Plan
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {formatBDT(basePrice)}
          </span>
        </div>

        {/* VAT line (only when VAT is active) */}
        {vatRate > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {vatLabel}
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {vatMode === "inclusive" ? "Included" : formatBDT(vatAmount)}
            </span>
          </div>
        )}

        {/* Discount line (only when present) */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-success-500">
              {discountLabel}
            </span>
            <span className="text-sm font-semibold text-success-500">
              -{formatBDT(discountAmount)}
            </span>
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Total
          </span>
          <span className="text-lg font-bold text-gray-800 dark:text-white/90">
            {formatBDT(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
