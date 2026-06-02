/**
 * POST /api/v1/license/activate
 *
 * Domain activation endpoint per D-22, D-23.
 *
 * Accepts: { license_key, api_token, domain, verification_method, verification_token }
 * Returns: { valid, license_id, plan, expires_at, max_activations, current_activations, error }
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-08
 * - API token validated via constant-time comparison (T-16-13)
 * - Domain proof fetched server-side (T-16-11), never trusts client content
 * - Verification token consumed atomically (single-use, D-13)
 * - Atomic activation count increment prevents race conditions (D-16)
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { ActivateLicenseHandler } from "@/modules/licensing/application/commands/ActivateLicenseHandler";

export async function POST(request: NextRequest) {
  // 1. Rate limit per D-08
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent");

  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        valid: false,
        error: "RATE_LIMITED",
        license_id: null,
        plan: null,
        expires_at: null,
        max_activations: null,
        current_activations: null,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  // 2. Parse body
  let body: {
    license_key?: string;
    api_token?: string;
    domain?: string;
    verification_method?: "dns" | "file" | "meta";
    verification_token?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_REQUEST",
        license_id: null,
        plan: null,
        expires_at: null,
        max_activations: null,
        current_activations: null,
      },
      { status: 400 },
    );
  }

  // 3. Validate required fields
  if (
    !body.license_key ||
    !body.api_token ||
    !body.domain ||
    !body.verification_method ||
    !body.verification_token
  ) {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_REQUEST",
        license_id: null,
        plan: null,
        expires_at: null,
        max_activations: null,
        current_activations: null,
      },
      { status: 400 },
    );
  }

  // 4. Validate verification_method value
  if (!["dns", "file", "meta"].includes(body.verification_method)) {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_REQUEST",
        license_id: null,
        plan: null,
        expires_at: null,
        max_activations: null,
        current_activations: null,
      },
      { status: 400 },
    );
  }

  // 5. Delegate to handler
  const result = await ActivateLicenseHandler.execute({
    licenseKey: body.license_key,
    apiToken: body.api_token,
    domain: body.domain,
    verificationMethod: body.verification_method,
    verificationToken: body.verification_token,
    ipAddress: ip,
    userAgent,
  });

  if (!result.success) {
    // Map error codes to HTTP status
    const status =
      result.error === "ACTIVATION_LIMIT_REACHED"
        ? 403
        : result.error === "VERIFICATION_FAILED"
          ? 403
          : result.error === "ALREADY_ACTIVATED"
            ? 409
            : 404;
    return NextResponse.json(
      {
        valid: false,
        license_id: null,
        plan: null,
        expires_at: null,
        max_activations: null,
        current_activations: null,
        error: result.error ?? "INVALID_LICENSE",
      },
      { status },
    );
  }

  // 6. Success response per D-23
  return NextResponse.json({
    valid: true,
    license_id: result.licenseId,
    plan: result.plan,
    expires_at: result.expiresAt?.toISOString() ?? null,
    max_activations: result.maxActivations,
    current_activations: result.currentActivations,
    error: null,
  });
}
