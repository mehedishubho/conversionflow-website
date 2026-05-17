"use client";

interface PaymentMethodGridProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  disabledMethods: string[];
}

const paymentMethods = [
  { key: "bkash", label: "bKash", color: "#E2136E" },
  { key: "nagad", label: "Nagad", color: "#F6921E" },
  { key: "rocket", label: "Rocket", color: "#8C3494" },
  { key: "ssl_commerz", label: "SSL Commerce", color: "#1A5F9E" },
  { key: "bank_transfer", label: "Bank Transfer", color: "#667085" },
] as const;

export default function PaymentMethodGrid({
  selectedMethod,
  onMethodSelect,
  disabledMethods,
}: PaymentMethodGridProps) {
  return (
    <div>
      <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
        Select Payment Method
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.key;
          const isDisabled = disabledMethods.includes(method.key);

          return (
            <button
              key={method.key}
              type="button"
              disabled={isDisabled}
              onClick={() => onMethodSelect(method.key)}
              className={`
                relative rounded-xl p-4 text-left transition-all duration-150
                ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    : isSelected
                      ? "border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10 cursor-pointer"
                      : "border border-gray-300 bg-white hover:border-gray-400 hover:shadow-theme-xs cursor-pointer dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                }
              `}
              style={
                isSelected && !isDisabled
                  ? { borderLeftWidth: "3px", borderLeftColor: method.color }
                  : undefined
              }
            >
              {/* Method icon (colored circle with first letter) */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: method.color }}
                >
                  {method.label.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {method.label}
                  </span>
                  {isDisabled && (
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      Not Available
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
