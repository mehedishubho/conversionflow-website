/**
 * BKashAdapter - bKash Tokenized Checkout API v1.2.0-beta adapter
 *
 * Implements IPaymentGateway for bKash automatic payments (D-17, D-20, D-21).
 * bKash provides the best UX for BD customers with inline OTP via their JS SDK.
 *
 * Key design decisions:
 * - gatewayId "bkash_api" is distinct from manual "bkash" payment method (D-20)
 * - OAuth2 tokens cached in Redis with 3500s TTL (80% of 3600s token lifetime, D-21)
 * - createSession returns bkashURL for inline JS SDK payment (D-23)
 * - Sandbox/production URL switching based on testMode (D-07)
 *
 * Security (T-34-15): Server-side executePayment verification never trusts callback data alone.
 * Token security (T-34-16): OAuth2 token in Redis (not client-accessible), short TTL.
 * Credential security (T-34-17): AES-256-GCM encrypted in payment_gateways.config.
 */

import type {
  IPaymentGateway,
  CreateSessionParams,
  CreateSessionResult,
  VerifyPaymentResult,
  WebhookResult,
  RefundParams,
  RefundResult,
  PaymentStatusResult,
  ConfigFieldDefinition,
} from "../../domain/IPaymentGateway";
import { PaymentError } from "../../domain/PaymentError";
import { GatewayConfigRepository } from "../repositories/GatewayConfigRepository";
import { kvGet, kvSet } from "@/lib/redis";

/** Redis key prefix for caching bKash OAuth2 token (suffix includes environment) */
const BKASH_TOKEN_KEY_PREFIX = "bkash:api_token";

/** Token TTL in seconds: 3500s (cached at ~80% of 3600s token expiry, D-21) */
const BKASH_TOKEN_TTL = 3500;

/** Request timeout in milliseconds (D-39) */
const REQUEST_TIMEOUT_MS = 20_000;

/** bKash API response for token grant */
interface BKashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  status: string;
  [key: string]: unknown;
}

/** bKash API response for create payment */
interface BKashCreateResponse {
  paymentID: string;
  bkashURL: string;
  createTime: string;
  orgLogo: string;
  orgName: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  [key: string]: unknown;
}

/** bKash API response for execute payment / query */
interface BKashExecuteResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  phoneNo: string;
  payerReference?: string;
  errorCode?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

/** bKash API response for refund */
interface BKashRefundResponse {
  paymentID: string;
  trxID: string;
  refundTrxID: string;
  amount: string;
  currency: string;
  status: string;
  completedTime: string;
  [key: string]: unknown;
}

export class BKashAdapter implements IPaymentGateway {
  readonly gatewayId = "bkash_api"; // D-20: distinct from manual "bkash"
  readonly name = "bKash (Auto)";
  readonly supportedCurrencies = ["BDT"];

  private configRepo = new GatewayConfigRepository();

  /**
   * Get decrypted gateway config from payment_gateways table.
   * Returns appKey, appSecret, username, password, and testMode flag.
   */
  private async getDecryptedConfig(): Promise<{
    appKey: string;
    appSecret: string;
    username: string;
    password: string;
    testMode: boolean;
  }> {
    const row = await this.configRepo.getByGatewayId(this.gatewayId);
    if (!row) {
      throw new PaymentError(
        "INVALID_CONFIG",
        "bKash API gateway is not configured",
        this.gatewayId
      );
    }
    const config = row.config as Record<string, unknown>;
    return {
      appKey: config.appKey as string,
      appSecret: config.appSecret as string,
      username: config.username as string,
      password: config.password as string,
      testMode: row.testMode,
    };
  }

  /**
   * Get bKash API base URL based on test mode.
   * Sandbox: tokenized.sandbox.bka.sh
   * Production: tokenized.pay.bka.sh
   */
  private getBaseUrl(testMode: boolean): string {
    return testMode
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";
  }

