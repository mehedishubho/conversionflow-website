# Requirements: v3.0 Self-Contained Licensing Architecture

**Status:** Active
**Last Updated:** 2026-05-30

## Product & Plan Management (PROD)

- [ ] **PROD-01**: Admin can create products with name, slug, description, and current version
- [ ] **PROD-02**: Admin can manage product versions with download URLs and changelogs
- [ ] **PROD-03**: Admin can create plans for each product with pricing, activation limits, and feature flags
- [ ] **PROD-04**: Plans support lifetime licenses (no expiration) and subscription licenses (duration-based)
- [ ] **PROD-05**: Plans define maximum activation limits (1, 3, 5, unlimited)
- [ ] **PROD-06**: Plan pricing supports multiple currencies (BDT, USD)
- [ ] **PROD-07**: Product and plan data is accessible via admin dashboard UI

## License Generation & Validation (LGEN)

- [ ] **LGEN-01**: System generates unique license keys using Node.js `crypto.randomBytes()` (25-32 characters, segmented format)
- [ ] **LGEN-02**: License keys are case-insensitive with no ambiguous characters (exclude: 0, O, 1, l, I)
- [ ] **LGEN-03**: License keys have UNIQUE database constraint to prevent duplicates
- [ ] **LGEN-04**: License generation happens locally (no external API calls to license.devsroom.com)
- [ ] **LGEN-05**: Public API endpoint `/api/v1/license/validate` validates license keys and returns status, expiry, plan details
- [ ] **LGEN-06**: Validation API uses Redis caching with 5-15 minute TTL
- [ ] **LGEN-07**: Validation API cache invalidates immediately on license status changes (revoke, suspend, expire)
- [ ] **LGEN-08**: Public API has rate limiting (100 requests/minute per IP)
- [ ] **LGEN-09**: Validation API returns identical error for all failures (no information leakage about expired vs revoked vs not found)

## Activation & Domain Tracking (ACT)

