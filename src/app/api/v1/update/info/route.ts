/**
 * POST /api/v1/update/info
 *
 * WordPress plugin info endpoint per D-10, UPDT-01.
 * Returns full plugin info sections for WordPress "View version x.x details" popup.
 *
 * Accepts: { license_key, domain, api_token, product_slug }
 * Returns: WordPress plugin info object or { info_available: false }
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-23
 * - All error paths return identical response (prevents key/version enumeration)
 * - Per-license API token auth (same as validate endpoint)
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { UpdateInfoHandler } from "@/modules/licensing/application/commands/UpdateInfoHandler";

const NO_INFO_RESPONSE = () =>
  NextResponse.json(
    { info_available: false },
    { status: 200 },
  );

export async function POST(request: NextRequest) {
  // 1. Rate limit per D-23
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { info_available: false, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  // 2. Parse body
  let body: {
    license_key?: string;
    domain?: string;
    api_token?: string;
    product_slug?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NO_INFO_RESPONSE();
  }

  if (
    !body.license_key ||
    !body.domain ||
    !body.api_token ||
    !body.product_slug
  ) {
    return NO_INFO_RESPONSE();
  }

  // 3. Delegate to handler (validates license, builds full sections content)
  const result = await UpdateInfoHandler.execute(
    {
      licenseKey: body.license_key,
      domain: body.domain,
      apiToken: body.api_token,
      productSlug: body.product_slug,
    },
    ip,
    request.headers.get("user-agent"),
  );

  if (
    !result ||
    ("info_available" in result && !result.info_available)
  ) {
    return NO_INFO_RESPONSE();
  }

  // 4. Return plugin info
  return NextResponse.json(result);
}
