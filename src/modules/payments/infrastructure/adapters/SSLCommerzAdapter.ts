/**
 * SSLCommerzAdapter - SSL Commerz gateway adapter implementing IPaymentGateway
 *
 * Wraps the existing ssl-commerz.ts functions (createSSLSession, validateSSLPayment)
 * into the IPaymentGateway interface. The underlying functions remain for backward
 * compatibility during the transition period.
 *
 * Credentials are read from the payment_gateways table (encrypted) with a
 * fallback to the settings table for backward compatibility during migration.
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
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

export class SSLCommerzAdapter implements IPaymentGateway {
  readonly gatewayId = "ssl_commerz";
  readonly name = "SSL Commerz";
  readonly supportedCurrencies = ["BDT"];

  private configRepo = new GatewayConfigRepository();

  /**
   * Get decrypted gateway config from payment_gateways table.
   * Falls back to settings table for backward compatibility during migration.
   */
  private async getDecryptedConfig(): Promise<{
    storeId: string;
    storePassword: string;
    baseUrl: string;
  }> {
    const row = await this.configRepo.getByGatewayId(this.gatewayId);
    if (row) {
      const config = row.config as Record<string, string>;
      return {
        storeId: config.storeId,
        storePassword: config.storePassword,
        baseUrl: row.testMode
          ? "https://sandbox.sslcommerz.com"
          : "https://securepay.sslcommerz.com",
      };
    }

    // Fallback to settings table for backward compatibility
    const rows = await db.select().from(settings);
    const get = (key: string) =>
      rows.find((r) => r.key === key)?.value;

    const storeId =
      get("ssl_commerz_store_id") || process.env.SSL_COMMERZ_STORE_ID || "";
    const storePassword =
      get("ssl_commerz_store_password") ||
      process.env.SSL_COMMERZ_STORE_PASSWORD ||
      "";
    const sandboxVal = get("ssl_commerz_sandbox");
    const isSandbox = sandboxVal
      ? sandboxVal !== "false"
      : process.env.SSL_COMMERZ_SANDBOX !== "false";
    const baseUrl = isSandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";

    return { storeId, storePassword, baseUrl };
  }

  /**
   * Create a payment session with SSL Commerz.
   * Port of createSSLSession logic with config from payment_gateways table.
   * Timeout: 30s via AbortController (D-39).
   */
  async createSession(params: CreateSessionParams): Promise<CreateSessionResult> {
    const config = await this.getDecryptedConfig();

    const body = new URLSearchParams({
      store_id: config.storeId,
      store_passwd: config.storePassword,
      total_amount: params.amount.toString(),
      currency: params.currency,
      tran_id: params.orderId,
      success_url: params.successUrl,
      fail_url: params.failUrl,
      cancel_url: params.cancelUrl,
      ipn_url: params.webhookUrl,
      product_name: params.productId || "ConversionFlow",
      product_category: "WordPress Plugin",
      cus_name: params.customerName,
      cus_email: params.customerEmail,
      cus_phone: params.customerPhone || "",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      value_a: params.orderId,
      value_b: params.userId,
      value_c: params.plan,
      value_d: params.couponCode || "",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(
        `${config.baseUrl}/gwprocess/v4/api.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new PaymentError(
          "GATEWAY_DOWN",
          `SSL Commerz session creation failed: ${response.status} ${response.statusText}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as {
        status: string;
        sessionkey: string;
        GatewayPageURL: string;
        failedreason?: string;
      };

      if (!data.GatewayPageURL) {
        throw new PaymentError(
          "PAYMENT_FAILED",
          `SSL Commerz session creation returned no redirect URL: ${data.failedreason || "unknown error"}`,
          this.gatewayId
        );
      }

      return {
        redirectUrl: data.GatewayPageURL,
        sessionData: { sessionkey: data.sessionkey },
        transactionId: data.sessionkey,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new PaymentError(
          "NETWORK_ERROR",
          "SSL Commerz session creation timed out after 30s",
          this.gatewayId,
          error
        );
      }
      throw new PaymentError(
        "NETWORK_ERROR",
        `SSL Commerz session creation failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Verify a payment by querying SSL Commerz server-to-server.
   * Uses the validation API with the val_id from the IPN callback.
   * This is the ONLY trusted validation mechanism (T-34-07).
   */
  async verifyPayment(valId: string): Promise<VerifyPaymentResult> {
    const config = await this.getDecryptedConfig();
    const url = `${config.baseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(config.storeId)}&store_passwd=${encodeURIComponent(config.storePassword)}&v=1&format=json`;

    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new PaymentError(
          "NETWORK_ERROR",
          `SSL Commerz validation request failed: ${response.status}`,
          this.gatewayId
        );
      }

      const data = (await response.json()) as {
        status: string;
        tran_id: string;
        val_id: string;
        amount: string;
        currency: string;
        bank_tran_id: string;
        [key: string]: unknown;
      };

      if (data.status !== "VALID") {
        return {
          success: false,
          orderId: data.tran_id || "",
          gatewayTransactionId: data.bank_tran_id || "",
          amount: parseFloat(data.amount) || 0,
          currency: data.currency || "BDT",
          rawResponse: data as Record<string, unknown>,
        };
      }

      return {
        success: true,
        orderId: data.tran_id,
        gatewayTransactionId: data.bank_tran_id,
        amount: parseFloat(data.amount),
        currency: data.currency,
        rawResponse: data as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError(
        "NETWORK_ERROR",
        `SSL Commerz verification failed: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Process an incoming webhook (IPN) from SSL Commerz.
   * Parses form data, validates server-to-server, returns WebhookResult.
   * Does NOT call OrderService.completeOrder directly -- the webhook route does that.
   */
  async handleWebhook(request: Request): Promise<WebhookResult> {
    try {
      const formData = await request.formData();
      const valId = formData.get("val_id") as string | null;
      const tranId = formData.get("tran_id") as string | null;
      const status = formData.get("status") as string | null;
      const bankTranId = formData.get("bank_tran_id") as string | null;
      const amount = formData.get("amount") as string | null;
      const currency = formData.get("currency") as string | null;

      // Build raw payload from form data
      const rawPayload: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        rawPayload[key] = value;
      });

      if (!valId || !tranId) {
        return {
          success: false,
          eventType: "ipn.missing_fields",
          status: "failed",
          rawPayload,
        };
      }

      // Server-to-server validation (T-34-07: never trust webhook payload alone)
      const validation = await this.verifyPayment(valId);

      if (!validation.success) {
        return {
          success: false,
          eventType: "ipn.validation_failed",
          orderId: tranId,
          gatewayTransactionId: bankTranId || undefined,
          status: "failed",
          rawPayload,
        };
      }

      return {
        success: true,
        eventType: "ipn.payment_completed",
        orderId: tranId,
        gatewayTransactionId: bankTranId || validation.gatewayTransactionId,
        status: "completed",
        rawPayload,
      };
    } catch (error) {
      return {
        success: false,
        eventType: "ipn.error",
        status: "failed",
        rawPayload: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Process a refund.
   * SSL Commerz refunds are handled manually by admin via SSL dashboard.
   */
  async processRefund(_params: RefundParams): Promise<RefundResult> {
    // SSL Commerz refunds handled manually by admin via SSL dashboard.
    return {
      success: false,
      message:
        "SSL Commerz refunds must be processed manually via the SSL Commerz merchant dashboard.",
    };
  }

  /**
   * Get the current status of a payment from the gateway.
   * Calls verifyPayment with the transaction ID and maps the result.
   */
  async getPaymentStatus(
    transactionId: string
  ): Promise<PaymentStatusResult> {
    try {
      const result = await this.verifyPayment(transactionId);

      return {
        status: result.success ? "completed" : "failed",
        gatewayTransactionId: result.gatewayTransactionId,
        amount: result.amount,
        currency: result.currency,
      };
    } catch (error) {
      throw new PaymentError(
        "NETWORK_ERROR",
        `Failed to get payment status: ${error instanceof Error ? error.message : String(error)}`,
        this.gatewayId,
        error
      );
    }
  }

  /**
   * Validate the gateway's configuration.
   * Makes a lightweight request to verify credentials are valid.
   */
  async validateConfig(
    config: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const storeId = config.storeId as string;
      const storePassword = config.storePassword as string;

      if (!storeId || !storePassword) {
        return false;
      }

      // Lightweight validation: make a GET request to the validation server
      // with a test val_id to verify credentials are accepted.
      // If the server returns a proper response (not an auth error), config is valid.
      const baseUrl = config.testMode
        ? "https://sandbox.sslcommerz.com"
        : "https://securepay.sslcommerz.com";

      const url = `${baseUrl}/validator/api/validationserverAPI.php?val_id=test_validation&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(storePassword)}&v=1&format=json`;

      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return false;
      }

      // Any valid JSON response means credentials were accepted
      // (even if the val_id is fake, auth succeeded)
      const data = await response.json();
      return typeof data === "object" && data !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get the configuration field definitions required by this gateway.
   * Used to render the admin settings form dynamically.
   */
  getRequiredConfigFields(): ConfigFieldDefinition[] {
    return [
      {
        key: "storeId",
        label: "Store ID",
        type: "text",
        required: true,
        placeholder: "Enter SSL Commerz Store ID",
        description:
          "Found in your SSL Commerz merchant panel under Store Settings.",
      },
      {
        key: "storePassword",
        label: "Store Password",
        type: "password",
        required: true,
        placeholder: "Enter SSL Commerz Store Password",
        description:
          "Found in your SSL Commerz merchant panel under Store Settings.",
      },
    ];
  }
}
