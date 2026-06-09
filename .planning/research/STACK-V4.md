# Technology Stack - v4.0 Multi-Platform Additions

**Project:** ConversionFlow v4.0 Multi-Platform License Server
**Researched:** 2026-06-09
**Scope:** NEW dependencies only. Existing stack (Next.js 16, Drizzle ORM, Better Auth, BullMQ, Redis, PostgreSQL) is validated and NOT re-researched.
**Predecessor:** See `STACK.md` for v2.0 base stack, `STACK-LICENSING.md` for v3.0 licensing stack.

---

## Recommended Additions

### Payment Gateways

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `stripe` | 22.2.0 | International card payments, subscriptions | Official SDK, zero runtime deps, TypeScript-native, Checkout Sessions + Webhooks + Subscriptions + Customer Portal. Pinned API version 2026-05-27.dahlia. Confirmed from npm registry. |
| `@paddle/paddle-node-sdk` | 3.8.0 | Merchant of Record for international sales | Paddle handles tax, compliance, invoicing globally. SDK supports Billing API with transactions, subscriptions, customers, prices, notifications (webhooks). Node >=20 required. Confirmed from npm registry. |

### Shopify Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@shopify/shopify-api` | 13.0.0 | Core Shopify API library | Auth (OAuth), REST/GraphQL clients, webhook registry. Official, TypeScript, supports App Bridge auth flow. Node >=20. Confirmed from npm registry. |
| `@shopify/shopify-app-session-storage-drizzle` | 4.0.0 | Shopify session storage via existing Drizzle ORM | Reuses existing PostgreSQL + Drizzle infrastructure. No new database adapter needed. Peer-depends on `drizzle-orm ^0.44.7` (we have 0.45.2) and `@shopify/shopify-api ^13.0.0`. Confirmed from npm registry. |

**Important:** Do NOT install `@shopify/shopify-app-remix` (4.2.0) or `@shopify/shopify-app-react-router` (1.2.0). These are full app scaffolds designed for Remix or React Router apps. Since ConversionFlow is a Next.js 16 application, we only need the core API library (`@shopify/shopify-api`) and build our own auth flow using its primitives. The Shopify integration here is a webhook + billing sync backend, not a full embedded Shopify app UI.

### File Storage and Update Delivery

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `archiver` | 8.0.0 | Server-side ZIP file creation for update packages | Streaming interface, creates ZIPs from buffers/streams without temp files. Needed for packaging product versions into downloadable ZIPs. ESM-only, Node >=18. Confirmed from npm registry. |

**What NOT to add for file storage:** No `extract-zip` (only needed client-side for uploads, not for serving downloads). No `jszip` (browser-oriented, archiver is better for server-side streaming). No S3 SDK -- self-hosted deployment means local filesystem storage is correct. If storage needs grow, add a `storage/` abstraction layer later; do not over-engineer now.

### Rate Limiting Enhancement

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `rate-limiter-flexible` | 11.2.0 | Per-platform, per-key rate limiting for API v1 | The existing Redis sorted-set rate limiter works but is IP-only. For multi-platform SDKs, we need per-license-key and per-platform-type limits. This library supports Redis (ioredis), has built-in backoff, burst handling, and Drizzle integration. Battle-tested in production by many SaaS platforms. Confirmed from npm registry. |

**Integration note:** Keep the existing `RateLimiter` adapter for IP-based limits. Add `rate-limiter-flexible` as a second layer for per-platform and per-license-key limits in the new HMAC-secured endpoints. The two coexist: IP limit is the outer gate, platform/key limit is the inner gate.

### HMAC and API Security (No new packages needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js `crypto` (built-in) | N/A | HMAC-SHA256 request signing | Node.js built-in `crypto.createHmac()` is sufficient. No library needed for HMAC signing. The SDK clients (PHP, JS) use their platform's native HMAC implementations. |
| `@types/node` | already installed | TypeScript types for crypto | Already in devDependencies. No addition needed. |

**Rationale against alternatives:** No need for `jsonwebtoken` (HMAC is not JWT). No need for `crypto-js` (Node built-in crypto is faster and already available). The signing scheme: client computes `HMAC-SHA256(timestamp + method + path + body, secret)`, server validates within a 5-minute timestamp window.

### Feature Flags (No new packages needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Existing `productPlans.features` JSONB column | N/A | Feature flag storage per plan | Already exists in schema.ts as `features: jsonb("features").$type<Record<string, boolean>>().default({})`. No new table or library needed. Extend with platform-specific keys. |
| Existing `licenses` table | N/A | Runtime feature resolution | Join license -> plan -> features at validation time. Already cached in Redis by ValidateLicenseHandler. |

