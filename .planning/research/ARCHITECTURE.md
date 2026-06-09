# Architecture Patterns: v4.0 Multi-Platform License Server

**Domain:** Multi-platform SDKs, update delivery, multi-gateway payments, feature flags, HMAC API security
**Researched:** 2026-06-09
**Overall confidence:** HIGH (codebase-verified for existing; MEDIUM for new patterns based on training data)

## Executive Summary

ConversionFlow v4.0 extends the existing modular monolith with five new bounded-context-level capabilities. The critical architectural insight is that the existing DDD foundation (bounded contexts, domain events, repositories, service layer) is already well-suited for these additions. No structural rewrite is needed. The work falls into two categories: **new bounded contexts** (update-delivery, payments) that integrate via domain events, and **extensions to existing contexts** (feature flags in products, HMAC security in a shared middleware layer, rate-limiting enhancements to the existing RateLimiter).

The `productPlans.features` column already stores `Record<string, boolean>` -- feature flags per plan are partially implemented in the data model. The `productVersions` table already has `downloadUrl`, `changelog`, and `status` fields -- the update delivery system builds on this existing foundation rather than introducing new tables. The payment gateway abstraction layer is the most architecturally significant new addition, requiring a new bounded context that mediates between external gateway SDKs and the existing billing context.

## Recommended Architecture

### System Context Diagram

```
                    EXTERNAL CLIENTS
                    ================
     WordPress Plugin --|                    |-- Laravel App (Composer SDK)
                        |                    |
     Shopify App -------+----> /api/v1/* <---+-- Next.js App (npm SDK)
                        |       (HMAC)       |
     Customer Portal ---+                    |-- Admin Dashboard
                    ================

                         |
                         v

              CONVERSIONFLOW (Next.js 16)
              ============================
              
  ┌─────────────────────────────────────────────────────────┐
  │                  Shared Infrastructure                   │
  │  Event Bus │ HMAC Middleware │ Rate Limiter │ Redis Cache│
  └──────┬──────────┬──────────────────┬──────────────┬─────┘
         │          │                  │              │
  ┌──────▼──┐ ┌─────▼──────┐ ┌────────▼───────┐ ┌───▼──────┐
  │Products │ │ Licensing  │ │   Billing      │ │Analytics │
  │(extend) │ │ (extend)   │ │  (extend)      │ │(extend)  │
  │+features│ │+status API │ │+gateway layer  │ │+platform │
  └─────────┘ └────────────┘ └────────────────┘ └──────────┘
       │            │                  │
  ┌────▼────────────▼──────────────────▼──────┐
  │              Update Delivery (NEW)         │
  │    /update/check  /update/download         │
  └────────────────────────────────────────────┘
       │            │                  │
  ┌────▼─────┐ ┌────▼───────┐ ┌───────▼──────┐
  │ WordPress│ │  Stripe    │ │   Paddle     │
  │ Transient│ │  Adapter   │ │   Adapter    │
  │ Format   │ │            │ │   (MoR)      │
  └──────────┘ └────────────┘ └──────────────┘
```

### Component Boundaries

