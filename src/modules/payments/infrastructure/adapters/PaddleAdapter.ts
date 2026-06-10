/**
 * PaddleAdapter - Paddle Billing (new API) gateway adapter implementing IPaymentGateway
 *
 * Implements hosted checkout (redirect pattern matching SSL Commerz).
 * Paddle acts as Merchant of Record for international payments (D-14).
 * Handles automatic tax, 3DS/SCA compliance, and MoR invoicing.
 *
 * Uses Paddle Billing API (not Paddle Classic) per D-11.
 * Sandbox/production URL switching based on testMode (D-07).
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
import { createHmac } from "crypto";

/** Paddle API response envelope */
interface PaddleResponse<T> {
  data: T;
  meta?: {
    request_id: string;
  };
  error?: {
    code: string;
    detail: string;
  };
}

/** Paddle transaction item for checkout */
interface PaddleTransactionItem {
  price_id: string;
  quantity: number;
}

/** Paddle transaction data */
interface PaddleTransaction {
  id: string;
  status: string;
  custom_data: Record<string, unknown> | null;
  details: {
    totals: {
      total: string;
      currency_code: string;
    };
  };
  checkout?: {
    url?: string;
  };
}

/** Paddle price data for sync */
interface PaddlePrice {
  id: string;
  product_id: string;
  amount: string;
  currency_code: string;
}

/** Paddle webhook event body */
interface PaddleWebhookBody {
  event_type: string;
  event_data?: Record<string, unknown>;
  data: PaddleTransaction & {
    custom_data?: Record<string, unknown> | null;
  };
  notification_id?: string;
}

