/**
 * Central Licensing API Client
 *
 * Communicates with the central licensing engine at license.devsroom.com.
 * Imports completed orders, receives license keys, and syncs user/license mappings.
 *
 * When CENTRAL_API_KEY is not set (development), falls back to mockImportOrderToCentral
 * which generates a fake license key using nanoid.
 */

import { nanoid } from "nanoid";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const CENTRAL_API_URL =
  process.env.CENTRAL_API_URL || "https://license.devsroom.com";
const CENTRAL_API_KEY = process.env.CENTRAL_API_KEY;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ImportOrderPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  productId: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentRef: string | null;
}

export interface ImportOrderResponse {
  centralOrderId: string;
  centralUserId: string;
  centralLicenseId: string;
  licenseKey: string;
}

export interface CentralResult {
  success: boolean;
  data?: ImportOrderResponse;
  error?: string;
}

// ──────────────────────────────────────────────
// Production Client
// ──────────────────────────────────────────────

/**
 * Import a completed order to the central licensing API.
 * POSTs to /api/orders/import with Bearer token auth.
 * On network error or non-200 response, returns { success: false, error }.
 */
export async function importOrderToCentral(
  payload: ImportOrderPayload
): Promise<CentralResult> {
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/orders/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CENTRAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `Central API returned ${response.status}: ${text}`,
      };
    }

    const data = (await response.json()) as ImportOrderResponse;

    return {
      success: true,
      data,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";
    return {
      success: false,
      error: `Central API network error: ${message}`,
    };
  }
}

// ──────────────────────────────────────────────
// Mock Client (Development Fallback)
// ──────────────────────────────────────────────

/**
 * Mock central API import for development when CENTRAL_API_KEY is not set.
 * Generates a realistic-looking fake license key using nanoid.
 * Returns mock centralOrderId, centralUserId, centralLicenseId.
 */
export async function mockImportOrderToCentral(
  payload: ImportOrderPayload
): Promise<CentralResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const licenseKey = `CF-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}`;

  return {
    success: true,
    data: {
      centralOrderId: `central-order-${nanoid(8)}`,
      centralUserId: `central-user-${nanoid(8)}`,
      centralLicenseId: `central-license-${nanoid(8)}`,
      licenseKey,
    },
  };
}
