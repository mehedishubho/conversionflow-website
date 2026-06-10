/**
 * IPaymentGateway - Payment Gateway Abstraction Interface
 *
 * Full lifecycle interface for payment gateway adapters (D-01).
 * Every gateway adapter (SSL Commerz, Paddle, bKash) must implement all 7 methods.
 * Gateway adapters are registered in GatewayRegistry and called by PaymentService.
 */

/**
 * Configuration field definition for admin UI rendering.
 * Each gateway declares what config fields it needs.
 */
export interface ConfigFieldDefinition {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "boolean";
  required: boolean;
  placeholder?: string;
  description?: string;
}

/**
 * Parameters for creating a payment session.
 * Passed from PaymentService to the gateway adapter.
 */
export interface CreateSessionParams {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  productId: string;
  plan: string;
  couponCode?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

/**
 * Result of creating a payment session.
 * Contains redirect URL or inline session data.
 */
export interface CreateSessionResult {
  redirectUrl?: string;
  sessionData?: Record<string, unknown>;
  transactionId?: string;
}

/**
 * Result of verifying a payment with the gateway.
 */
export interface VerifyPaymentResult {
  success: boolean;
  orderId: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  rawResponse?: Record<string, unknown>;
}

/**
 * Result of processing a webhook from the gateway.
 */
export interface WebhookResult {
  success: boolean;
  eventType: string;
  orderId?: string;
  gatewayTransactionId?: string;
  status: "completed" | "failed" | "refunded";
  rawPayload: Record<string, unknown>;
}

/**
 * Parameters for processing a refund.
 */
export interface RefundParams {
  orderId: string;
  gatewayTransactionId: string;
  amount: number;
  reason?: string;
}

/**
 * Result of processing a refund.
 */
export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
}

/**
 * Result of querying payment status.
 */
export interface PaymentStatusResult {
  status: "pending" | "completed" | "failed" | "refunded";
  gatewayTransactionId: string;
  amount?: number;
  currency?: string;
}

/**
 * IPaymentGateway - Strategy pattern interface for payment gateways.
 *
 * All gateway adapters implement this interface. The PaymentService
 * calls these methods without knowing which specific gateway it is.
 *
 * Lifecycle: createSession -> [user pays] -> verifyPayment/handleWebhook -> completeOrder
 */
export interface IPaymentGateway {
  /** Unique identifier for this gateway (e.g., 'ssl_commerz', 'paddle', 'bkash_api') */
  readonly gatewayId: string;

  /** Human-readable name for admin UI */
  readonly name: string;

  /** Currencies this gateway supports (e.g., ['BDT'], ['USD']) */
  readonly supportedCurrencies: string[];

  /**
   * Create a payment session with the gateway.
   * Returns redirect URL or session data for inline payment.
   */
  createSession(params: CreateSessionParams): Promise<CreateSessionResult>;

  /**
   * Verify a payment by querying the gateway server-to-server.
   * Called after redirect or as part of webhook processing.
   */
  verifyPayment(transactionId: string): Promise<VerifyPaymentResult>;

  /**
   * Process an incoming webhook from the gateway.
   * Each adapter handles its own authentication (signature verification).
   */
  handleWebhook(request: Request): Promise<WebhookResult>;

  /**
   * Process a refund for a completed payment.
   * Admin-initiated only (D-31).
   */
  processRefund(params: RefundParams): Promise<RefundResult>;

  /**
   * Query the current status of a payment from the gateway.
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;

  /**
   * Validate the gateway's configuration.
   * Used by the "Test Connection" button in admin UI (D-30).
   */
  validateConfig(config: Record<string, unknown>): Promise<boolean>;

  /**
   * Get the configuration field definitions required by this gateway.
   * Used to render the admin settings form dynamically.
   */
  getRequiredConfigFields(): ConfigFieldDefinition[];
}
