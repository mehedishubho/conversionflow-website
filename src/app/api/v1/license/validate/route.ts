/**
 * POST /api/v1/license/validate
 *
 * License validation endpoint per D-22, D-23, LGEN-09.
 *
 * Accepts: { license_key, domain, api_token }
 * Returns: { valid, license_id, plan, expires_at, grace_period_expires_at, max_activations, current_activations, error }
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-08
 * - All error paths return identical HTTP 404 response (T-16-09, LGEN-09)
 * - No timing differentiation between error cases
 * - API routes excluded from proxy.ts auth checks (uses per-license tokens)
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { ValidateLicenseHandler } from "@/modules/licensing/application/commands/ValidateLicenseHandler";
import { PLATFORMS } from "@/lib/config/feature-catalog";

/**
 * Identical error response for all validation failures (LGEN-09, D-21).
 * Prevents timing-based enumeration of valid keys, expired vs revoked, domain-bound vs not.
 */
const INVALID_RESPONSE = () =>
  NextResponse.json(
    {
      valid: false,
      license_id: null,
      plan: null,
      expires_at: null,
      max_activations: null,
      current_activations: null,
      error: "INVALID_LICENSE",
    },
    { status: 404 },
  );

export async function POST(request: NextRequest) {
  // 1. Rate limit per D-08 (before any other work)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        valid: false,
        license_id: null,
        plan: null,
        expires_at: null,
        max_activations: null,
        current_activations: null,
        error: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  // 2. Parse body
  let body: { license_key?: string; domain?: string; api_token?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return INVALID_RESPONSE();
  }

  if (!body.license_key || !body.domain || !body.api_token || !body.platform) {
    return INVALID_RESPONSE();
  }

  // 2b. Validate platform against fixed enum (D-05)
  if (!PLATFORMS.includes(body.platform as any)) {
    return INVALID_RESPONSE();
  }

  // 3. Delegate to handler (auth + cache + DB + format)
  const result = await ValidateLicenseHandler.execute({
    licenseKey: body.license_key,
    domain: body.domain,
    apiToken: body.api_token,
    platform: body.platform,
  });

  if (!result.valid) return INVALID_RESPONSE();

  // 4. Success response per D-02, D-03
  return NextResponse.json({
    valid: true,
    license_id: result.licenseId,
    plan: result.plan,
    expires_at: result.expiresAt?.toISOString() ?? null,
    grace_period_expires_at: result.grace_period_expires_at?.toISOString() ?? null,
    max_activations: result.maxActivations,
    current_activations: result.currentActivations,
    features: result.features,
    error: null,
  });
}
