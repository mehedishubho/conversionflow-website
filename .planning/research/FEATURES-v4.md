# Feature Landscape: v4.0 Multi-Platform License Server & SDK Distribution

**Domain:** Multi-platform licensing SaaS with platform SDKs, update delivery, multi-gateway payments, feature flags, and API security
**Researched:** 2026-06-09
**Scope:** v4.0 NEW features only. All v3.0 features (license generation, validation, activation, products, plans, analytics, backup) are already shipped.
**Overall confidence:** MEDIUM (web search rate-limited; based on training data + codebase analysis + existing research. Key technical patterns are well-established.)

## Executive Summary

ConversionFlow v4.0 transforms the platform from a WordPress-only licensing system into a multi-platform license server. The feature landscape breaks into four categories: (1) **Update Delivery** is table-stakes -- every commercial WordPress plugin needs it and the codebase already has `productVersions` and `downloads` tables. (2) **Platform SDKs** (WordPress, Laravel, Shopify, Next.js) are differentiators -- most license servers only serve one platform; four-platform coverage is rare. (3) **Multi-gateway payments** are table-stakes for international expansion -- Stripe and Paddle are must-haves. (4) **Feature flags per tier** are a differentiator that enables per-platform feature control without separate products.

The critical dependency chain is: Update Delivery (Phase 32) must ship before WordPress SDK (Phase 35), because the SDK wraps the update check API. Feature Flags (Phase 33) must ship before all SDKs, because each SDK needs to return feature entitlements. Multi-gateway payments (Phase 34) can run in parallel with SDKs but must complete before Shopify integration (Phase 37), because Shopify Billing API sync depends on the gateway abstraction layer.

## Table Stakes

Features customers and platform partners expect. Missing = product feels incomplete or non-functional.

| Feature | Why Expected | Complexity | Depends On (Existing) | Notes |
|---------|--------------|------------|----------------------|-------|
| **Update Check API** (`/api/v1/update/check`) | WordPress plugins must auto-update; without it, customers cannot receive patches | Medium | `productVersions` table, `products.currentVersion` | Must return WordPress-compatible response format (slug, new_version, package URL, requires, tested) |
| **Authenticated Download** (`/api/v1/update/download`) | Secure ZIP delivery tied to valid license; prevents unauthorized distribution | Medium | `downloads` table with `downloadToken` + `expiresAt` | Time-limited signed URLs; token consumed on download |
| **License Status API** (`GET /api/v1/license/status`) | SDKs need full license info beyond simple valid/invalid | Low | Existing `/validate` endpoint pattern | Returns: status, plan, features, activations, expiry, product version |
| **Feature Flags in Validate Response** | SDKs need to know which features their plan allows | Medium | `productPlans.features` JSONB field already exists in schema | Extend validate response with `features` map from plan |
| **Stripe Integration** | International customers expect card payments; de facto standard | High | Existing order + billing module, event bus | Checkout Sessions + Webhooks + Customer Portal for self-service |
| **Paddle Integration** | Handles tax/compliance for global sales as Merchant of Record | High | Gateway abstraction layer (new) | Essential for selling outside Bangladesh without BD tax entity |
| **bKash Automatic API** | BD market dominant payment method; manual-only is friction | Medium | Existing `paymentAccounts` table, manual bKash pattern | Tokenized Checkout API (v1.2.0-beta); grant token, create payment, execute, callback |
| **WordPress SDK License Activation** | Plugin must activate license on the customer's site | Medium | Existing `/api/v1/license/activate` endpoint | PHP HTTP client calling ConversionFlow API |
| **WordPress SDK Auto-Update** | Plugin must receive updates from ConversionFlow server | Medium | Update Check API (Phase 32) | Uses `pre_set_site_transient_update_plugins` filter + `plugins_api` filter |
| **HMAC Request Signing** | API must authenticate SDK requests without exposing secrets | Medium | Existing RateLimiter, API token auth | AWS Signature V4-style: sign method + path + body + timestamp |
| **Rate Limiting per Platform** | Different platforms have different usage patterns; prevent abuse | Low | Existing `RateLimiter` class (Redis sorted-set) | Extend with platform dimension: `ratelimit:wp:`, `ratelimit:laravel:`, etc. |

