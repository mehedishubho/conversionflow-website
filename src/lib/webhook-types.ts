/**
 * Webhook Payload Types
 *
 * TypeScript interfaces defining the expected webhook payload contract
 * from the central licensing API at license.devsroom.com.
 *
 * Per D-13: Define expected contract, adjust when central API documentation is available.
 */

// ──────────────────────────────────────────────
// Event Types
// ──────────────────────────────────────────────

export type WebhookEventType =
  | "license.created"
  | "license.updated"
  | "license.expired"
  | "license.payment_refunded";

// ──────────────────────────────────────────────
// Payload Interfaces
// ──────────────────────────────────────────────

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: WebhookEventData;
}

export interface WebhookEventData {
  centralLicenseId: string;
  licenseKey: string;
  userId: string;
  productId: string;
  plan: string;
  status: string;
  activationDomains: ActivationDomain[];
  currentActivations: number;
  maxActivations: number;
  expiresAt: string | null;
  orderId?: string;
  refundReason?: string;
}

export interface ActivationDomain {
  domain: string;
  activatedAt: string;
  lastVerifiedAt: string;
  ipAddress: string;
  country: string;
  isMultisite: boolean;
  isActive: boolean;
}