- [ ] **ACT-01**: System tracks domain activations per license with timestamps, IP addresses, and geo-location
- [ ] **ACT-02**: Domain normalization strips protocol (https://), www prefix, and trailing slashes
- [ ] **ACT-03**: Activation limit enforcement uses atomic database operations to prevent race conditions
- [ ] **ACT-04**: System enforces max activations per plan (rejects activation if limit reached)
- [ ] **ACT-05**: Domain activation requires verification (DNS TXT record, file upload, or meta tag)
- [ ] **ACT-06**: Public API endpoints `/api/v1/license/activate` and `/api/v1/license/deactivate` for plugin integration
- [ ] **ACT-07**: Customers can view and manage their active domains in customer portal
- [ ] **ACT-08**: Admin can view activation history and detect suspicious patterns

## License Status & Subscriptions (LSTAT)

- [ ] **LSTAT-01**: License status supports: active, expired, revoked, suspended, grace_period
- [ ] **LSTAT-02**: Subscription licenses have `expires_at` timestamp in UTC
- [ ] **LSTAT-03**: Grace period of 7-30 days after expiration (license remains valid during grace period)
- [ ] **LSTAT-04**: Lifetime licenses have null or far-future `expires_at` (never expire)
- [ ] **LSTAT-05**: Admin can manually revoke or suspend licenses with reason
- [ ] **LSTAT-06**: License status changes trigger audit log entries and customer notifications
- [ ] **LSTAT-07**: Background job checks for expiring licenses daily and sends reminder emails (30, 14, 7, 3, 1 days before)

## Architecture & Migration (ARCH)

- [ ] **ARCH-01**: Codebase organized into modular monolith with DDD bounded contexts (Licensing, Billing, Customers, Products, Analytics)
- [ ] **ARCH-02**: Service Layer Pattern abstracts business logic from API routes and controllers
- [ ] **ARCH-03**: Repository Pattern abstracts data access from services
- [ ] **ARCH-04**: Domain events enable loose coupling between bounded contexts (OrderCompleted → LicenseCreated)
- [ ] **ARCH-05**: Event bus implemented with EventEmitter (in-process) and Redis Pub/Sub (cross-process)
- [ ] **ARCH-06**: Remove `src/lib/central-api.ts` file (external license API client)
- [ ] **ARCH-07**: Remove database fields: `centralOrderId`, `centralLicenseId`, `centralUserId`
- [ ] **ARCH-08**: Remove webhook handlers for central license API events
- [ ] **ARCH-09**: Data migration strategy includes verification, rollback plan, and gradual feature flag rollout
- [ ] **ARCH-10**: Migration preserves all existing license data without loss

## Analytics Dashboard (ANLT)

- [ ] **ANLT-01**: Admin dashboard shows license analytics overview (total, active, expired, revoked counts)
- [ ] **ANLT-02**: Revenue analytics display total revenue, MRR, ARR, and trend indicators
- [ ] **ANLT-03**: Product performance metrics show sales by product and plan
- [ ] **ANLT-04**: Customer growth tracking displays daily/weekly/monthly signups
- [ ] **ANLT-05**: Activation statistics show current activations, activation rate, geographic distribution

## Public API Endpoints (API)

- [ ] **API-01**: `/api/v1/license/validate` endpoint accepts license_key and domain, returns validation result
- [ ] **API-02**: `/api/v1/license/activate` endpoint binds license to domain after verification
- [ ] **API-03**: `/api/v1/license/deactivate` endpoint removes domain from license
- [ ] **API-04**: API uses API token authentication for external requests
- [ ] **API-05**: API responses follow consistent JSON format with error handling

## Background Jobs (JOBS)

- [ ] **JOB-01**: BullMQ worker processes license expiration checks daily
- [ ] **JOB-02**: BullMQ worker sends renewal reminder emails based on expiration date
- [ ] **JOB-03**: BullMQ worker handles analytics aggregation for dashboard
- [ ] **JOB-04**: Jobs use Redis for queue management and retry logic with exponential backoff

## License Transfer System (XFER)

- [ ] **XFER-01**: Customers can transfer license ownership to another account via transfer code
- [ ] **XFER-02**: Customers can deactivate old domain and activate new domain (within transfer limits)
- [ ] **XFER-03**: Transfer operations are logged in audit trail with timestamp and actor
- [ ] **XFER-04**: Admin can configure maximum transfers per month per license

## Deferred (Post-MVP)

- [ ] **DEFER-01**: Cryptographic offline validation (public key embedded in plugin)
- [ ] **DEFER-02**: Hardware fingerprinting for advanced anti-piracy
- [ ] **DEFER-03**: Real-time analytics dashboard with live updates
- [ ] **DEFER-04**: Automated compliance enforcement
- [ ] **DEFER-05**: Advanced reporting with scheduled PDF exports

## Out of Scope

- **WordPress plugin development** — v3.0 is the SaaS platform, not the plugin itself
- **Multi-tenant support** — single-instance platform for Devsroom only
- **Redesigning existing marketing pages** — all v1.x/v2.x pages preserved as-is
- **Redesigning dashboard UI** — use existing backenddashboard/ template design

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROD-01 | Phase 15 | Pending |
| PROD-02 | Phase 15 | Pending |
| PROD-03 | Phase 15 | Pending |
| PROD-04 | Phase 15 | Pending |
| PROD-05 | Phase 15 | Pending |
| PROD-06 | Phase 15 | Pending |
| PROD-07 | Phase 15 | Pending |
| LGEN-01 | Phase 16 | Pending |
| LGEN-02 | Phase 16 | Pending |
| LGEN-03 | Phase 16 | Pending |
| LGEN-04 | Phase 16 | Pending |
| LGEN-05 | Phase 16 | Pending |
| LGEN-06 | Phase 16 | Pending |
| LGEN-07 | Phase 16 | Pending |
| LGEN-08 | Phase 16 | Pending |
| LGEN-09 | Phase 16 | Pending |
| ACT-01 | Phase 16 | Pending |
| ACT-02 | Phase 16 | Pending |
| ACT-03 | Phase 16 | Pending |
| ACT-04 | Phase 16 | Pending |
| ACT-05 | Phase 16 | Pending |
| ACT-06 | Phase 16 | Pending |
| ACT-07 | Phase 16 | Pending |
| ACT-08 | Phase 16 | Pending |
| LSTAT-01 | Phase 18 | Pending |
| LSTAT-02 | Phase 18 | Pending |
| LSTAT-03 | Phase 18 | Pending |
| LSTAT-04 | Phase 18 | Pending |
| LSTAT-05 | Phase 17 | Pending |
| LSTAT-06 | Phase 17 | Pending |
| LSTAT-07 | Phase 18 | Pending |
| ARCH-01 | Phase 14 | Pending |
| ARCH-02 | Phase 14 | Pending |
| ARCH-03 | Phase 14 | Pending |
| ARCH-04 | Phase 14 | Pending |
| ARCH-05 | Phase 14 | Pending |
| ARCH-06 | Phase 17 | Pending |
| ARCH-07 | Phase 20 | Pending |
| ARCH-08 | Phase 17 | Pending |
| ARCH-09 | Phase 20 | Pending |
| ARCH-10 | Phase 20 | Pending |
| ANLT-01 | Phase 19 | Pending |
| ANLT-02 | Phase 19 | Pending |
| ANLT-03 | Phase 19 | Pending |
| ANLT-04 | Phase 19 | Pending |
| ANLT-05 | Phase 19 | Pending |
| API-01 | Phase 16 | Pending |
| API-02 | Phase 16 | Pending |
| API-03 | Phase 16 | Pending |
| API-04 | Phase 16 | Pending |
| API-05 | Phase 16 | Pending |
| JOB-01 | Phase 18 | Pending |
| JOB-02 | Phase 18 | Pending |
| JOB-03 | Phase 19 | Pending |
| JOB-04 | Phase 18 | Pending |
| XFER-01 | Phase 19 | Pending |
| XFER-02 | Phase 19 | Pending |
| XFER-03 | Phase 19 | Pending |
| XFER-04 | Phase 19 | Pending |

---
*Last updated: 2026-05-30*