  /**
   * Get OAuth2 token from bKash API with Redis caching (D-21).
   *
   * Flow:
   * 1. Check Redis cache for existing token
   * 2. If cached, return immediately
   * 3. Otherwise, grant new token from bKash API
   * 4. Cache in Redis with 3500s TTL (80% of 3600s token lifetime)
   */
  private async getToken(testMode: boolean): Promise<string> {
    // Environment-isolated cache key prevents sandbox/production token cross-use
    const cacheKey = `${BKASH_TOKEN_KEY_PREFIX}:${testMode ? "sandbox" : "production"}`;

    // Check Redis cache first
    const cached = await kvGet(cacheKey);
    if (cached) return cached;

    // Grant new token from bKash API
    const config = await this.getDecryptedConfig();
    const baseUrl = this.getBaseUrl(testMode);

    try {
      const response = await fetch(
        `${baseUrl}/tokenized/checkout/token/grant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.username,
            password: config.password,
          },
          body: JSON.stringify({
            app_key: config.appKey,
            app_secret: config.appSecret,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        throw new PaymentError(
          "NETWORK_ERROR",
          `bKash token grant failed: ${response.status} ${response.statusText}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as BKashTokenResponse;

      if (!data.id_token) {
        throw new PaymentError(
          "PAYMENT_FAILED",
          `bKash token grant returned no token: ${data.status || "unknown error"}`,
          this.gatewayId
        );
      }

      // Cache in Redis with TTL (D-21: 3500s = ~80% of 3600s)
      await kvSet(cacheKey, data.id_token, BKASH_TOKEN_TTL);
      return data.id_token;
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `bKash token grant failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Create a payment session with bKash Tokenized Checkout API (D-17).
   *
   * Returns bkashURL which the bKash JS SDK uses to open inline payment.
   * The customer sees an inline OTP dialog without leaving the page (D-23).
   *
   * After payment, bKash redirects to callbackURL with paymentID and status.
   * Timeout: 20s (D-39).
   */
  async createSession(params: CreateSessionParams): Promise<CreateSessionResult> {
    const config = await this.getDecryptedConfig();
    const token = await this.getToken(config.testMode);
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(
        `${baseUrl}/tokenized/checkout/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token,
            "X-App-Key": config.appKey,
          },
          body: JSON.stringify({
            mode: "0001",
            payerReference: params.customerPhone || params.userId,
            callbackURL: params.webhookUrl,
            amount: params.amount.toString(),
            currency: "BDT",
            intent: "sale",
            merchantInvoiceNumber: params.orderId,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        throw new PaymentError(
          "GATEWAY_DOWN",
          `bKash payment creation failed: ${response.status} ${response.statusText}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as BKashCreateResponse;

      if (!data.bkashURL || !data.paymentID) {
        throw new PaymentError(
          "PAYMENT_FAILED",
          `bKash payment creation returned no payment URL: ${data.transactionStatus || "unknown error"}`,
          this.gatewayId
        );
      }

      return {
        redirectUrl: data.bkashURL,
        transactionId: data.paymentID,
        sessionData: {
          paymentID: data.paymentID,
          bkashURL: data.bkashURL,
        },
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new PaymentError(
          "NETWORK_ERROR",
          "bKash payment creation timed out after 20s",
          this.gatewayId,
          error
        );
      }
      throw new PaymentError(
        "NETWORK_ERROR",
        `bKash payment creation failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Verify a payment by calling bKash executePayment API server-side.
   *
   * This is the server-side confirmation step. Called after the customer
   * completes payment on the bKash side. The executePayment API finalizes
   * the transaction and returns the final status (T-34-15).
   *
   * The transactionId parameter is actually the bKash paymentID.
   */
  async verifyPayment(transactionId: string): Promise<VerifyPaymentResult> {
    const config = await this.getDecryptedConfig();
    const token = await this.getToken(config.testMode);
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(
        `${baseUrl}/tokenized/checkout/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token,
            "X-App-Key": config.appKey,
          },
          body: JSON.stringify({
            paymentID: transactionId,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        throw new PaymentError(
          "NETWORK_ERROR",
          `bKash execute payment failed: ${response.status} ${response.statusText}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as BKashExecuteResponse;

      const isSuccess = data.transactionStatus === "Completed";

      return {
        success: isSuccess,
        orderId: data.merchantInvoiceNumber || "",
        gatewayTransactionId: data.trxID || "",
        amount: parseFloat(data.amount) || 0,
        currency: data.currency || "BDT",
        rawResponse: data as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `bKash payment verification failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Process an incoming webhook/callback from bKash (D-28).
   *
   * bKash sends a callback to the callbackURL after customer completes/cancels payment.
   * The callback arrives as a POST with JSON body containing paymentID and status.
   *
   * Security (T-34-15): We NEVER trust the callback data alone.
   * Instead, we call verifyPayment (executePayment API) to confirm server-side.
   */
  async handleWebhook(request: Request): Promise<WebhookResult> {
    try {
      // bKash callback arrives as JSON POST body with paymentID and status
      let paymentId: string | undefined;
      let callbackStatus: string | undefined;
      let rawPayload: Record<string, unknown>;

      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = (await request.json()) as Record<string, unknown>;
        rawPayload = body;
        paymentId = body.paymentID as string | undefined;
        callbackStatus = body.status as string | undefined;
      } else {
        // Fallback: try form data or query params
        const url = new URL(request.url);
        paymentId =
          (url.searchParams.get("paymentID") as string | undefined) ??
          undefined;
        callbackStatus =
          (url.searchParams.get("status") as string | undefined) ?? undefined;
        rawPayload = Object.fromEntries(url.searchParams.entries());
      }

      if (!paymentId) {
        return {
          success: false,
          eventType: "callback.missing_payment_id",
          status: "failed",
          rawPayload: rawPayload || {},
        };
      }

      // Server-side verification (T-34-15: never trust callback data alone)
      const verification = await this.verifyPayment(paymentId);

      if (!verification.success) {
        return {
          success: false,
          eventType: "callback.payment_failed",
          orderId: verification.orderId || undefined,
          gatewayTransactionId: verification.gatewayTransactionId || undefined,
          status: "failed",
          rawPayload: {
            ...rawPayload,
            verification: verification.rawResponse,
          },
        };
      }

      return {
        success: true,
        eventType: "callback.payment_completed",
        orderId: verification.orderId,
        gatewayTransactionId: verification.gatewayTransactionId,
        status: "completed",
        rawPayload: {
          ...rawPayload,
          verification: verification.rawResponse,
        },
      };
    } catch (error) {
      return {
        success: false,
        eventType: "callback.error",
        status: "failed",
        rawPayload: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Process a refund via bKash API (D-31).
   *
   * Calls the bKash refund API with the paymentID, amount, and trxID.
   */
  async processRefund(params: RefundParams): Promise<RefundResult> {
    const config = await this.getDecryptedConfig();
    const token = await this.getToken(config.testMode);
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(
        `${baseUrl}/tokenized/checkout/payment/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token,
            "X-App-Key": config.appKey,
          },
          body: JSON.stringify({
            paymentID: params.gatewayTransactionId,
            amount: params.amount.toString(),
            trxID: params.gatewayTransactionId,
            skus: "1",
            reason: params.reason || "Admin initiated refund",
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `bKash refund request failed: ${response.status} ${response.statusText}`,
        };
      }

      const data = (await response.json()) as BKashRefundResponse;

      const isSuccess =
        data.status === "completed" || data.status === "Completed";

      return {
        success: isSuccess,
        refundId: data.refundTrxID || undefined,
        message: isSuccess
          ? "Refund processed successfully"
          : `Refund status: ${data.status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `bKash refund failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Query the current status of a payment from bKash.
   *
   * POST to the payment status endpoint with the paymentID.
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    const config = await this.getDecryptedConfig();
    const token = await this.getToken(config.testMode);
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(
        `${baseUrl}/tokenized/checkout/payment/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token,
            "X-App-Key": config.appKey,
          },
          body: JSON.stringify({
            paymentID: transactionId,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        throw new PaymentError(
          "NETWORK_ERROR",
          `bKash payment status query failed: ${response.status}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as BKashExecuteResponse;

      // Map bKash transactionStatus to our status enum
      let status: PaymentStatusResult["status"];
      switch (data.transactionStatus) {
        case "Completed":
          status = "completed";
          break;
        case "Pending":
          status = "pending";
          break;
        case "Failed":
        case "Expired":
          status = "failed";
          break;
        default:
          status = "failed";
      }

      return {
        status,
        gatewayTransactionId: data.trxID || "",
        amount: parseFloat(data.amount) || undefined,
        currency: data.currency || undefined,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `bKash payment status query failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Validate the gateway's configuration (D-30 Test Connection).
   *
   * Attempts to grant an OAuth2 token with the stored credentials.
   * If the token grant returns 200 with id_token, the config is valid.
   */
  async validateConfig(config: Record<string, unknown>): Promise<boolean> {
    try {
      const appKey = config.appKey as string;
      const appSecret = config.appSecret as string;
      const username = config.username as string;
      const password = config.password as string;

      if (!appKey || !appSecret || !username || !password) {
        return false;
      }

      const testMode = config.testMode !== false;
      const baseUrl = this.getBaseUrl(testMode);

      // Attempt to grant a token with the provided credentials
      const response = await fetch(
        `${baseUrl}/tokenized/checkout/token/grant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username,
            password,
          },
          body: JSON.stringify({
            app_key: appKey,
            app_secret: appSecret,
          }),
          signal: AbortSignal.timeout(15_000),
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as BKashTokenResponse;
      return !!data.id_token;
    } catch {
      return false;
    }
  }

  /**
   * Get the configuration field definitions required by bKash.
   * Used to render the admin settings form dynamically.
   */
  getRequiredConfigFields(): ConfigFieldDefinition[] {
    return [
      {
        key: "appKey",
        label: "App Key",
        type: "text",
        required: true,
        description: "bKash merchant app key from the developer portal",
      },
      {
        key: "appSecret",
        label: "App Secret",
        type: "password",
        required: true,
        description: "bKash merchant app secret from the developer portal",
      },
      {
        key: "username",
        label: "Username",
        type: "text",
        required: true,
        description: "bKash merchant username used for API authentication",
      },
      {
        key: "password",
        label: "Password",
        type: "password",
        required: true,
        description: "bKash merchant password used for API authentication",
      },
    ];
  }
}
