/**
 * SSL Commerz Payment Gateway Client
 *
 * Direct fetch implementation (no npm package) for SSL Commerz v4 API.
 * Reads credentials from DB settings table (admin-configured) with env var fallback.
 */

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ──────────────────────────────────────────────
// Dynamic Configuration
// ──────────────────────────────────────────────

async function getSSLConfig() {
  const rows = await db.select().from(settings);
  const get = (key: string) => rows.find(r => r.key === key)?.value;

  const storeId = get("ssl_commerz_store_id") || process.env.SSL_COMMERZ_STORE_ID || "";
  const storePassword = get("ssl_commerz_store_password") || process.env.SSL_COMMERZ_STORE_PASSWORD || "";
  const sandboxVal = get("ssl_commerz_sandbox");
  const isSandbox = sandboxVal ? sandboxVal !== "false" : process.env.SSL_COMMERZ_SANDBOX !== "false";
  const baseUrl = isSandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";

  return { storeId, storePassword, baseUrl };
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SSLSessionParams {
  totalAmount: number;
  currency: string;
  tranId: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  productName: string;
  productCategory: string;
  cusName: string;
  cusEmail: string;
  cusPhone: string;
  cusAdd1: string;
  cusCity: string;
  cusCountry: string;
  /** Custom field: orderId */
  valueA: string;
  /** Custom field: userId */
  valueB: string;
  /** Custom field: plan */
  valueC: string;
  /** Custom field: couponCode */
  valueD: string;
}

export interface SSLSessionResponse {
  status: string;
  sessionkey: string;
  GatewayPageURL: string;
  failedreason?: string;
}

export interface SSLValidationResponse {
  status: "VALID" | "INVALID" | string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  currency_type: string;
  currency_amount: string;
  [key: string]: unknown;
}

// ──────────────────────────────────────────────
// Functions
// ──────────────────────────────────────────────

/**
 * Create an SSL Commerz payment session.
 * POSTs to the v4 API with form-urlencoded body.
 * Returns the GatewayPageURL for customer redirect.
 */
export async function createSSLSession(
  params: SSLSessionParams
): Promise<SSLSessionResponse> {
  const config = await getSSLConfig();
  const body = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePassword,
    total_amount: params.totalAmount.toString(),
    currency: params.currency,
    tran_id: params.tranId,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    ipn_url: params.ipnUrl,
    product_name: params.productName,
    product_category: params.productCategory,
    cus_name: params.cusName,
    cus_email: params.cusEmail,
    cus_phone: params.cusPhone,
    cus_add1: params.cusAdd1,
    cus_city: params.cusCity,
    cus_country: params.cusCountry,
    value_a: params.valueA,
    value_b: params.valueB,
    value_c: params.valueC,
    value_d: params.valueD,
  });

  const response = await fetch(`${config.baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `SSL Commerz session creation failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as SSLSessionResponse;

  if (data.status !== "SUCCESS" && data.status !== "FAILED") {
    // Unexpected status -- still return data for caller to handle
  }

  return data;
}

/**
 * Validate an SSL Commerz payment server-to-server.
 * Uses the validation API with the val_id from the IPN callback.
 * This is the ONLY trusted validation mechanism -- never trust redirect data alone.
 */
export async function validateSSLPayment(
  valId: string
): Promise<SSLValidationResponse> {
  const config = await getSSLConfig();
  const url = `${config.baseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(config.storeId)}&store_passwd=${encodeURIComponent(config.storePassword)}&v=1&format=json`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      `SSL Commerz validation request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as SSLValidationResponse;

  return data;
}