export class PaddleAdapter implements IPaymentGateway {
  readonly gatewayId = "paddle";
  readonly name = "Paddle";
  readonly supportedCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "AUD",
    "CAD",
    "SGD",
    "JPY",
  ];

  private configRepo = new GatewayConfigRepository();

  /**
   * Get decrypted gateway config from payment_gateways table.
   * Returns apiKey, clientToken, clientSecret, vendorId, and optional priceMap.
   */
  private async getDecryptedConfig(): Promise<{
    apiKey: string;
    clientToken: string;
    clientSecret: string;
    vendorId: string;
    testMode: boolean;
    priceMap?: Record<string, string>;
  }> {
    const row = await this.configRepo.getByGatewayId(this.gatewayId);
    if (!row) {
      throw new PaymentError(
        "INVALID_CONFIG",
        "Paddle gateway is not configured",
        this.gatewayId
      );
    }
    const config = row.config as Record<string, unknown>;
    return {
      apiKey: config.apiKey as string,
      clientToken: config.clientToken as string,
      clientSecret: config.clientSecret as string,
      vendorId: config.vendorId as string,
      testMode: row.testMode,
      priceMap: config.priceMap as Record<string, string> | undefined,
    };
  }

  /**
   * Get Paddle API base URL based on test mode.
   */
  private getBaseUrl(testMode: boolean): string {
    return testMode
      ? "https://sandbox-api.paddle.com"
      : "https://api.paddle.com";
  }

  /**
   * Create a payment session using Paddle Billing API.
   * Hosted checkout pattern (D-12): creates a transaction and returns redirect URL.
   * Timeout: 15s via AbortController (D-39).
   */
  async createSession(params: CreateSessionParams): Promise<CreateSessionResult> {
    const config = await this.getDecryptedConfig();
    const baseUrl = this.getBaseUrl(config.testMode);

    // Look up price_id for the plan from config priceMap
    const priceId = config.priceMap?.[params.plan];
    if (!priceId) {
      throw new PaymentError(
        "INVALID_CONFIG",
        `No Paddle price_id configured for plan '${params.plan}'`,
        this.gatewayId
      );
    }

    const body: {
      items: PaddleTransactionItem[];
      custom_data: Record<string, string>;
      checkout?: { url: string };
    } = {
      items: [{ price_id: priceId, quantity: 1 }],
      custom_data: {
        orderId: params.orderId,
        userId: params.userId,
        plan: params.plan,
      },
    };

    // Set checkout success URL for hosted checkout redirect
    if (params.successUrl) {
      body.checkout = { url: params.successUrl };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(`${baseUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          (errorData as { error?: { detail?: string } })?.error?.detail ||
          `${response.status} ${response.statusText}`;
        throw new PaymentError(
          response.status >= 400 && response.status < 500
            ? "PAYMENT_FAILED"
            : "GATEWAY_DOWN",
          `Paddle session creation failed: ${errorMsg}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as PaddleResponse<PaddleTransaction>;

      if (!data.data?.id) {
        throw new PaymentError(
          "PAYMENT_FAILED",
          "Paddle session creation returned no transaction ID",
          this.gatewayId
        );
      }

      // Extract checkout URL from transaction if available
      const checkoutUrl = data.data.checkout?.url;

      return {
        redirectUrl: checkoutUrl || undefined,
        transactionId: data.data.id,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new PaymentError(
          "NETWORK_ERROR",
          "Paddle session creation timed out after 15s",
          this.gatewayId,
          error
        );
      }
      throw new PaymentError(
        "NETWORK_ERROR",
        `Paddle session creation failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Verify a payment by querying the Paddle transaction API.
   * Maps Paddle statuses to VerifyPaymentResult.
   */
  async verifyPayment(transactionId: string): Promise<VerifyPaymentResult> {
    const config = await this.getDecryptedConfig();
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(`${baseUrl}/transactions/${encodeURIComponent(transactionId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new PaymentError(
          "NETWORK_ERROR",
          `Paddle verification failed: ${response.status}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as PaddleResponse<PaddleTransaction>;
      const txn = data.data;

      const customData = txn.custom_data as Record<string, unknown> | null;
      const orderId = (customData?.orderId as string) || "";
      const amount = txn.details?.totals?.total
        ? parseFloat(txn.details.totals.total)
        : 0;
      const currency = txn.details?.totals?.currency_code || "USD";

      // Paddle 'completed' and 'billed' both mean payment captured
      const isSuccess =
        txn.status === "completed" || txn.status === "billed";

      return {
        success: isSuccess,
        orderId,
        gatewayTransactionId: txn.id,
        amount,
        currency,
        rawResponse: txn as unknown as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `Paddle verification failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Process an incoming webhook from Paddle (D-16, D-28).
   *
   * Verifies HMAC-SHA256 signature from Paddle-Signature header (T-34-11).
   * Format: ts=<timestamp>;v1=<signature>
   * Signed payload: ts:<rawBody>
   *
   * Handles 3 event types (D-16):
   * - transaction.completed -> status="completed"
   * - transaction.payment_failed -> status="failed"
   * - transaction.refunded -> status="refunded"
   */
  async handleWebhook(request: Request): Promise<WebhookResult> {
    try {
      const rawBody = await request.text();

      // Parse and verify signature (T-34-11)
      const signatureHeader = request.headers.get("Paddle-Signature");
      if (!signatureHeader) {
        throw new PaymentError(
          "WEBHOOK_INVALID",
          "Missing Paddle-Signature header",
          this.gatewayId
        );
      }

      const config = await this.getDecryptedConfig();
      const isValid = this.verifyWebhookSignature(
        signatureHeader,
        rawBody,
        config.clientSecret
      );

      if (!isValid) {
        throw new PaymentError(
          "WEBHOOK_INVALID",
          "Invalid Paddle webhook signature",
          this.gatewayId
        );
      }

      // Parse event body
      const body = JSON.parse(rawBody) as PaddleWebhookBody;
      const eventType = body.event_type || "unknown";

      // Map event types to status (D-16)
      let status: "completed" | "failed" | "refunded";
      switch (eventType) {
        case "transaction.completed":
          status = "completed";
          break;
        case "transaction.payment_failed":
          status = "failed";
          break;
        case "transaction.refunded":
          status = "refunded";
          break;
        default:
          // Unknown event types: log but don't fail
          return {
            success: false,
            eventType: "unknown",
            status: "failed",
            rawPayload: body as unknown as Record<string, unknown>,
          };
      }

      // Extract order data from webhook
      const customData = body.data?.custom_data as Record<string, unknown> | null;
      const orderId = (customData?.orderId as string) || undefined;
      const gatewayTransactionId = body.data?.id || undefined;

      return {
        success: true,
        eventType,
        orderId,
        gatewayTransactionId,
        status,
        rawPayload: body as unknown as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      return {
        success: false,
        eventType: "error",
        status: "failed",
        rawPayload: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Verify Paddle webhook HMAC-SHA256 signature.
   *
   * Paddle-Signature header format: ts=<timestamp>;v1=<hmac_hex>
   * Signed content: <timestamp>:<rawBody>
   * (T-34-11: prevent spoofing of webhook events)
   */
  private verifyWebhookSignature(
    signatureHeader: string,
    rawBody: string,
    clientSecret: string
  ): boolean {
    // Parse ts and v1 from header
    const parts = signatureHeader.split(";");
    let ts = "";
    let v1 = "";

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "ts") ts = value;
      if (key === "v1") v1 = value;
    }

    if (!ts || !v1) {
      return false;
    }

    // Reconstruct signed payload
    const signedPayload = `${ts}:${rawBody}`;

    // Compute HMAC-SHA256
    const hmac = createHmac("sha256", clientSecret);
    hmac.update(signedPayload);
    const computed = hmac.digest("hex");

    // Constant-time comparison to prevent timing attacks
    if (computed.length !== v1.length) {
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) {
      mismatch |= computed.charCodeAt(i) ^ v1.charCodeAt(i);
    }

    return mismatch === 0;
  }

  /**
   * Process a refund via Paddle API (D-31).
   * POST /transactions/{transactionId}/refund
   */
  async processRefund(params: RefundParams): Promise<RefundResult> {
    const config = await this.getDecryptedConfig();
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(
        `${baseUrl}/transactions/${encodeURIComponent(params.gatewayTransactionId)}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            amount: params.amount.toString(),
            reason: params.reason || "Requested by merchant",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          (errorData as { error?: { detail?: string } })?.error?.detail ||
          `${response.status}`;
        return {
          success: false,
          message: `Paddle refund failed: ${errorMsg}`,
        };
      }

      const data = (await response.json()) as PaddleResponse<{ id: string }>;

      return {
        success: true,
        refundId: data.data?.id,
        message: "Refund processed via Paddle",
      };
    } catch (error) {
      return {
        success: false,
        message: `Paddle refund error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Query the current payment status from Paddle.
   * Maps Paddle statuses to our standard status values.
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    const config = await this.getDecryptedConfig();
    const baseUrl = this.getBaseUrl(config.testMode);

    try {
      const response = await fetch(
        `${baseUrl}/transactions/${encodeURIComponent(transactionId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new PaymentError(
          "NETWORK_ERROR",
          `Paddle status query failed: ${response.status}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as PaddleResponse<PaddleTransaction>;
      const txn = data.data;

      // Map Paddle status to our standard status
      let status: "pending" | "completed" | "failed" | "refunded";
      switch (txn.status) {
        case "completed":
        case "billed":
          status = "completed";
          break;
        case "past_due":
        case "paused":
          status = "pending";
          break;
        case "canceled":
        case "failed":
          status = "failed";
          break;
        case "refunded":
          status = "refunded";
          break;
        default:
          status = "pending";
      }

      const amount = txn.details?.totals?.total
        ? parseFloat(txn.details.totals.total)
        : undefined;
      const currency = txn.details?.totals?.currency_code || undefined;

      return {
        status,
        gatewayTransactionId: txn.id,
        amount,
        currency,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `Paddle status query failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Validate Paddle configuration by making a lightweight API call.
   * If the API returns 200, credentials are valid (D-30 Test Connection).
   */
  async validateConfig(config: Record<string, unknown>): Promise<boolean> {
    try {
      const apiKey = config.apiKey as string;
      if (!apiKey) return false;

      const testMode = config.testMode as boolean;
      const baseUrl = this.getBaseUrl(testMode);

      // Lightweight test: list transactions with per_page=1
      const response = await fetch(`${baseUrl}/transactions?per_page=1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(10_000),
      });

      // 200 = valid credentials, 401/403 = invalid
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Configuration field definitions for the Paddle gateway admin UI.
   */
  getRequiredConfigFields(): ConfigFieldDefinition[] {
    return [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        description: "Paddle vendor API key for server-side requests",
      },
      {
        key: "clientToken",
        label: "Client Token",
        type: "password",
        required: true,
        description: "Paddle client-side token for checkout integration",
      },
      {
        key: "clientSecret",
        label: "Client Secret",
        type: "password",
        required: true,
        description:
          "Used for webhook signature verification (HMAC-SHA256)",
      },
      {
        key: "vendorId",
        label: "Vendor ID",
        type: "text",
        required: true,
        description: "Paddle vendor/seller ID",
      },
    ];
  }

  /**
   * Sync a CF product plan price to Paddle Prices API (D-34).
   * Creates or updates a Paddle price for the given plan.
   * Returns the Paddle price_id and updates the gateway config priceMap.
   *
   * Called by admin after saving plan prices.
   */
  async syncPrice(
    planSlug: string,
    amount: number,
    currency: string
  ): Promise<string> {
    const config = await this.getDecryptedConfig();
    const baseUrl = this.getBaseUrl(config.testMode);

    // Check if price already exists in priceMap
    const existingPriceId = config.priceMap?.[planSlug];

    try {
      if (existingPriceId) {
        // Update existing price
        const response = await fetch(
          `${baseUrl}/prices/${encodeURIComponent(existingPriceId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100).toString(), // Paddle uses cents
              currency_code: currency,
            }),
          }
        );

        if (!response.ok) {
          throw new PaymentError(
            "PAYMENT_FAILED",
            `Failed to update Paddle price: ${response.status}`,
            this.gatewayId
          );
        }

        const data = (await response.json()) as PaddleResponse<PaddlePrice>;
        return data.data.id;
      } else {
        // Create new price - requires product_id from config
        const productId = config.vendorId; // Use vendorId as product_id fallback

        const response = await fetch(`${baseUrl}/prices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            product_id: productId,
            amount: Math.round(amount * 100).toString(), // Paddle uses cents
            currency_code: currency,
            description: `ConversionFlow ${planSlug} plan`,
          }),
        });

        if (!response.ok) {
          throw new PaymentError(
            "PAYMENT_FAILED",
            `Failed to create Paddle price: ${response.status}`,
            this.gatewayId
          );
        }

        const data = (await response.json()) as PaddleResponse<PaddlePrice>;
        const priceId = data.data.id;

        // Store the new price_id back in gateway config priceMap
        const updatedPriceMap = { ...(config.priceMap || {}), [planSlug]: priceId };
        const row = await this.configRepo.getByGatewayId(this.gatewayId);
        if (row) {
          const fullConfig = row.config as Record<string, unknown>;
          fullConfig.priceMap = updatedPriceMap;
          await this.configRepo.saveConfig(this.gatewayId, fullConfig, this.name);
        }

        return priceId;
      }
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `Paddle price sync failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }
}
