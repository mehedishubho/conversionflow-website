/**
 * Webhook Route: /api/webhooks/license
 *
 * Receives HMAC-signed license events from the central licensing API
 * at license.devsroom.com. Validates signature, parses event type,
 * then dispatches to event-specific handler functions.
 *
 * Security (T-06-02):
 * - HMAC verification via x-webhook-signature header
 * - Raw body used for HMAC computation (before JSON.parse)
 * - Generic error responses (T-06-04: no stack traces exposed)
 *
 * Pattern follows: src/app/api/ssl-commerz/ipn/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook";
import {
  handleLicenseCreated,
  handleLicenseUpdated,
  handleLicenseExpired,
  handlePaymentRefunded,
} from "@/lib/webhook-handlers";
import type { WebhookPayload } from "@/lib/webhook-types";

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body for HMAC verification (T-06-01)
    const body = await request.text();

    // 2. Validate HMAC signature (T-06-02)
    const signature = request.headers.get("x-webhook-signature");

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 3. Parse payload after signature is verified
    const payload: WebhookPayload = JSON.parse(body);

    // 4. Dispatch to event-specific handler
    switch (payload.event) {
      case "license.created":
        await handleLicenseCreated(payload.data);
        break;
      case "license.updated":
        await handleLicenseUpdated(payload.data);
        break;
      case "license.expired":
        await handleLicenseExpired(payload.data);
        break;
      case "license.payment_refunded":
        await handlePaymentRefunded(payload.data);
        break;
      default:
        // Unknown events logged but do not cause 500 errors
        console.warn(
          `[Webhook] Unknown event type: ${(payload as unknown as Record<string, unknown>).event}`
        );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // T-06-04: Generic error response, never expose internals
    console.error("[Webhook] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