**Rationale against alternatives:** No LaunchDarkly, Unleash, or similar. These are for dynamic feature flags across deployments. ConversionFlow needs static per-plan features that change only when an admin edits a plan. The existing JSONB column + Redis cache is the correct approach. Adding a separate feature flags service would be over-engineering.

### bKash Automatic API (No new packages needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `ioredis` (already installed) | 5.10.1 | Cache bKash OAuth tokens | bKash tokenized checkout API uses OAuth tokens that expire. Cache in existing Redis. |
| Node.js `fetch` (built-in) | N/A | HTTP client for bKash API calls | bKash uses simple REST APIs (grant token, create payment, execute payment). No SDK exists. Use native fetch with typed request/response interfaces. |

**Rationale:** bKash does not provide an official npm SDK. Community packages like `bkash-api` are unmaintained and thin wrappers around HTTP calls. Since bKash's tokenized checkout API is simple (4 endpoints: grant token, create, execute, query), a typed service class with native fetch is more reliable than an unmaintained third-party wrapper. The existing `ioredis` handles token caching.

**bKash API endpoints (tokenized checkout v1.2.0-beta):**
- `POST /tokenized/checkout/token/grant` -- get access token
- `POST /tokenized/checkout/create` -- create payment
- `POST /tokenized/checkout/execute` -- execute payment
- `POST /tokenized/checkout/query` -- query payment status
- Base URL: `https://tokenized.pay.bka.sh/v1.2.0-beta/`

**bKash limitation:** No native recurring payments. Subscription billing via bKash requires storing payment tokens and re-initiating charges on schedule via BullMQ. This is a known limitation documented in the milestone scope.

---

## Installation

```bash
# Payment gateways
pnpm add stripe @paddle/paddle-node-sdk

# Shopify integration (core API + Drizzle session storage only)
pnpm add @shopify/shopify-api @shopify/shopify-app-session-storage-drizzle

# File storage for update delivery
pnpm add archiver

# Enhanced rate limiting
pnpm add rate-limiter-flexible

# Dev types (if not already present)
pnpm add -D @types/archiver
```

**Total new production dependencies:** 6 packages
**Total new dev dependencies:** 1 package (@types/archiver, if needed -- archiver 8.x may include its own types)

---

## What NOT to Add

| Rejected Package | Category | Why Not |
|------------------|----------|---------|
| `@shopify/shopify-app-remix` | Shopify | Full Remix app scaffold. We are Next.js 16, not Remix. Only need core API primitives. |
| `@shopify/shopify-app-react-router` | Shopify | Same reason -- full app scaffold for React Router apps. |
| `@shopify/polaris` | Shopify UI | Only needed if building an embedded Shopify admin UI. We are building a backend billing sync, not an embedded app. |
| `jszip` | ZIP handling | Browser-oriented. `archiver` is the correct server-side streaming choice. |
| `extract-zip` | ZIP handling | Only needed for uploading/extracting ZIPs. Not needed for serving downloads. Can add later if admin ZIP upload is needed. |
| `crypto-js` | HMAC signing | Node.js built-in `crypto` module is sufficient and faster. |
| `jsonwebtoken` | API auth | HMAC signing is not JWT. API keys are verified via database lookup + HMAC signature, not JWT tokens. |
| `launchdarkly` / `unleash-client` | Feature flags | Dynamic flag services are overkill. Static per-plan JSONB features + Redis cache handles the use case. |
| `bkash-api` / any bKash npm package | bKash payments | Unmaintained community wrappers around simple REST calls. Native fetch with typed interfaces is more reliable. |
| `aws-sdk` / `@aws-sdk/client-s3` | File storage | Self-hosted deployment. Local filesystem is correct. Can abstract later if storage needs change. |
| `multer` / `formidable` | File upload | Next.js 16 App Router handles file uploads natively via `request.formData()`. No middleware needed. |
| `uuid` | ID generation | Already using `uuid` via Drizzle's `uuid()` for DB primary keys. For non-DB IDs, `nanoid` (already installed) is the right tool. |

---

## Version Compatibility Matrix

