/**
 * POST /api/v1/license/deactivate
 *
 * Domain deactivation endpoint per D-22, D-23.
 *
 * Accepts: { license_key, api_token, domain }
 * Returns: { valid, license_id, plan, expires_at, max_activations, current_activations, error }
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-08
 * - API token validated via constant-time comparison (T-16-13)
 * - Atomic decrement prevents race conditions (D-16)
 * - Shared performDeactivation() ensures identical behavior with portal path (D-29)
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { DeactivateLicenseHandler } from "@/modules/licensing/application/commands/DeactivateLicenseHandler";

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
  if (!body.license_key || !body.api_token || !body.domain) {
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

  // 4. Delegate to handler
  const result = await DeactivateLicenseHandler.execute({
    licenseKey: body.license_key,
    apiToken: body.api_token,
    domain: body.domain,
    ipAddress: ip,
    userAgent,
  });

  if (!result.success) {
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
      { status: 404 },
    );
  }

  // 5. Success response per D-23
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
