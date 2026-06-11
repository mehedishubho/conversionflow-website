/**
 * POST /api/v1/license/verification-token
 *
 * Issues a domain verification token for license activation.
 *
 * Accepts: { license_key, api_token, domain }
 * Returns: { valid, token, error }
 *
 * Security:
 * - Rate limited (100 req/min per IP) per D-08
 * - API token validated via constant-time comparison (T-16-13)
 * - Token is single-use, 24h TTL, bound to (licenseId, domain) via VerificationTokenIssuer
 * - Only active, unexpired licenses can request tokens
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { VerificationTokenIssuer } from "@/modules/licensing/domain/services/VerificationTokenIssuer";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { Domain } from "@/shared/domain/valueObjects/Domain";

export async function POST(request: NextRequest) {
  // 1. Rate limit per D-08
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rateLimit = await RateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        valid: false,
        error: "RATE_LIMITED",
        token: null,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  // 2. Parse body
  let body: { license_key?: string; api_token?: string; domain?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_REQUEST",
        token: null,
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
        token: null,
      },
      { status: 400 },
    );
  }

  // 4. Parse license key
  let key: LicenseKey;
  try {
    key = LicenseKey.create(body.license_key);
  } catch {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_LICENSE",
        token: null,
      },
      { status: 404 },
    );
  }

  // 5. Normalize domain
  let domain: string;
  try {
    domain = Domain.create(body.domain).value;
  } catch {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_LICENSE",
        token: null,
      },
      { status: 404 },
    );
  }

  // 6. Look up license by key
  const licenseRepo = new LicenseRepository();
  const license = await licenseRepo.findByKey(key.value);
  if (!license) {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_LICENSE",
        token: null,
      },
      { status: 404 },
    );
  }

  // 7. Validate API token (constant-time comparison)
  if (
    !license.apiTokenHash ||
    !ApiTokenGenerator.validate(body.api_token, license.apiTokenHash)
  ) {
    return NextResponse.json(
      {
        valid: false,
        error: "INVALID_LICENSE",
        token: null,
      },
      { status: 404 },
    );
  }

  // 8. Check license status is active
  if (license.status === "revoked" || license.status === "suspended") {
    return NextResponse.json(
      {
        valid: false,
        error: "LICENSE_NOT_ACTIVE",
        token: null,
      },
      { status: 403 },
    );
  }

  // 9. Check not expired
  if (license.expiresAt && new Date() > license.expiresAt) {
    return NextResponse.json(
      {
        valid: false,
        error: "LICENSE_EXPIRED",
        token: null,
      },
      { status: 403 },
    );
  }

  // 10. Issue verification token
  const token = await VerificationTokenIssuer.issue(license.id, domain);

  // 11. Success response
  return NextResponse.json({
    valid: true,
    token,
  });
}
