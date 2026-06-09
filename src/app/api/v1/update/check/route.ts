/**
 * POST /api/v1/update/check
 *
 * WordPress-compatible update check endpoint per D-08, D-09, UPDT-01.
 *
 * Accepts: { license_key, domain, api_token, installed_version, product_slug }
 * Returns: WordPress plugin info API compatible JSON or { update_available: false }
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-23
 * - All error paths return identical response (prevents key/version enumeration)
 * - Per-license API token auth (same as validate endpoint)
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { UpdateCheckHandler } from "@/modules/licensing/application/commands/UpdateCheckHandler";

const NO_UPDATE_RESPONSE = () =>
  NextResponse.json(
    { update_available: false },
    { status: 200 },
  );

export async function POST(request: NextRequest) {
  // 1. Rate limit per D-23
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { update_available: false, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  // 2. Parse body
  let body: {
    license_key?: string;
    domain?: string;
    api_token?: string;
    installed_version?: string;
    product_slug?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NO_UPDATE_RESPONSE();
  }

  if (
    !body.license_key ||
    !body.domain ||
    !body.api_token ||
    !body.installed_version ||
    !body.product_slug
  ) {
    return NO_UPDATE_RESPONSE();
  }

  // 3. Delegate to handler (validates license, compares versions, generates download URL)
  const result = await UpdateCheckHandler.execute(
    {
      licenseKey: body.license_key,
      domain: body.domain,
      apiToken: body.api_token,
      installedVersion: body.installed_version,
      productSlug: body.product_slug,
    },
    ip,
    request.headers.get("user-agent"),
  );

  if (
    !result ||
    ("update_available" in result && !result.update_available)
  ) {
    return NO_UPDATE_RESPONSE();
  }

  // 4. Return update info
  return NextResponse.json(result);
}
