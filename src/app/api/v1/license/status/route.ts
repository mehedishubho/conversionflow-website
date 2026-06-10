/**
 * POST /api/v1/license/status
 *
 * Full license profile endpoint per D-18, D-19, D-20, D-21, UPDT-03.
 *
 * Accepts: { license_key, domain, api_token }
 * Returns: Full license profile with activations, plan, features, expiry
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-23
 * - All error paths return identical response (same as validate pattern)
 * - Redis cached with 10-min TTL per D-21
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { LicenseStatusHandler } from "@/modules/licensing/application/commands/LicenseStatusHandler";
import { PLATFORMS } from "@/lib/config/feature-catalog";

const INVALID_RESPONSE = () =>
  NextResponse.json(
    { valid: false, error: "INVALID_LICENSE" },
    { status: 404 },
  );

export async function POST(request: NextRequest) {
  // 1. Rate limit per D-23
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { valid: false, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  // 2. Parse body
  let body: { license_key?: string; domain?: string; api_token?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return INVALID_RESPONSE();
  }

  if (!body.license_key || !body.domain || !body.api_token) {
    return INVALID_RESPONSE();
  }

  // 2b. Validate platform if provided (D-08: optional param)
  if (body.platform && !PLATFORMS.includes(body.platform as any)) {
    return INVALID_RESPONSE();
  }

  // 3. Delegate to handler (validates license, retrieves full profile with Redis cache)
  const result = await LicenseStatusHandler.execute({
    licenseKey: body.license_key,
    domain: body.domain,
    apiToken: body.api_token,
    platform: body.platform,
  });

  if (!result || ("valid" in result && !result.valid)) {
    return INVALID_RESPONSE();
  }

  // 4. Return full status
  return NextResponse.json(result);
}