## Differentiators

Features that set ConversionFlow apart from typical license servers. Not expected by default, but highly valued.

| Feature | Value Proposition | Complexity | Depends On | Notes |
|---------|-------------------|------------|------------|-------|
| **4-Platform SDK Coverage** (WP + Laravel + Shopify + Next.js) | Most license servers serve one platform; covering 4 is rare and attracts multi-platform developers | High | All API endpoints, feature flags, update delivery | Each SDK is a native idiomatic package: PHP (Composer), PHP (Composer), JS (npm), JS (npm) |
| **Platform-Specific Feature Sets** | Same product, different features per platform (e.g., WP has auto-update, Laravel has middleware, Shopify has billing sync) | Medium | Feature flags per plan | Add `platform` dimension to feature definitions: `{ "wp": { "auto_update": true }, "laravel": { "middleware": true } }` |
| **WordPress Admin Settings Page Helper** | SDK provides ready-made license key input UI for WP admin | Medium | WordPress SDK core | PHP class that renders settings page, handles activation/deactivation via AJAX |
| **Laravel Artisan Commands** | `php artisan license:activate`, `license:check`, `license:deactivate` | Low | Laravel SDK ServiceProvider | Standard Laravel console command pattern |
| **Laravel License Middleware** | Route middleware that checks license validity before allowing access | Medium | License Status API | Returns 403 or configurable response when invalid |
| **Shopify Billing API Sync** | Maps Shopify subscription charges to ConversionFlow licenses automatically | High | Shopify API access, gateway abstraction | `appSubscriptionCreate` -> CF license creation, `APP_UNINSTALLED` -> CF license suspension |
| **Shopify App Bridge Auth** | Seamless authentication within Shopify admin using JWT session tokens | High | Shopify Partner account, app registration | Reduces friction -- merchants never leave Shopify admin |
| **Next.js useLicense() Hook** | React hook that manages license state, caching, and auto-refresh | Medium | Next.js SDK core | `const { valid, loading, features, error } = useLicense({ key, domain })` |
| **Next.js proxy.ts Helper** | Route protection in `proxy.ts` (not middleware.ts per project rules) | Low | HMAC signing, License Status API | Server-side license check before rendering protected routes |
| **Gateway Abstraction Layer** | Common interface for all payment gateways; add new ones without touching business logic | Medium | Existing order + event system | Interface: `createSession()`, `handleWebhook()`, `verifyPayment()`, `refundPayment()` |
| **Admin UI for Multi-Gateway Management** | Configure Stripe/Paddle/bKash from admin settings; enable/disable per gateway | Medium | Gateway abstraction | Per-gateway settings: API keys, sandbox mode, webhooks status |
| **Feature Flag Admin UI** | Visual editor for managing features per plan per product per platform | Medium | `productPlans.features` JSONB | Grid UI: plans as rows, features as columns, checkboxes; platform tabs |
| **Version Changelog Display** | Show what changed in each version during update check | Low | `productVersions.changelog` field | Markdown changelog rendered in WordPress plugin details popup |
| **Download Analytics** | Track which versions are downloaded, by whom, how often | Low | `downloads` table | Extend with platform dimension and aggregation queries |

## Anti-Features

