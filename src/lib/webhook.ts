/**
 * Webhook HMAC-SHA256 Signature Verification
 *
 * Verifies webhook signatures from the central licensing API using
 * timing-safe comparison to prevent timing side-channel attacks (T-06-01).
 *
 * Security requirements:
 * - Uses raw string payload (not parsed JSON) for HMAC computation
 * - crypto.timingSafeEqual prevents timing attacks (per ASVS V6)
 * - WEBHOOK_SECRET must be configured or verification always fails
 * - Header name: x-webhook-signature
 */

import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

/**
 * Verify an HMAC-SHA256 webhook signature.
 *
 * @param payload - Raw request body as a string (before JSON.parse)
 * @param signature - Signature from the x-webhook-signature header
 * @returns true if the signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("[Webhook] WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(signature, "utf8");

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}
