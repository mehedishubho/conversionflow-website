# Requirements: v4.0 Multi-Platform License Server & SDK Distribution

**Status:** Active
**Last Updated:** 2026-06-09

## Update Delivery (UPDT)

- [ ] **UPDT-01**: WordPress plugin checks for updates via /api/v1/update/check in WordPress-compatible format (slug, version, download_url, sections)
- [ ] **UPDT-02**: Authenticated download endpoint /api/v1/update/download serves ZIP files only to valid license holders via signed download tokens
- [ ] **UPDT-03**: GET /api/v1/license/status returns full license info including all activations, tier, features, and expiry
- [ ] **UPDT-04**: Admin can upload and manage ZIP files per product version with automatic version tracking integrated with product_versions table
- [ ] **UPDT-05**: Update check supports WordPress plugin info API format including requires, tested, and requires_php fields

## Feature Flags & Tier Enforcement (FF)

- [ ] **FF-01**: Feature flag definitions stored per plan with platform dimension (JSONB with nested platform keys like `{ "exports": { "wordpress": true, "laravel": false } }`)
- [ ] **FF-02**: /api/v1/license/validate returns allowed features list for the license's platform and tier in response
- [ ] **FF-03**: Admin can manage features per plan per product via dedicated admin UI with platform toggle matrix
- [ ] **FF-04**: Platform-specific feature sets (WordPress features differ from Laravel/Shopify/Next.js features)
- [ ] **FF-05**: Customer portal shows available vs locked features for their current tier and platform

## Multi-Gateway Payments (PAY)

- [ ] **PAY-01**: Gateway abstraction layer with common IPaymentGateway interface using Strategy + Factory pattern — new gateways added via adapter
- [ ] **PAY-02**: Stripe integration with Checkout Sessions, Webhooks, and subscription support for international card payments
- [ ] **PAY-03**: Paddle integration as Merchant of Record with Checkout, Webhooks, and automatic tax/compliance handling
- [ ] **PAY-04**: bKash Tokenized Checkout API for automatic BD payments (verify v1.2.0-beta endpoints before implementation)
- [ ] **PAY-05**: Admin can enable/disable individual gateways from payment settings UI
- [ ] **PAY-06**: Payment settings UI reorganized into dual-system model: Manual (bKash/Nagad/Rocket/Bank) vs Real (SSL Commerz/Stripe/Paddle/bKash API)

## WordPress SDK (WPSDK)

- [ ] **WPSDK-01**: PHP client library with activate(), deactivate(), validate(), check_update() methods calling /api/v1/* endpoints
- [ ] **WPSDK-02**: Auto-update integration hooks into WordPress native plugin update system (pre_set_site_transient_update_plugins)
- [ ] **WPSDK-03**: Admin settings page helper (license key input, status display, activation management) for WordPress admin panel
- [ ] **WPSDK-04**: Composer package (conversionflow/sdk-php) for distribution via Packagist
- [ ] **WPSDK-05**: Domain activation and verification helpers working on shared hosting, WP-CLI, and managed WordPress environments

## Laravel SDK (LVSDK)

- [ ] **LVSDK-01**: Laravel auto-discovery package with ServiceProvider and Facade (conversionflow/laravel)
- [ ] **LVSDK-02**: License validation middleware for route protection — blocks routes when license is invalid/expired
- [ ] **LVSDK-03**: Artisan commands: license:activate, license:deactivate, license:check, license:status
- [ ] **LVSDK-04**: Config and views publishable with 24h caching layer to minimize API calls to ConversionFlow server

## Shopify Integration (SHPFY)

- [ ] **SHPFY-01**: Shopify app scaffold with App Bridge authentication and OAuth flow (requires Shopify Partner account)
- [ ] **SHPFY-02**: Shopify Billing API mapped to ConversionFlow license system with bidirectional sync
- [ ] **SHPFY-03**: Webhook handlers for app install/uninstall and billing events with HMAC signature verification
- [ ] **SHPFY-04**: Installation flow creates ConversionFlow license automatically on Shopify app install and deactivates on uninstall

## Next.js SDK & API Security (NXSDK)

- [ ] **NXSDK-01**: npm/pnpm package (@conversionflow/license-sdk) with useLicense() hook and proxy.ts (middleware) helpers for route protection — compatible with npm and pnpm
- [ ] **NXSDK-02**: All /api/v1/* endpoints secured with HMAC request signing (AWS Sig V4-style) using Node.js crypto
- [ ] **NXSDK-03**: Standardized API key authentication for SDK clients with rotation support in admin dashboard
- [ ] **NXSDK-04**: Per-platform rate limiting (WP, Laravel, Shopify, Next.js) via Redis sliding window using rate-limiter-flexible
- [ ] **NXSDK-05**: HMAC secret per license, generated on activation and returned for SDK use

## Deferred (Post-v4.0)

- [ ] **DEFER-06**: Cryptographic offline validation (public key embedded in SDK)
- [ ] **DEFER-07**: Hardware fingerprinting for advanced anti-piracy
- [ ] **DEFER-08**: WordPress.org plugin directory hosting
- [ ] **DEFER-09**: Shopify app store submission and review process
- [ ] **DEFER-10**: Real-time analytics dashboard with live SDK telemetry

## Out of Scope

- **Building actual WordPress/Laravel/Shopify/Next.js products** — we build the license server and SDKs only, not the end-user products
- **Redesigning existing dashboard UI** — admin UI additions match existing TailAdmin/backenddashboard design system
- **Mobile app** — web-only platform
- **Multi-tenant support** — single-instance platform for Devsroom only
- **External licensing engines** — ConversionFlow IS the license server, no 3rd party ever
- **Shopify app store submission** — scaffold and integration only, store submission deferred

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPDT-01 | Phase 32 | Pending |
| UPDT-02 | Phase 32 | Pending |
| UPDT-03 | Phase 32 | Pending |
| UPDT-04 | Phase 32 | Pending |
| UPDT-05 | Phase 32 | Pending |
| FF-01 | Phase 33 | Pending |
| FF-02 | Phase 33 | Pending |
| FF-03 | Phase 33 | Pending |
| FF-04 | Phase 33 | Pending |
| FF-05 | Phase 33 | Pending |
| PAY-01 | Phase 34 | Pending |
| PAY-02 | Phase 34 | Pending |
| PAY-03 | Phase 34 | Pending |
| PAY-04 | Phase 34 | Pending |
| PAY-05 | Phase 34 | Pending |
| PAY-06 | Phase 34 | Pending |
| WPSDK-01 | Phase 35 | Pending |
| WPSDK-02 | Phase 35 | Pending |
| WPSDK-03 | Phase 35 | Pending |
| WPSDK-04 | Phase 35 | Pending |
| WPSDK-05 | Phase 35 | Pending |
| LVSDK-01 | Phase 36 | Pending |
| LVSDK-02 | Phase 36 | Pending |
| LVSDK-03 | Phase 36 | Pending |
| LVSDK-04 | Phase 36 | Pending |
| SHPFY-01 | Phase 37 | Pending |
| SHPFY-02 | Phase 37 | Pending |
| SHPFY-03 | Phase 37 | Pending |
| SHPFY-04 | Phase 37 | Pending |
| NXSDK-01 | Phase 38 | Pending |
| NXSDK-02 | Phase 38 | Pending |
| NXSDK-03 | Phase 38 | Pending |
| NXSDK-04 | Phase 38 | Pending |
| NXSDK-05 | Phase 38 | Pending |

---
*Last updated: 2026-06-09*
