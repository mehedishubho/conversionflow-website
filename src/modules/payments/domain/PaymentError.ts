/**
 * PaymentError - Typed error categories for payment operations (D-05)
 *
 * Provides structured error handling for payment gateway operations.
 * Each error includes a category code, human message, and the gateway that produced it.
 */

/**
 * Payment error category codes.
 * Used for routing errors to appropriate user-facing messages.
 */
export type PaymentErrorCode =
  | "NETWORK_ERROR"
  | "INVALID_CONFIG"
  | "PAYMENT_FAILED"
  | "WEBHOOK_INVALID"
  | "GATEWAY_DOWN"
  | "RATE_LIMITED";

/**
 * PaymentError - Structured error for payment operations.
 *
 * Wraps gateway-specific errors with a standard error code that the
 * application layer can use to show user-friendly messages and log
 * structured error data for debugging.
 */
export class PaymentError extends Error {
  constructor(
    public readonly code: PaymentErrorCode,
    message: string,
    public readonly gatewayId: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