| New Package | Requires Node | Compatible with Existing? | Notes |
|-------------|---------------|---------------------------|-------|
| `stripe` 22.2.0 | >=18 | YES | Zero runtime deps. No conflict risk. |
| `@paddle/paddle-node-sdk` 3.8.0 | >=20 | YES | Zero runtime deps. Node 20+ required (project targets Node 20+ based on Next.js 16 requirements). |
| `@shopify/shopify-api` 13.0.0 | >=20 | YES | Deps: jose, isbot, tslib. No overlap conflicts. |
| `@shopify/shopify-app-session-storage-drizzle` 4.0.0 | >=20 | YES | Peer-dep: `drizzle-orm ^0.44.7` (we have 0.45.2). Peer-dep: `@shopify/shopify-api ^13.0.0`. |
| `archiver` 8.0.0 | >=18 | YES | ESM-only. Next.js 16 handles ESM natively. |
| `rate-limiter-flexible` 11.2.0 | any | YES | Has `ioredis` as devDep only. Works with our existing `ioredis 5.10.1` at runtime. |

---

## Database Schema Changes Required

No new tables for feature flags or HMAC (existing schema supports these). The following additions are needed:

### New Enums

```typescript
// Add to paymentMethodEnum values:
"stripe", "paddle", "bkash_api"

// New platform enum:
export const platformEnum = pgEnum("platform", [
  "wordpress",
  "laravel",
  "shopify",
  "nextjs",
]);
```

### New Tables

```typescript
// Shopify shop installations (for billing sync)
export const shopifyInstallations = pgTable("shopify_installations", {
  id: uuid("id").defaultRandom().primaryKey(),
  shopDomain: text("shop_domain").notNull().unique(),
  accessToken: text("access_token").notNull(), // encrypted at rest
  scope: text("scope"),
  licenseId: uuid("license_id").references(() => licenses.id),
  installedAt: timestamp("installed_at").notNull().defaultNow(),
  uninstalledAt: timestamp("uninstalled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API keys for HMAC signing (per-platform, per-license)
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  keyPrefix: text("key_prefix").notNull(),    // "cf_live_" or "cf_test_"
  keyHash: text("key_hash").notNull(),         // SHA-256 hash of full API key
  licenseId: uuid("license_id").references(() => licenses.id),
  platform: platformEnum("platform").notNull(),
  name: text("name"),                          // user-friendly label
  permissions: jsonb("permissions").$type<string[]>().default(["read"]),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// Product files (ZIP storage for update delivery)
export const productFiles = pgTable("product_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  versionId: uuid("version_id").references(() => productVersions.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),       // local filesystem path
  fileSize: integer("file_size"),
  checksum: text("checksum"),                  // SHA-256 for integrity verification
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
```

### Schema Modifications to Existing Tables

```typescript
// products table -- add platform support
+ platforms: jsonb("platforms").$type<string[]>().default(["wordpress"]),

// productPlans table -- extend features to be platform-aware
// Change features from Record<string, boolean> to a richer structure:
features: jsonb("features").$type<{
  global: Record<string, boolean>;
  wordpress?: Record<string, boolean>;
  laravel?: Record<string, boolean>;
  shopify?: Record<string, boolean>;
  nextjs?: Record<string, boolean>;
}>().default({ global: {} }),

// licenses table -- add platform and HMAC secret
+ platform: platformEnum("platform").default("wordpress"),
+ hmacSecret: text("hmac_secret"),  // per-license signing secret
+ apiKeyId: uuid("api_key_id").references(() => apiKeys.id),
```

---

## Architecture Integration Points

### Where New Code Lives

```
src/modules/
  billing/
    application/
      services/
        StripeGatewayService.ts      # Stripe Checkout + Webhooks
        PaddleGatewayService.ts      # Paddle Billing + Webhooks
        BkashApiService.ts           # bKash tokenized checkout
        GatewayFactory.ts            # Abstract gateway interface
    domain/
      events/
        PaymentEvents.ts             # New payment event types
    infrastructure/
      webhooks/
        stripe.ts                    # Stripe webhook handler
        paddle.ts                    # Paddle webhook handler

  licensing/
    application/
      services/
        UpdateService.ts             # Update check + download logic
        FeatureFlagService.ts        # Plan feature resolution
        HmacService.ts               # HMAC signing/verification
    infrastructure/
      adapters/
        PlatformRateLimiter.ts       # Per-platform rate limits via rate-limiter-flexible
      storage/
        FileStorageService.ts        # Local filesystem ZIP management

  shopify/                           # NEW bounded context
    application/
      services/
        ShopifyAuthService.ts        # OAuth + session management
        ShopifyBillingSync.ts        # Billing API <-> CF license sync
      handlers/
        WebhookHandler.ts            # install/uninstall/billing webhooks
    domain/
      entities/
        ShopifyInstallation.ts
    infrastructure/
      repositories/
        ShopifySessionRepository.ts  # Via @shopify/shopify-app-session-storage-drizzle
```

