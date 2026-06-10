/**
 * PaymentSession - Value object for payment session results
 *
 * Wraps CreateSessionResult with additional metadata for tracking
 * the payment session across the system.
 */

import type { CreateSessionResult } from "../IPaymentGateway";

/**
 * Payment session with metadata.
 * Created by PaymentService.initiatePayment() for tracking.
 */
export interface PaymentSession extends CreateSessionResult {
  /** The gateway that created this session */
  gatewayId: string;
  /** The order this session is for */
  orderId: string;
  /** When this session was created */
  createdAt: Date;
}