Features to explicitly NOT build in v4.0.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Building the actual WordPress/Laravel/Shopify products** | Out of scope -- ConversionFlow is the license server, not the product | Build SDKs that OTHER products use; let plugin/app developers use the SDK |
| **Custom WordPress plugin update checker library** | Reinventing the wheel; `plugin-update-checker` by YahnisElsts is battle-tested (50K+ installs) | Bundle `plugin-update-checker` in the SDK or use its API format directly |
| **Shopify OAuth flow from scratch** | Complex, error-prone, Shopify provides `@shopify/shopify-api` library | Use `@shopify/shopify-api` Node.js package for auth, webhooks, billing |
| **Offline cryptographic license validation** | Extreme complexity for v4.0; online validation is sufficient | Cache validation results for 12-72 hours; require periodic online checks |
| **Real-time WebSocket license sync** | Over-engineering for current scale; webhooks are sufficient | Use polling from SDKs (every 12h) + webhook push for admin-initiated changes |
| **Multi-tenant support** | Single-instance platform for Devsroom only | Hardcode single-tenant assumptions; no tenant isolation needed |
| **Usage-based / metered billing** | Current pricing is one-time payment, not usage-based | Support recurring subscriptions only; defer metered billing |
| **SDK for mobile platforms** (React Native, Flutter, iOS, Android) | Not in scope; no mobile products planned | Focus on web platforms: WP, Laravel, Shopify, Next.js |
| **Marketplace integrations** (Envato, CodeCanyon, Gumroad) | Premature optimization; current sales are direct | Direct sales only; can add marketplace sync in v5.0 |
| **License key format per platform** | Unnecessary complexity; one format works across all platforms | Keep CF-XXXX-XXXX-XXXX-XXXX format universal; platform is metadata on the license record |

## Feature Dependencies

```
Phase 32: Update Delivery System
  /api/v1/update/check ─── depends on ──> productVersions table (exists)
  /api/v1/update/download ── depends on ──> downloads table (exists), authenticated ZIP storage
  /api/v1/license/status ── depends on ──> licenses table (exists), license validate handler (exists)

Phase 33: Feature Flags & Tier Enforcement
  Feature definitions per plan ── depends on ──> productPlans.features JSONB (exists)
  Validate returns features ── depends on ──> Phase 32 license/status endpoint
  Admin UI for features ── depends on ──> productPlans table (exists)
  Platform-specific features ── depends on ──> Feature definitions + platform enum (new)

Phase 34: Multi-Gateway Payments
  Gateway abstraction ── depends on ──> Existing billing module, event bus
  Stripe ── depends on ──> Gateway abstraction
  Paddle ── depends on ──> Gateway abstraction
  bKash API ── depends on ──> Gateway abstraction, existing bKash manual pattern
  Admin UI ── depends on ──> settings table (exists), paymentAccounts table (exists)

Phase 35: WordPress SDK
  License activation ── depends on ──> Phase 32 + 33 (update check + feature flags)
  Auto-update hooks ── depends on ──> Phase 32 update check endpoint
  Admin settings page ── depends on ──> License activation/deactivation
  Composer package ── depends on ──> All SDK components

Phase 36: Laravel SDK
  ServiceProvider + Facade ── depends on ──> Phase 33 (feature flags in validate response)
  License middleware ── depends on ──> License Status API (Phase 32)
  Artisan commands ── depends on ──> License activation/deactivation endpoints (exist)
  Composer package ── depends on ──> All SDK components

Phase 37: Shopify Integration
  App Bridge auth ── depends on ──> Shopify Partner account + API credentials
  Billing API sync ── depends on ──> Phase 34 (gateway abstraction + Stripe pattern)
  Webhook handlers ── depends on ──> Phase 34 (webhook verification pattern)
  Installation flow ── depends on ──> App Bridge auth + Billing API sync

Phase 38: Next.js SDK & API Security
  useLicense hook ── depends on ──> Phase 33 (feature flags in validate response)
  proxy.ts helper ── depends on ──> HMAC signing
  HMAC signing ── depends on ──> API key auth standardization
  Rate limiting per platform ── depends on ──> Existing RateLimiter (exists)
```

### Critical Dependency Chain

```
Phase 32 (Update Delivery) ── MUST complete before ──> Phase 35 (WP SDK auto-update)
Phase 33 (Feature Flags) ── MUST complete before ──> All SDKs (35, 36, 37, 38)
Phase 34 (Payments) ── MUST complete before ──> Phase 37 (Shopify Billing sync)
Phase 34 (Gateway Abstraction) ── can run parallel with ──> Phases 35, 36
Phase 38 (HMAC Security) ── SHOULD complete before SDKs are published
```

## Detailed Feature Analysis by Category

### 1. Update Delivery System (Phase 32)