### New API Routes

```
src/app/api/v1/
  update/
    check/route.ts                   # GET  -- WordPress-compatible update check
    download/route.ts                # GET  -- Authenticated ZIP download
  license/
    status/route.ts                  # GET  -- Full license info + features
  # Existing routes get HMAC support via middleware wrapper

src/app/api/webhooks/
  stripe/route.ts                    # POST -- Stripe webhook endpoint
  paddle/route.ts                    # POST -- Paddle webhook endpoint
  shopify/route.ts                   # POST -- Shopify webhook endpoint

src/app/api/v1/payments/
  bkash/
    create/route.ts                  # POST -- Create bKash payment
    callback/route.ts                # POST -- bKash payment callback
    status/route.ts                  # GET  -- Check payment status
  stripe/
    checkout/route.ts                # POST -- Create Stripe checkout session
    success/route.ts                 # GET  -- Redirect after success
  paddle/
    checkout/route.ts                # POST -- Create Paddle checkout
```

---

## SDK Output Targets (NOT installed in main project)

These are separate repositories/packages published independently:

| SDK | Format | Registry | Build Tool |
|-----|--------|----------|------------|
| WordPress/PHP SDK | Composer package (`conversionflow/sdk-php`) | Packagist | PHP 7.4+, no build step |
| Laravel SDK | Composer package (`conversionflow/laravel`) | Packagist | PHP 8.1+, Laravel auto-discovery |
| Shopify Integration | Part of ConversionFlow server | N/A | Built into main app |
| Next.js SDK | npm package (`@conversionflow/license-sdk`) | npm | tsup or tsdx for bundle |

These SDKs are CONSUMERS of the API, not part of the server codebase. They call the `/api/v1/*` endpoints. The server only needs the API routes; the SDKs are developed as separate projects.

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Stripe integration | HIGH | Official SDK v22.2.0 confirmed from npm registry. Well-documented API. |
| Paddle integration | HIGH | Official SDK v3.8.0 confirmed from npm registry. Changelog reviewed through 3.8.0. |
| bKash API | MEDIUM | API endpoints from training data only. No official SDK. Tokenized checkout v1.2.0-beta is the assumed current version. Verify exact endpoint URLs against bKash developer portal before implementation. |
| Shopify integration | HIGH | Official packages v13.0.0 + v4.0.0 confirmed from npm registry. Drizzle session storage compatibility verified. |
| File storage / ZIP | HIGH | `archiver` v8.0.0 confirmed. Simple, well-maintained library. |
| Rate limiting | HIGH | `rate-limiter-flexible` v11.2.0 confirmed. Has ioredis support. Battle-tested. |
| HMAC signing | HIGH | Node.js built-in crypto. No dependency risk. Standard pattern. |
| Feature flags | HIGH | Existing JSONB column confirmed in schema.ts. No new infrastructure needed. |
| Database schema changes | HIGH | Based on direct read of existing schema.ts. All modifications are additive. |

---

## Sources

- Stripe npm registry: https://registry.npmjs.org/stripe/latest (v22.2.0, 2026-05-27)
- Stripe changelog: https://raw.githubusercontent.com/stripe/stripe-node/master/CHANGELOG.md
- Paddle npm registry: https://registry.npmjs.org/@paddle/paddle-node-sdk/latest (v3.8.0, 2026-04-20)
- Paddle changelog: https://raw.githubusercontent.com/PaddleHQ/paddle-node-sdk/main/CHANGELOG.md
- Shopify API npm registry: https://registry.npmjs.org/@shopify/shopify-api/latest (v13.0.0)
- Shopify Drizzle storage npm registry: https://registry.npmjs.org/@shopify/shopify-app-session-storage-drizzle/latest (v4.0.0)
- archiver npm registry: https://registry.npmjs.org/archiver/latest (v8.0.0)
- rate-limiter-flexible npm registry: https://registry.npmjs.org/rate-limiter-flexible/latest (v11.2.0)
- bKash API: Training data only (tokenized checkout v1.2.0-beta endpoints) -- MEDIUM confidence, verify before implementation
- Existing codebase: Direct file reads of schema.ts, validate route, RateLimiter adapter, billing events, package.json