| Component | Type | Responsibility | Communicates With |
|-----------|------|----------------|-------------------|
| **Update Delivery** | NEW bounded context | Plugin update checks, authenticated ZIP downloads, version resolution | Products (reads versions), Licensing (validates license for download), Analytics (tracks downloads) |
| **Payment Gateways** | NEW bounded context | Multi-gateway abstraction (Stripe, Paddle, bKash API), unified interface, webhook normalization | Billing (triggers OrderCompleted on payment success), Products (reads plan pricing) |
| **HMAC Middleware** | NEW shared infrastructure | Request signing verification for all /api/v1/* endpoints | All API routes (cross-cutting) |
| **Feature Flags** | EXTENSION to Products context | Per-plan feature definitions, platform-specific feature sets, enforcement in validate response | Licensing (includes features in validation response), Admin UI (CRUD for feature config) |
| **Platform Rate Limiting** | EXTENSION to existing RateLimiter | Per-platform, per-API-key rate limiting with configurable tiers | All API routes (cross-cutting) |
| **License Status API** | EXTENSION to Licensing context | GET endpoint returning full license info + activations | Customer portal, SDKs |

### New vs Modified Components

**NEW files/modules to create:**

```
src/
├── shared/
│   └── infrastructure/
│       ├── middleware/
│       │   ├── hmacVerifier.ts           # HMAC signature verification
│       │   ├── apiKeyAuth.ts             # API key authentication
│       │   └── platformRateLimit.ts      # Per-platform rate limiting
│       └── security/
│           └── hmacSigner.ts             # HMAC signature generation (for SDK docs)
│
├── modules/
│   ├── update/                           # NEW bounded context
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── UpdatePackage.ts      # ZIP package metadata
│   │   │   └── services/
│   │   │       └── VersionResolver.ts    # Latest version resolution logic
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   └── CheckUpdateHandler.ts
│   │   │   └── queries/
│   │   │       └── GetDownloadUrlHandler.ts
│   │   └── infrastructure/
│   │       ├── repositories/
│   │       │   └── UpdateRepository.ts   # Reads productVersions
│   │       └── storage/
│   │           └── ZipStorage.ts         # File system / S3 ZIP storage
│   │
│   └── payments/                         # NEW bounded context
│       ├── domain/
│       │   ├── GatewayInterface.ts       # Abstract gateway contract
│       │   ├── entities/
│       │   │   └── GatewayConfig.ts      # Per-gateway configuration
│       │   └── events/
│       │       └── PaymentEvents.ts      # PaymentCompleted, PaymentFailed
│       ├── application/
│       │   ├── services/
│       │   │   ├── PaymentGatewayFactory.ts  # Factory pattern
│       │   │   └── PaymentService.ts         # Orchestrates gateway calls
│       │   └── handlers/
│       │       └── WebhookHandler.ts     # Normalized webhook processing
│       └── infrastructure/
│           ├── adapters/
│           │   ├── StripeAdapter.ts      # Stripe SDK wrapper
│           │   ├── PaddleAdapter.ts      # Paddle SDK wrapper
│           │   ├── BkashApiAdapter.ts    # bKash automatic API
│           │   ├── SslCommerzAdapter.ts  # Existing SSL Commerz refactored
│           │   └── ManualAdapter.ts      # Manual payment (admin verify)
│           └── repositories/
│               └── PaymentRepository.ts  # Gateway config persistence
│
├── app/
│   └── api/
│       └── v1/
│           ├── update/
│           │   ├── check/route.ts        # POST /api/v1/update/check
│           │   └── download/route.ts     # GET /api/v1/update/download
│           ├── license/
│           │   ├── validate/route.ts     # MODIFIED: add features to response
│           │   ├── status/route.ts       # NEW: GET /api/v1/license/status
│           │   ├── activate/route.ts     # MODIFIED: add HMAC verification
│           │   └── deactivate/route.ts   # MODIFIED: add HMAC verification
│           └── payments/
│               ├── stripe/
│               │   ├── checkout/route.ts # Stripe checkout session
│               │   └── webhook/route.ts  # Stripe webhook handler
│               ├── paddle/
│               │   ├── checkout/route.ts # Paddle checkout
│               │   └── webhook/route.ts  # Paddle webhook handler
│               └── bkash/
│                   ├── create/route.ts   # bKash API create
│                   ├── execute/route.ts  # bKash API execute
│                   └── callback/route.ts # bKash callback
```

**MODIFIED existing files:**

```
src/lib/db/schema.ts                       # Add payment_gateways table, update paymentMethodEnum
src/modules/licensing/application/commands/ValidateLicenseHandler.ts  # Add features to response
src/modules/licensing/infrastructure/adapters/RateLimiter.ts           # Per-platform keys
src/app/api/v1/license/validate/route.ts   # Add HMAC middleware
src/app/api/v1/license/activate/route.ts   # Add HMAC middleware
src/app/api/v1/license/deactivate/route.ts # Add HMAC middleware
src/modules/products/domain/entities/ProductPlan.ts  # Already has features field -- validate platform-specific features
```

### Data Flow

**Flow 1: Update Check (WordPress plugin calling server)**

```
[WordPress Plugin] -- wp_remote_post -->
    POST /api/v1/update/check
    Headers: X-API-Key, X-Signature, X-Timestamp
    Body: { license_key, domain, product_slug, installed_version, platform: "wordpress" }
        |
        v
    [HMAC Middleware] Verify signature + timestamp freshness
        |
        v
    [Rate Limiter] Check per-platform (wordpress) per-API-key limit
        |
        v
    [Update Context] CheckUpdateHandler
        |-- LicenseRepository.findByKey(license_key) -> validate active
        |-- ProductRepository.findBySlug(product_slug) -> get product
        |-- ProductVersionRepository.findLatest(productId) -> compare versions
        |-- If new version available:
        |       Return WordPress transient format:
        |       { new_version, package: signed-download-url, url, requires, tested }
        |-- If no update:
        |       Return { new_version: null } (WordPress treats as no update)
```

**Flow 2: Authenticated ZIP Download**

```
[WordPress Plugin] -- wp_remote_get -->
    GET /api/v1/update/download?token=<signed-token>&license=<key>&version=<x.y.z>
        |
        v
    [Download Token Validation]
        |-- Token is HMAC-signed JSON: { licenseId, version, expiresAt, productId }
        |-- Verify HMAC signature with server secret
        |-- Check token not expired (15-minute TTL)
        |-- Verify license still active
        |
        v
    [ZipStorage] Stream ZIP file from disk/S3
        |
        v
    [Analytics] Track download event
        |
        v
    [Response] Streaming ZIP with Content-Disposition header
```

**Flow 3: Multi-Gateway Payment (Stripe example)**

```
[Customer selects plan, chooses Stripe]
        |
        v
    [Billing Context] POST /api/v1/payments/stripe/checkout
        |-- PaymentService.resolveGateway("stripe")
        |-- StripeAdapter.createCheckoutSession({ plan, user, successUrl, cancelUrl })
        |-- Return { sessionUrl } -> redirect customer
        |
        v
[Customer pays on Stripe hosted checkout]
        |
        v
    [Stripe Webhook] POST /api/v1/payments/stripe/webhook
        |-- Verify Stripe webhook signature
        |-- StripeAdapter.handleWebhook(payload, signature)
        |-- Normalize to: { type: "checkout.completed", provider: "stripe", data: {...} }
        |
        v
    [Payment Context] WebhookHandler.handleNormalizedEvent()
        |-- Extract: userId, productId, plan, amount, currency
        |-- Create/update order record
        |-- Publish PaymentCompleted event
        |
        v
    [Event Bus] PaymentCompleted event
        |
        v
    [Billing Context] OrderCompletedHandler (existing)
        |-- Generate license (existing flow)
        |-- Send confirmation email (existing flow)
```

**Flow 4: Feature Flag Enforcement (License Validation)**

```
[SDK calls /api/v1/license/validate]
        |
        v
    [ValidateLicenseHandler] (existing, modified)
        |-- Existing: validate key, check status, check domain
        |-- NEW: look up ProductPlan.features for this license's plan
        |-- NEW: filter features by platform dimension
        |-- Return: { valid: true, plan: "...", features: { analytics: true, exports: false, ... } }
        |
        v
    [SDK receives features map]
        |-- Plugin code checks: if (response.features.advanced_analytics) { ... }
```

## Patterns to Follow

### Pattern 1: Payment Gateway Interface (Strategy + Factory)

**What:** Define a common TypeScript interface that all payment gateways implement. A factory resolves the correct adapter based on configuration. This is the Strategy pattern combined with Factory.

**When:** Every payment gateway integration must implement this interface. Never call a gateway SDK directly from business logic.

**Example:**

```typescript
// modules/payments/domain/GatewayInterface.ts

export interface CheckoutParams {
  userId: string;
  productId: string;
  plan: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  sessionId: string;
  checkoutUrl: string;
  provider: GatewayProvider;
}

export interface RefundParams {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface NormalizedWebhookEvent {
  type: "checkout.completed" | "checkout.failed" | "subscription.cancelled" | "subscription.renewed" | "payment.refunded";
  provider: GatewayProvider;
  providerEventId: string;
  data: {
    userId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    productId?: string;
    plan?: string;
    raw: unknown;
  };
}

export type GatewayProvider = "stripe" | "paddle" | "bkash_api" | "ssl_commerz" | "manual";

export interface IPaymentGateway {
  readonly provider: GatewayProvider;

  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  handleWebhook(payload: string | Buffer, signature: string): Promise<NormalizedWebhookEvent>;
  refund(params: RefundParams): Promise<{ success: boolean; refundId: string }>;
  verifyPayment(transactionId: string): Promise<{ status: string; amount: number }>;
}
```

```typescript
// modules/payments/application/services/PaymentGatewayFactory.ts

export class PaymentGatewayFactory {
  private static adapters = new Map<GatewayProvider, IPaymentGateway>();

  static register(provider: GatewayProvider, adapter: IPaymentGateway): void {
    this.adapters.set(provider, adapter);
  }

  static get(provider: GatewayProvider): IPaymentGateway {
    const adapter = this.adapters.get(provider);
    if (!adapter) throw new Error(`Payment gateway not configured: ${provider}`);
    return adapter;
  }

  static getActive(): GatewayProvider[] {
    return Array.from(this.adapters.keys());
  }
}
```

**Rationale:** The existing codebase already has `ssl-commerz.ts` as a standalone utility. Rather than refactoring it all at once, the factory pattern allows incremental adoption: register the existing SSL Commerz as the first adapter, then add Stripe, Paddle, and bKash API adapters one at a time. Each adapter is independently testable and deployable.

### Pattern 2: HMAC Request Signing Middleware

**What:** A shared middleware function that verifies HMAC-SHA256 signatures on all incoming /api/v1/* requests. SDKs concatenate `method + path + timestamp + bodyHash`, sign with the license's API token, and include the signature in headers.

**When:** Every API route under /api/v1/* must pass through this verification. This applies to all platform SDKs (WordPress, Laravel, Shopify, Next.js).

**Example:**

```typescript
// shared/infrastructure/middleware/hmacVerifier.ts

import crypto from "crypto";

interface HmacVerificationResult {
  valid: boolean;
  error?: string;
  apiKey?: string;
}

export async function verifyHmacSignature(
  request: Request
): Promise<HmacVerificationResult> {
  const signature = request.headers.get("x-signature");
  const timestamp = request.headers.get("x-timestamp");
  const apiKey = request.headers.get("x-api-key");

  if (!signature || !timestamp || !apiKey) {
    return { valid: false, error: "MISSING_HEADERS" };
  }

  // Replay protection: reject requests older than 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return { valid: false, error: "REQUEST_EXPIRED" };
  }

  // Look up the API token hash for this key
  // (The API token is cf_live_xxxx; the hash is stored in licenses.apiTokenHash)
  const license = await findLicenseByApiToken(apiKey);
  if (!license) {
    return { valid: false, error: "INVALID_API_KEY" };
  }

  // Rebuild canonical string: METHOD\nPATH\nTIMESTAMP\nBODY_HASH
  const url = new URL(request.url);
  const body = await request.clone().text();
  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
  const canonical = `${request.method}\n${url.pathname}\n${timestamp}\n${bodyHash}`;

  // Compute expected HMAC using the plaintext API token as the secret
  // (The SDK has the plaintext token; the server stores only the hash.
  //  Solution: use a separate HMAC secret per license, stored alongside the token hash.)
  const expected = crypto
    .createHmac("sha256", license.hmacSecret)
    .update(canonical)
    .digest("hex");

  // Timing-safe comparison
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return { valid: false, error: "INVALID_SIGNATURE" };

  const valid = crypto.timingSafeEqual(a, b);
  return valid
    ? { valid: true, apiKey }
    : { valid: false, error: "INVALID_SIGNATURE" };
}
```

**Key design decision:** Each license needs an `hmacSecret` field (separate from `apiTokenHash`). The API token identifies the license; the HMAC secret signs requests. During license generation, both are created and the HMAC secret is returned alongside the API token. This matches the existing `ApiTokenGenerator` pattern.

**Schema addition required:**

```typescript
// Add to licenses table:
hmacSecret: text("hmac_secret"),  // HMAC signing secret per license
```

### Pattern 3: WordPress-Compatible Update Transient Format

**What:** The /api/v1/update/check endpoint must return data in WordPress's expected `update_plugins` transient format so that the WordPress SDK can inject it directly into `pre_set_site_transient_update_plugins`.

**When:** Only when the `platform` parameter is "wordpress". Other platforms receive a simpler JSON response.

**Example response for WordPress:**

```json
{
  "slug": "conversionflow-wp",
  "plugin": "conversionflow-wp/conversionflow-wp.php",
  "new_version": "2.1.0",
  "package": "https://conversionflow.com/api/v1/update/download?token=HMAC_SIGNED_TOKEN&license=CF-XXXX&version=2.1.0",
  "url": "https://conversionflow.com/changelog",
  "requires": "6.0",
  "tested": "6.7",
  "requires_php": "8.0",
  "sections": {
    "changelog": "<h4>2.1.0</h4><ul><li>New feature: X</li></ul>"
  }
}
```

**Rationale:** WordPress expects this exact format. The `package` URL must be a signed, time-limited download link (HMAC-signed token with 15-minute TTL) so that the download endpoint can verify authenticity without requiring the license key in the URL (which would be logged in access logs).

### Pattern 4: Feature Flag Resolution (JSONB + Platform Dimension)

**What:** The `productPlans.features` column already stores `Record<string, boolean>`. For v4.0, extend this to support platform-specific features by using a nested structure or a separate platform_features JSONB column.

**When:** Feature enforcement happens during license validation. The validate response includes a `features` object that SDKs check locally.

**Schema approach -- extend existing features column:**

```typescript
// Current: features: Record<string, boolean>
// Example: { "analytics": true, "exports": true, "priority_support": false }

// v4.0 approach: features: Record<string, boolean | Record<string, boolean>>
// Example:
{
  "analytics": true,                       // All platforms
  "exports": { "wordpress": true, "laravel": true, "nextjs": false },
  "priority_support": true,                // All platforms
  "auto_updates": { "wordpress": true, "laravel": true, "shopify": false },
  "advanced_seo": { "wordpress": true, "nextjs": true, "laravel": false }
}
```

**Resolution logic in ValidateLicenseHandler:**

```typescript
function resolveFeatures(
  planFeatures: Record<string, unknown>,
  platform: string
): Record<string, boolean> {
  const resolved: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(planFeatures)) {
    if (typeof value === "boolean") {
      resolved[key] = value;
    } else if (typeof value === "object" && value !== null) {
      resolved[key] = (value as Record<string, boolean>)[platform] ?? false;
    }
  }
  return resolved;
}
```

**Rationale:** Using the existing JSONB column avoids schema migrations for feature definitions. The nested platform dimension is backward-compatible: existing flat boolean features still work, and new platform-specific features add the nesting. This is simpler than a separate feature flags table and keeps all plan configuration in one place.

### Pattern 5: Per-Platform Rate Limiting (Extends Existing RateLimiter)

**What:** Extend the existing `RateLimiter` (which uses Redis sorted-set sliding window) to support per-platform and per-API-key rate limiting, not just per-IP.

**When:** Every /api/v1/* request passes through rate limiting. Different platforms may have different rate tiers.

**Example:**

```typescript
// shared/infrastructure/middleware/platformRateLimit.ts

const PLATFORM_LIMITS: Record<string, { windowSeconds: number; maxRequests: number }> = {
  wordpress: { windowSeconds: 60, maxRequests: 60 },
  laravel:   { windowSeconds: 60, maxRequests: 60 },
  shopify:   { windowSeconds: 60, maxRequests: 120 },
  nextjs:    { windowSeconds: 60, maxRequests: 60 },
  default:   { windowSeconds: 60, maxRequests: 100 },  // existing D-08 limit
};

export class PlatformRateLimiter {
  /**
   * Check rate limit for a given platform and API key.
   * Uses the same Redis sorted-set sliding window as existing RateLimiter.
   * Key format: ratelimit:v2:{platform}:{api_key_hash}
   */
  static async check(
    platform: string,
    apiKey: string
  ): Promise<{ allowed: boolean; retryAfter: number; remaining: number }> {
    const limits = PLATFORM_LIMITS[platform] ?? PLATFORM_LIMITS.default;
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex").slice(0, 16);
    const key = `ratelimit:v2:${platform}:${keyHash}`;
    // ... same ZADD/ZREMRANGEBYSCORE/ZCARD pipeline as existing RateLimiter
  }
}
```

**Rationale:** The existing RateLimiter already implements the sorted-set sliding window pattern. Rather than replacing it, this extends the key scheme from `ratelimit:v1:{ip}` to `ratelimit:v2:{platform}:{api_key_hash}`. The v1 limiter stays active for non-authenticated endpoints; v2 handles SDK-authenticated requests.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Gateway SDK Calls from Business Logic

**What:** Calling Stripe or Paddle SDK methods directly from order processing or checkout handlers.

**Why bad:** Ties business logic to a specific gateway's API surface. Switching gateways means rewriting business logic. Testing requires mocking external SDKs throughout the codebase.

**Instead:** All gateway calls go through the `IPaymentGateway` interface. Business logic never imports `stripe` or `@paddle/paddle-node-sdk` directly. Only the adapter files import gateway SDKs.

### Anti-Pattern 2: Storing Plaintext API Tokens or HMAC Secrets

**What:** Storing the HMAC secret or API token in plaintext in the database.

**Why bad:** Database compromise exposes all request-signing secrets. Attackers can forge authenticated requests.

**Instead:** Store SHA-256 hashes of API tokens (existing pattern in `apiTokenHash`). For HMAC secrets, store them encrypted with a server-level encryption key (AES-256-GCM) in the database. The decryption happens at startup or per-request with the server's master key from environment variables.

### Anti-Pattern 3: Feature Flag Database Table (Over-Engineering)

**What:** Creating a separate `features` table, `plan_features` junction table, and `feature_overrides` table with full CRUD.

**Why bad:** The existing `productPlans.features` JSONB column already serves this purpose. A normalized feature schema adds JOINs, migrations, and admin UI complexity for a system with fewer than 50 features across 4 plans.

**Instead:** Use the existing JSONB column with the nested platform dimension pattern. Add admin UI that reads/writes the JSONB structure directly. Only migrate to a normalized schema if feature count exceeds 100 or if per-customer overrides are needed.

### Anti-Pattern 4: Monolithic Webhook Handler

**What:** A single webhook handler that switches on gateway type with deeply nested if/else blocks.

**Why bad:** Each gateway has different signature verification, event types, and payload formats. Mixing them creates unmaintainable spaghetti code.

**Instead:** Each gateway adapter implements `handleWebhook()` which returns a `NormalizedWebhookEvent`. The central webhook handler receives normalized events and dispatches to domain event publishers. Gateway-specific logic stays in adapters.

### Anti-Pattern 5: Including License Key in Download URLs

**What:** Passing the license key as a query parameter in the download URL: `/api/v1/update/download?license_key=CF-XXXX-XXXX`.

**Why bad:** License keys appear in server access logs, CDN logs, browser history, and HTTP referrer headers. This exposes sensitive credentials.

**Instead:** Generate a short-lived HMAC-signed download token that encodes `{ licenseId, version, expiresAt }`. The download endpoint verifies the token's HMAC signature, not the license key directly. Tokens expire in 15 minutes.

## Integration Points with Existing Bounded Contexts

### Update Delivery <-> Products (Existing)

```
Update Delivery reads:
  - products (by slug) -- to resolve product
  - productVersions (by productId) -- to get latest version, downloadUrl, changelog