**What it is:** Server-side endpoints that enable WordPress (and other) plugins to check for updates and download new versions.

**Why table-stakes:** Every commercial WordPress plugin needs auto-updates. Without it, customers must manually download and install updates, which is unacceptable for paid software.

**Existing foundation:**
- `productVersions` table: `id, productId, version, downloadUrl, changelog, status, releasedAt` -- already in schema
- `downloads` table: `id, userId, productId, version, fileName, downloadToken, expiresAt, downloadedAt` -- already in schema
- `products.currentVersion` field -- already in schema
- `ProductVersion` entity with semver validation and lifecycle methods -- already in domain

**What's missing:**
1. `/api/v1/update/check` -- POST endpoint accepting `{ license_key, domain, current_version, api_token }`, returns WordPress plugin update format
2. `/api/v1/update/download` -- GET endpoint accepting `{ download_token }`, returns ZIP file stream
3. `/api/v1/license/status` -- GET endpoint returning full license info (beyond validate's boolean)
4. ZIP file storage mechanism (upload, version management, serve)

**WordPress update check response format (critical compatibility):**
```json
{
  "slug": "conversionflow/conversionflow.php",
  "new_version": "2.1.0",
  "url": "https://conversionflow.com/changelog",
  "package": "https://conversionflow.com/api/v1/update/download?token=xxx",
  "requires": "6.0",
  "requires_php": "7.4",
  "tested": "6.7.1",
  "sections": {
    "description": "<p>Plugin description</p>",
    "changelog": "<ul><li>Fixed: Bug fixes</li></ul>"
  }
}
```

**Complexity: Medium.** The data model is complete. The main work is: (a) the API endpoint logic, (b) ZIP file upload/storage, and (c) download token generation + time-limited URL serving.

### 2. Feature Flags & Tier Enforcement (Phase 33)

**What it is:** Per-plan feature definitions that control which features each plan tier can access, with platform-specific variations.

**Why table-stakes:** Without feature flags, all plan tiers get the same functionality, making upselling impossible. The schema already has `productPlans.features` as JSONB with `Record<string, boolean>` type.

**Existing foundation:**
- `productPlans.features` JSONB column -- already stores `Record<string, boolean>` per plan
- `ProductPlan` entity validates features must be flat boolean map -- already enforced in domain
- `ValidateLicenseHandler` returns plan name -- already returns `plan` field
- Admin product/plan management -- already exists

**What's missing:**
1. Extend validate response to include `features` map from the plan
2. Platform dimension in features (WP features differ from Laravel features)
3. Admin UI for managing feature flags per plan (checkbox grid)
4. Feature gating logic in customer portal (show/hide based on plan features)

**Recommended feature flag structure (extend existing):**
```json
// Current: productPlans.features = { "analytics": true, "api_access": true }
// Extended: add platform dimension
{
  "analytics": true,
  "api_access": true,
  "auto_updates": true,
  "_platforms": {
    "wordpress": { "auto_updates": true, "woo_integration": true },
    "laravel": { "middleware": true, "artisan_commands": true },
    "shopify": { "billing_sync": true, "app_bridge": true },
    "nextjs": { "use_license_hook": true, "proxy_helpers": true }
  }
}
```

**Alternative (simpler):** Keep `features` flat for plan-level flags. Add a new `platform_features` JSONB column or a separate `plan_platform_features` table for platform-specific overrides. This avoids nesting complexity.

**Recommendation:** Use the simpler approach -- keep `features` flat for universal plan features. Add `platformFeatures` JSONB column to `productPlans`:
```json
// productPlans.platformFeatures
{
  "wordpress": { "auto_updates": true, "woo_integration": true },
  "laravel": { "middleware": true, "artisan_commands": true },
  "shopify": { "billing_sync": true },
  "nextjs": { "proxy_helpers": true }
}
```

**Complexity: Medium.** The column already exists for basic features. Adding platform dimension requires a new column + UI + validate response extension.

### 3. Multi-Gateway Payment System (Phase 34)

**What it is:** Extensible payment architecture supporting both manual (bKash/Nagad/Rocket/Bank) and automatic (SSL Commerz/Stripe/Paddle/bKash API) gateways.

**Why table-stakes:** International customers cannot pay via bKash. BD customers cannot pay via Stripe. Both markets must be served. The dual-system architecture is already decided.

**Existing foundation:**
- SSL Commerz integration: `createSSLSession()`, success/fail/cancel/IPN handlers -- fully working
- Manual payment: bKash/Nagad/Rocket/Bank with admin verification -- fully working
- `orders` table with `paymentMethod` enum (currently: bkash, nagad, rocket, bank_transfer, ssl_commerz)
- `paymentAccounts` table for manual payment account details
- Event-driven order completion: `OrderService.completeOrder()` -> `OrderCompleted` event -> license generation
- `settings` table for gateway configuration storage

**What's missing:**
1. Gateway abstraction interface (common API for all gateways)
2. Stripe integration (Checkout Sessions, Webhooks, Customer Portal)
3. Paddle integration (Checkout, Webhooks, MoR tax handling)
4. bKash Tokenized Checkout API (automatic, not manual)
5. Admin UI for managing multiple gateways (enable/disable, configure)
6. Extend `paymentMethod` enum: add `stripe`, `paddle`, `bkash_api`

**Gateway abstraction interface:**
```typescript
interface PaymentGateway {
  readonly id: string;                    // 'ssl_commerz' | 'stripe' | 'paddle' | 'bkash_api'
  readonly name: string;                  // Display name
  readonly supportedCurrencies: string[]; // ['BDT'] | ['USD', 'EUR', 'GBP'] | ['BDT']
  
  createSession(params: CheckoutParams): Promise<CheckoutResult>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerification>;
  refundPayment?(paymentId: string, amount?: number): Promise<RefundResult>;
}

interface CheckoutParams {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  plan: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CheckoutResult {
  url: string;           // Redirect URL for customer
  gatewaySessionId: string;
}

interface WebhookResult {
  eventType: string;     // 'payment.success' | 'payment.failed' | 'subscription.created' | etc.
  orderId: string;
  paymentRef: string;
  amount: number;
  currency: string;
}
```

**Stripe integration specifics:**
- Use `stripe` npm package (official SDK)
- Checkout Sessions for one-time payments
- Subscriptions API for recurring billing
- Customer Portal for self-service subscription management
- Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Store Stripe customer ID on user record for recurring billing

**Paddle integration specifics:**
- Use Paddle Billing API (not legacy Paddle SDK)
- Paddle acts as Merchant of Record (MoR) -- handles tax, compliance, invoicing
- Paddle.js for client-side checkout overlay
- Webhook events: `transaction.completed`, `subscription.created`, `subscription.updated`, `subscription.canceled`
- Paddle handles pricing in local currencies automatically

**bKash API integration specifics:**
- Tokenized Checkout API v1.2.0-beta
- Flow: `grantToken()` -> `createPayment()` -> redirect to bkashURL -> callback -> `executePayment()`
- Sandbox: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
- Production: `https://tokenized.pay.bka.sh/v1.2.0-beta`
- Only BDT currency supported

**Complexity: High.** The abstraction layer + 3 new gateways + admin UI + webhook handling is substantial. But the event-driven order system (`OrderService.completeOrder()` + event bus) means the post-payment license generation is already solved.

### 4. WordPress SDK (Phase 35)

**What it is:** PHP client library that WordPress plugin developers include in their plugin to handle license activation, validation, and auto-updates.

**Why table-stakes:** The ConversionFlow WordPress plugin needs this to function. Without it, there is no way to activate licenses or receive updates from the ConversionFlow server.

**Distribution:** Composer package (`conversionflow/sdk-php`) that plugin developers install via `composer require`, then bundle in their plugin.

**SDK components:**

| Component | Purpose | Pattern |
|-----------|---------|---------|
| `ConversionFlowClient` | Main API client class | HTTP wrapper with configurable server URL, timeout, retry |
| `LicenseManager` | License activation/deactivation/validation | Methods: `activate()`, `deactivate()`, `validate()`, `getStatus()` |
| `UpdateChecker` | Auto-update integration | Hooks `pre_set_site_transient_update_plugins` + `plugins_api` |
| `SettingsPage` | Admin settings page helper | Renders license key input, status display, activate/deactivate buttons |
| `DomainHelper` | Domain normalization and activation helpers | `getSiteDomain()`, `normalizeDomain()` |

**Auto-update implementation pattern:**
```php
// Plugin hooks into WordPress update system
add_filter('pre_set_site_transient_update_plugins', [$updateChecker, 'checkForUpdate']);
add_filter('plugins_api', [$updateChecker, 'getPluginInfo'], 10, 3);
add_action('upgrader_process_complete', [$updateChecker, 'afterUpdate']);
```

**Security:** The SDK sends `license_key` + `api_token` + `domain` + `current_version` to the ConversionFlow server. The server validates the license, checks activation, and returns update info with a time-limited download URL.

**Complexity: Medium.** Straightforward PHP HTTP client + WordPress hooks. The server-side APIs must be complete first (Phase 32, 33).

### 5. Laravel SDK (Phase 36)

**What it is:** Laravel Composer package providing ServiceProvider, Facade, middleware, and Artisan commands for license management.

**Why differentiator:** Most license servers only provide a WordPress SDK. A native Laravel package with auto-discovery, middleware, and Artisan commands is a genuine differentiator that attracts Laravel developers.

**SDK components:**

| Component | Purpose | Pattern |
|-----------|---------|---------|
| `ConversionFlowServiceProvider` | Register services, publish config | Standard Laravel ServiceProvider with `register()` + `boot()` |
| `ConversionFlowFacade` | Static-like access to client | `ConversionFlow::validate()`, `ConversionFlow::activate()` |
| `ConversionFlowClient` | Core API client | Same HTTP client as WP SDK but without WP-specific code |
| `LicenseMiddleware` | Route protection | `Route::middleware('conversionflow.license')` |
| `LicenseActivateCommand` | `php artisan license:activate` | Artisan command with interactive prompts |
| `LicenseDeactivateCommand` | `php artisan license:deactivate` | Artisan command |
| `LicenseCheckCommand` | `php artisan license:check` | Artisan command, returns status |
| `Config publishing` | `php artisan vendor:publish` | Publishes `config/conversionflow.php` |

**Auto-discovery (composer.json):**
```json
{
  "extra": {
    "laravel": {
      "providers": ["ConversionFlow\\Laravel\\ConversionFlowServiceProvider"],
      "aliases": { "ConversionFlow": "ConversionFlow\\Laravel\\Facades\\ConversionFlowFacade" }
    }
  }
}
```

**Middleware behavior:**
```php
// Redirect to license page if invalid
Route::middleware('conversionflow.license')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

// Or abort(403) with custom response
```

**Complexity: Low-Medium.** Standard Laravel package development patterns. Can share the PHP HTTP client from WordPress SDK. The main work is Laravel-specific integration (ServiceProvider, Facade, middleware registration, config publishing).

### 6. Shopify Integration (Phase 37)

**What it is:** Shopify app that syncs Shopify Billing API subscriptions to ConversionFlow licenses.

**Why differentiator:** Most license servers have no Shopify integration. This enables selling ConversionFlow-powered products through the Shopify App Store.

**Key architecture difference:** Unlike WP/Laravel SDKs which are client libraries, the Shopify integration is a full Shopify App with:
- OAuth authentication via Shopify App Bridge
- Shopify Billing API for subscription management
- Webhook handlers for app lifecycle events
- Automatic license creation on app install

**Components:**

| Component | Purpose | Notes |
|-----------|---------|-------|
| Shopify App Scaffold | Base app structure with App Bridge | Use `@shopify/shopify-api` Node.js package |
| OAuth Handler | Authenticate merchants via Shopify | JWT session tokens, no cookies |
| Billing Sync | Map Shopify charges to CF licenses | `appSubscriptionCreate` -> CF license activation |
| Webhook Handlers | Handle install/uninstall/billing events | `APP_UNINSTALLED` -> suspend license |
| Installation Flow | Auto-create license on app install | Merchant installs app -> CF creates license with Shopify plan |

**Shopify Billing API flow:**
1. Merchant installs app -> OAuth callback
2. App presents plan selection (maps to CF product plans)
3. Merchant confirms -> `appSubscriptionCreate` mutation
4. Shopify charge activates -> webhook -> CF creates license
5. Merchant uninstalls -> `APP_UNINSTALLED` webhook -> CF suspends license

**Webhook topics to handle:**
- `APP_UNINSTALLED` -- suspend or revoke license
- `APP_SUBSCRIPTIONS_UPDATE` -- update license plan
- `CUSTOMER_DATA_REQUEST` -- GDPR compliance
- `SHOP_UPDATE` -- update merchant info

**Complexity: High.** Shopify integration has the most moving parts: OAuth, App Bridge, Billing API, webhooks, and mapping to the CF licensing model. Requires a Shopify Partner account and app registration.

### 7. Next.js SDK & API Security (Phase 38)

**What it is:** npm package with React hook + server-side helpers for Next.js applications, plus HMAC request signing for all API endpoints.

**SDK components:**

| Component | Purpose | Notes |
|-----------|---------|-------|
| `useLicense()` hook | Client-side license state management | React hook with caching, auto-refresh, loading/error states |
| `validateLicense()` | Server-side validation helper | For use in Server Components and `proxy.ts` |
| `createLicenseProxy()` | `proxy.ts` route protection helper | Wraps license check for protected routes |
| `signRequest()` | HMAC request signing | Signs API calls with shared secret |
| `verifySignature()` | Server-side signature verification | Validates incoming signed requests |

**useLicense hook interface:**
```typescript
interface UseLicenseOptions {
  licenseKey: string;
  domain: string;
  refreshInterval?: number;  // Default: 12 hours
  cacheTtl?: number;         // Default: 24 hours
}

interface LicenseState {
  valid: boolean;
  loading: boolean;
  error: string | null;
  plan: string | null;
  features: Record<string, boolean> | null;
  expiresAt: Date | null;
  activations: { current: number; max: number } | null;
  refresh: () => Promise<void>;
}

function useLicense(options: UseLicenseOptions): LicenseState;
```

**proxy.ts helper pattern:**
```typescript
// In src/proxy.ts
import { createLicenseProxy } from '@conversionflow/license-sdk/server';

export default createLicenseProxy({
  licenseServerUrl: process.env.CF_LICENSE_URL!,
  protectedPaths: ['/dashboard', '/admin', '/analytics'],
  publicPaths: ['/login', '/register', '/pricing'],
});
```

**HMAC signing implementation:**
- Algorithm: HMAC-SHA256
- What to sign: HTTP method + URL path + request body hash + timestamp + nonce
- Header format: `Authorization: HMAC-SHA256 Credential={api_key}, Signature={signature}, Timestamp={ts}, Nonce={nonce}`
- Server validates: reconstruct signature string -> compare -> check timestamp (5 min window) -> reject replay (nonce check)
- Key management: Each platform SDK gets a shared secret stored in the license record. Rotated via admin UI.

**Complexity: Medium.** The React hook is straightforward. HMAC signing is well-documented. The main risk is getting the signature construction right and handling edge cases (clock skew, replay attacks).

## MVP Recommendation for v4.0

**Phase 1 -- Foundation (must ship first):**
1. Update Delivery System (Phase 32) -- enables all SDKs
2. Feature Flags per Tier (Phase 33) -- enables feature enforcement

**Phase 2 -- Payments (can run parallel with SDKs):**
3. Gateway Abstraction Layer -- foundation for all new gateways
4. Stripe Integration -- international payments
5. Paddle Integration -- tax/compliance
6. bKash Automatic API -- BD frictionless payments

**Phase 3 -- SDKs (sequentially):**
7. WordPress SDK (Phase 35) -- highest priority, current product
8. Laravel SDK (Phase 36) -- second priority, shares PHP client
9. Next.js SDK + API Security (Phase 38) -- npm package

**Phase 4 -- Platform Integrations:**
10. Shopify Integration (Phase 37) -- most complex, requires Shopify Partner account

**Defer to v4.1/v5.0:**
- Shopify integration complexity may warrant its own milestone
- Usage-based billing / metered billing
- Marketplace integrations (Envato, CodeCanyon)
- Mobile SDKs (React Native, Flutter)
- Offline cryptographic validation
- Real-time WebSocket license sync

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Update Delivery | HIGH | Well-established WordPress pattern; existing tables and entities provide strong foundation |
| Feature Flags | HIGH | Schema already supports JSONB features; straightforward extension |
| Stripe Integration | HIGH | Well-documented API; standard Checkout Session + webhook pattern |
| Paddle Integration | MEDIUM | MoR model is different from typical payment gateway; webhook event names and flow need verification against current Paddle Billing API docs |
| bKash API | MEDIUM | Tokenized Checkout API is relatively new (v1.2.0-beta); sandbox testing essential before production |
| WordPress SDK | HIGH | Standard PHP client + WordPress hooks; `plugin-update-checker` pattern is battle-tested |
| Laravel SDK | HIGH | Standard Laravel package development; ServiceProvider/Facade/middleware patterns are well-established |
| Shopify Integration | MEDIUM | Most complex integration; requires Shopify Partner account, app review process, and Billing API compliance |
| Next.js SDK | HIGH | Straightforward React hook + server helper pattern |
| HMAC Security | HIGH | AWS Signature V4-style signing is well-documented and battle-tested |
| Rate Limiting per Platform | HIGH | Extending existing Redis sorted-set rate limiter is straightforward |

## Gaps to Address

- **Paddle Billing API verification:** Training data may be stale for Paddle's current Billing API (not legacy). Need to verify webhook event names, checkout flow, and pricing preview endpoints against current docs during Phase 34 research.
- **bKash Tokenized API stability:** v1.2.0-beta designation suggests the API may change. Need to confirm production readiness and get sandbox credentials early.
- **Shopify app review process:** Submitting to Shopify App Store has specific requirements (privacy policy, data handling, billing transparency). These are non-technical but can block launch.
- **Shopify Partner account:** Required before any development. This is a business dependency, not technical.
- **HMAC shared secret distribution:** How SDKs receive their shared secrets needs design. Options: (a) embed in license activation response, (b) separate API call, (c) derive from license key. Recommend option (a) -- simplest, secure enough for this use case.

## Sources

- **WordPress Auto-Update:** `pre_set_site_transient_update_plugins` hook documentation (WordPress Codex) -- HIGH confidence, official API
- **Plugin Update Checker:** [github.com/YahnisElsts/plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) -- HIGH confidence, 50K+ WordPress installs
- **Stripe Checkout Sessions:** [stripe.com/docs/api/checkout/sessions](https://stripe.com/docs/api/checkout/sessions) -- HIGH confidence, official documentation
- **Stripe Webhooks:** [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks) -- HIGH confidence, official documentation
- **Paddle Billing API:** [developer.paddle.com/api](https://developer.paddle.com/api) -- MEDIUM confidence, based on training data (verify current docs)
- **bKash Tokenized Checkout:** [bka.sh developer portal](https://developer.bka.sh/) -- MEDIUM confidence, based on training data (API is v1.2.0-beta)
- **Shopify Billing API:** [shopify.dev/docs/apps/monetization](https://shopify.dev/docs/apps/monetization) -- MEDIUM confidence, official documentation
- **Shopify App Bridge:** [shopify.dev/docs/apps/tools/app-bridge](https://shopify.dev/docs/apps/tools/app-bridge) -- MEDIUM confidence, official documentation
- **Laravel Package Development:** [laravel.com/docs/packages](https://laravel.com/docs/11.x/packages) -- HIGH confidence, official documentation
- **HMAC Request Signing:** AWS Signature Version 4 pattern -- HIGH confidence, industry standard
- **Existing Codebase Analysis:** `src/lib/db/schema.ts`, `src/modules/licensing/*`, `src/modules/billing/*`, `src/modules/products/*` -- HIGH confidence, direct code analysis