No modifications to Products context needed.
ProductVersionRepository already exists and is reused.
```

### Update Delivery <-> Licensing (Existing)

```
Update Delivery reads:
  - licenses (by key) -- to verify license is active before serving update
  - licenseActivations (by licenseId + domain) -- to verify domain is activated

No modifications to Licensing context needed.
LicenseRepository and ActivationRepository already exist and are reused.
```

### Payment Gateways <-> Billing (Existing)

```
Payment Gateways publishes:
  - PaymentCompleted event (normalized)

Billing subscribes:
  - Existing OrderCompletedHandler processes the event
  - OR: PaymentCompleted triggers OrderCompleted via a bridge handler

The cleanest integration:
  PaymentCompleted handler in payments context ->
    calls OrderService.completeOrder(orderId, userId) ->
      OrderService publishes OrderCompleted event ->
        existing OrderCompletedHandler generates license
```

This means the payments context does NOT need to know about license generation. It completes orders, and the existing event pipeline handles the rest. This preserves the existing domain event flow without modification.

### Feature Flags <-> Licensing (Existing)

```
ValidateLicenseHandler (existing, modified):
  - After validation succeeds, look up ProductPlan.features
  - Apply platform dimension resolution
  - Include resolved features in response

Modification is minimal: add ~15 lines to the existing handler
to fetch plan features and include them in the response payload.
```

### HMAC Middleware <-> All API Routes (Cross-Cutting)

```
New shared middleware wraps all /api/v1/* routes.

Implementation approach:
  - NOT Next.js middleware (project uses proxy.ts, not middleware.ts)
  - Helper function called at the top of each route handler
  - Could be extracted into a withHmacAuth() wrapper

  export async function POST(request: NextRequest) {
    const auth = await verifyHmacSignature(request);
    if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });
    // ... existing route logic
  }

The validate route currently uses RateLimiter + body parsing.
HMAC verification goes BETWEEN rate limiting and body parsing
(because HMAC needs the raw body to verify signature).
```

## Database Schema Changes

### New Tables

```typescript
// Payment gateway configuration (stores API keys, webhook secrets, etc.)
export const paymentGateways = pgTable("payment_gateways", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(), // "stripe", "paddle", "bkash_api", "ssl_commerz"
  name: text("name").notNull(),         // Display name "Stripe (International)"
  config: jsonb("config").notNull(),    // Encrypted gateway-specific config
  active: boolean("active").default(true),
  sandbox: boolean("sandbox").default(false),
  priority: integer("priority").default(0), // Order of preference
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});
```

### Modified Tables

```typescript
// licenses table -- add HMAC signing secret
// Add column:
hmacSecret: text("hmac_secret"),  // AES-encrypted HMAC signing secret

// productPlans table -- features column already exists, no schema change needed
// The JSONB structure changes from flat to nested, but no migration required

// Extend paymentMethodEnum to include new gateways:
// Add to existing enum: "stripe", "paddle", "bkash_api"
```

## Build Order (Dependency Chain)

```
Phase 1: API Security Foundation (cross-cutting, blocks all SDK work)
├── HMAC middleware (verifyHmacSignature)
├── API key authentication (extend existing ApiTokenGenerator)
├── Add hmacSecret field to licenses table
├── Per-platform rate limiting (extend existing RateLimiter)
└── Apply to existing /api/v1/license/* routes

Phase 2: Update Delivery System (depends on Phase 1)
├── Update bounded context (domain entities, version resolver)
├── /api/v1/update/check endpoint (WordPress-compatible format)
├── /api/v1/update/download endpoint (signed download tokens)
├── ZIP file storage (local filesystem or S3)
├── Integration with existing ProductVersionRepository
└── Download analytics (events to analytics context)

Phase 3: License Status API + Feature Flags (depends on Phase 1)
├── GET /api/v1/license/status endpoint
├── Extend ValidateLicenseHandler to include features in response
├── Platform-dimension feature resolution (nested JSONB)
├── Admin UI for managing features per plan per platform
└── Feature gating in customer portal

Phase 4: Payment Gateway Abstraction (depends on Phase 3 partially)
├── PaymentGatewayInterface definition
├── PaymentGatewayFactory
├── paymentGateways table migration
├── ManualAdapter (wrap existing manual payment flow)
├── SslCommerzAdapter (wrap existing ssl-commerz.ts)
├── StripeAdapter (new: Checkout Sessions + Webhooks)
├── PaddleAdapter (new: Checkout + Webhooks + MoR)
├── BkashApiAdapter (new: automatic bKash API)
├── Normalized webhook handler
├── PaymentCompleted -> OrderService.completeOrder bridge
└── Admin UI for gateway management

Phase 5: Platform SDKs (depends on Phases 1-3)
├── WordPress SDK (PHP: license helpers + auto-update hooks)
├── Laravel SDK (Composer: ServiceProvider + middleware + Artisan)
├── Shopify Integration (App scaffold + Billing API sync)
└── Next.js SDK (npm: useLicense hook + middleware helpers)
```

**Phase ordering rationale:**
- Phase 1 (API Security) must come first because all SDKs depend on HMAC signing. Without it, SDK endpoints are unauthenticated.
- Phase 2 (Update Delivery) and Phase 3 (Status API + Feature Flags) are parallel after Phase 1. Both are required before SDK work.
- Phase 4 (Payment Gateways) can proceed in parallel with Phases 2-3 since it integrates with the billing context via events (no direct dependency on update/status APIs).
- Phase 5 (SDKs) comes last because SDKs are thin wrappers around the APIs built in Phases 1-3.

## Scalability Considerations

| Concern | At 500 licenses | At 10K licenses | At 100K licenses |
|---------|-----------------|-----------------|------------------|
| Update check API | Direct DB query per check | Redis cache for latest version per product (key: `update:latest:{productSlug}`) | CDN-cached version info, signed download URLs offloaded to S3 presigned URLs |
| Feature flag resolution | Read from DB on each validate (plan features rarely change) | Cache resolved features per plan in Redis (key: `features:{planId}:{platform}`) | Cache at edge, invalidate on plan update |
| HMAC verification | In-process crypto (sub-ms) | Same -- crypto is fast | Same -- no scaling concern |
| Webhook processing | Sequential processing | BullMQ queue for webhook normalization | Multiple webhook workers, idempotency key on providerEventId |
| Rate limiting | Redis sorted set per key | Same (Redis handles this efficiently) | Redis Cluster for sharding |
| ZIP file downloads | Local filesystem | S3 / object storage | CDN-backed S3 with presigned URLs |

## Architecture Decision Records

### ADR-5: Payment Context as Separate Bounded Context

**Decision:** Create a new `payments` bounded context rather than adding gateway logic to the existing `billing` context.

**Context:** The billing context currently handles order lifecycle and payment method tracking. Adding Stripe, Paddle, and bKash API adapters directly into billing would bloat it with external SDK dependencies and gateway-specific webhook handling.

**Consequence:** The payments context owns gateway adapters and normalized webhook processing. It communicates with billing via domain events (PaymentCompleted). The billing context remains focused on order lifecycle. This mirrors the existing pattern where billing communicates with licensing via OrderCompleted events.

### ADR-6: HMAC Secret Per License (Not Global)

**Decision:** Generate a unique HMAC signing secret per license rather than using a global server secret.

**Context:** A global HMAC secret means compromising one secret exposes all API communications. Per-license secrets limit blast radius. The existing pattern of per-license API tokens (`cf_live_xxx`) provides precedent.

**Consequence:** Each license record stores an encrypted HMAC secret alongside the API token hash. SDK configuration includes both the API token and HMAC secret. Key rotation is per-license. Adds one column to the licenses table.

### ADR-7: JSONB Feature Flags Over Normalized Tables

**Decision:** Use the existing `productPlans.features` JSONB column with nested platform dimensions rather than creating a normalized feature_flags + plan_features schema.

**Context:** ConversionFlow has 4 products with 3-4 plans each (12-16 plan records total). Each plan has approximately 10-20 features. A normalized schema (features table + plan_features junction) adds JOINs and admin complexity for a dataset of ~200 feature rows.

**Consequence:** Feature definitions are managed as a JSONB document per plan. Admin UI reads and writes the JSONB directly. Platform-specific features use nested objects. If feature count grows beyond 50 per plan or per-customer overrides are needed, migrate to normalized tables at that point.

### ADR-8: Update Context Reads Existing Repositories (No New Tables)

**Decision:** The update delivery system reads from existing `productVersions` and `products` tables via existing repositories. No new database tables for version tracking.

**Context:** `productVersions` already has `version`, `downloadUrl`, `changelog`, `status` (stable/beta/draft), and `releasedAt`. The update check endpoint only needs to find the latest stable version for a product -- a query already supported by `ProductVersionRepository`.

**Consequence:** The update bounded context is read-only against the products context's data. ZIP file storage is filesystem/S3 only (not tracked in DB separately). Download tracking uses the existing `downloads` table with a signed download token. Minimal new code, maximum reuse.

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Payment gateway abstraction | HIGH | Strategy + Factory pattern is well-established. Training data covers Stripe and Paddle SDK patterns extensively. Existing billing context provides clear integration point. |
| HMAC API security | HIGH | Node.js crypto module is well-documented. Existing ApiTokenGenerator and RateLimiter demonstrate the team's security patterns. Canonical string signing is standard. |
| Update delivery (WordPress format) | HIGH | WordPress transient format is well-documented and stable. ProductVersions table already has all needed fields. |
| Feature flag resolution | HIGH | JSONB features column already exists. Resolution logic is straightforward. Platform dimension is a clean extension. |
| Per-platform rate limiting | HIGH | Existing RateLimiter already implements Redis sorted-set sliding window. Extension to per-platform keys is trivial. |
| Shopify Billing API integration | MEDIUM | Shopify's Billing API has specific requirements (OAuth, App Bridge, mandatory GDPR webhooks). Training data covers these but verification against current Shopify API version is recommended during implementation. |
| bKash Automatic API | MEDIUM | bKash's merchant API documentation is not as readily available as Stripe/Paddle. The existing `bkash-payment` npm package may provide patterns but the actual API behavior should be verified. |
| SDK package distribution | MEDIUM | PHP (Composer) and npm package structures are standard. Shopify app scaffold follows Shopify's documented patterns. Each SDK is primarily a thin API client calling /api/v1/* endpoints. |

## Gaps Requiring Phase-Specific Research

1. **Stripe API version compatibility** -- Verify which Stripe API version to target and what specific Checkout Session parameters are needed for one-time payments vs subscriptions.
2. **Paddle Billing API specifics** -- Paddle's MoR model has unique requirements for pricing catalogs, tax handling, and checkout. Verify against current Paddle documentation.
3. **bKash Automatic API merchant onboarding** -- Confirm API credentials process and token lifecycle management for bKash's merchant API.
4. **Shopify mandatory webhooks** -- Shopify requires handling GDPR webhooks (`customers/data_request`, `customers/redact`, `shop/redact`). These must be implemented regardless of billing integration.
5. **ZIP file integrity verification** -- Whether to add SHA-256 checksums to the download response for SDK-side verification.
6. **HMAC secret encryption at rest** -- Decide between AES-256-GCM with server key vs simpler approach of storing HMAC secret as SHA-256 hash with a known-plaintext recovery mechanism.

## Sources

- **Existing codebase analysis** -- src/lib/db/schema.ts, src/modules/* (all bounded contexts), src/shared/infrastructure/eventBus/*, src/app/api/v1/license/validate/route.ts -- HIGH confidence (direct code analysis)
- **WordPress Plugin Update API** -- WordPress developer documentation on `pre_set_site_transient_update_plugins` hook and transient format -- HIGH confidence (well-documented, stable API)
- **Node.js Crypto Module** -- Official Node.js documentation for HMAC-SHA256, timingSafeEqual, createHash -- HIGH confidence
- **Stripe Node.js SDK** -- stripe npm package patterns for Checkout Sessions and Webhook handling -- HIGH confidence (training data, well-established SDK)
- **Paddle Node.js SDK** -- @paddle/paddle-node-sdk patterns for MoR billing -- MEDIUM confidence (training data, Paddle API has evolved)
- **Payment Gateway Abstraction Pattern** -- Strategy + Factory pattern for multi-gateway -- HIGH confidence (standard GoF pattern, widely implemented)
- **Feature Flag Storage in JSONB** -- PostgreSQL JSONB capabilities for nested feature maps -- HIGH confidence (standard PostgreSQL feature)
- **Redis Sorted Set Sliding Window** -- Rate limiting algorithm already implemented in existing RateLimiter.ts -- HIGH confidence (verified in codebase)

---
*Architecture research for: ConversionFlow v4.0 Multi-Platform License Server*
*Researched: 2026-06-09*
