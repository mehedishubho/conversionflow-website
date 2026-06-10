# Phase 34: Multi-Gateway Payment System - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor the tightly-coupled SSL Commerz + manual payment system into a dual-system model with a gateway abstraction layer. Extract SSL Commerz into an adapter, add Paddle (Merchant of Record) for international payments, add bKash Tokenized Checkout API for automatic BD payments, and restructure the admin payment settings UI. Stripe is deferred to post-v4.0 — Paddle covers all international payment needs.

**In scope:**
- New `src/modules/payments/` bounded context with `IPaymentGateway` full-lifecycle interface
- `payment_gateways` table (gatewayId, config JSONB encrypted, active, testMode, status)
- `payment_webhook_events` table (raw webhook payload logging)
- SSL Commerz extraction into `SSLCommerzAdapter` (existing routes redirect to unified flow)
- Paddle Billing (new API) adapter with Hosted Checkout, price sync from CF to Paddle
- bKash Tokenized Checkout API adapter (v1.2.0-beta) with sandbox support
- GatewayRegistry with self-registration in module-init
- Admin payment settings restructured into two-tab layout (Manual + Automatic)
- Gateway cards with Draft → Test → Live activation flow, Test Connection button
- Read-only webhook event log in admin
- Customer checkout UX: currency toggle (BDT/USD), gateway selector, sub-components per gateway
- bKash SDK loaded on-demand, inline OTP via bKash JS SDK
- Order schema extended with gatewayId, gatewayTransactionId, currency (nullable, string-based paymentMethod)
- Unified order lifecycle: pending → completed (triggered by webhook for automatic, admin verify for manual)
- Gateway-dependent invoicing (Paddle → Paddle receipt link, SSL/bKash → local PDF)
- Admin orders table with gateway column + detail panel
- Portal billing: unified list with gateway-aware actions
- Sequential 5-plan implementation

**NOT in scope (later phases):**
- Stripe integration (deferred to post-v4.0 — Paddle covers international)
- Subscription/recurring billing (one-time only for now)
- Circuit breaker pattern for gateway resilience
- Background gateway health monitoring
- Webhook event reprocessing UI
- Dynamic/configurable platform list (over-engineering for v4.0)
- Refund flow initiated by gateway (chargebacks) — admin-initiated only

</domain>

<decisions>
## Implementation Decisions

### Gateway Abstraction Design
- **D-01:** Full lifecycle `IPaymentGateway` interface with methods: `createSession()`, `verifyPayment()`, `handleWebhook()`, `processRefund()`, `getPaymentStatus()`, `validateConfig()`, `getRequiredConfigFields()`. Each gateway implements all methods.
- **D-02:** New `src/modules/payments/` bounded context following DDD layering: `domain/` (gateway interface, events, value objects), `application/` (GatewayRegistry, PaymentService), `infrastructure/adapters/` (SSLCommerzAdapter, PaddleAdapter, BKashAdapter).
- **D-03:** Dedicated `payment_gateways` table for gateway config + credentials. Columns: `id` (uuid PK), `gatewayId` (text, unique), `name` (text), `config` (JSONB, AES-256 encrypted), `active` (boolean), `testMode` (boolean), `status` (draft/test/live), `priority` (integer), `createdAt`, `updatedAt`.
- **D-04:** Customer selects gateway on checkout. Currency-aware filtering: BDT gateways only for BDT currency, USD gateways only for USD. Admin enables/disables per gateway.
- **D-05:** Typed error categories: `NETWORK_ERROR`, `INVALID_CONFIG`, `PAYMENT_FAILED`, `WEBHOOK_INVALID`, `GATEWAY_DOWN`, `RATE_LIMITED`. Each adapter throws these, global handler catches and shows user-friendly messages.
- **D-06:** Idempotent webhook handlers + `payment_webhook_events` table for raw payloads. Follows existing SSL Commerz IPN idempotency pattern. Stores: id, gatewayId, eventType, payload (JSONB), processed (boolean), processedAt, createdAt.
- **D-07:** Per-gateway test mode toggle in `payment_gateways` table. When testMode is enabled, adapter uses sandbox/test API URLs. Customer sees "TEST MODE" badge when any active gateway is in test mode.
- **D-08:** Gateway adapters self-register in `module-init.ts` via `GatewayRegistry`. Pattern: new adapter file + register call. Zero code changes to checkout when adding a gateway.
- **D-09:** Existing SSL Commerz integration extracted into `SSLCommerzAdapter`. Current routes (`/api/ssl-commerz/create-session`, `/api/ssl-commerz/ipn`, success/fail/cancel) redirect to unified payment flow. Zero breaking changes for mid-transaction customers.

### Stripe & Paddle Integration Model
- **D-10:** Stripe deferred to post-v4.0. Paddle covers all international payments (135+ currencies, MoR compliance, tax handling). Stripe adapter can be added later via the same gateway abstraction — no architectural changes needed.
- **D-11:** Paddle Billing (new API) — modern REST API, transaction-based model, released 2023+. Not Paddle Classic (legacy).
- **D-12:** Paddle Hosted Checkout — redirect to Paddle payment page (matches SSL Commerz redirect pattern already in place). Paddle handles card collection, 3DS, SCA, tax, invoicing.
- **D-13:** One-time payments only for Phase 34. All current products are one-time purchase. Subscription/recurring billing deferred to future phase. Paddle and adapter interface designed to support subscriptions later without breaking changes.
- **D-14:** Paddle owns the transaction as Merchant of Record. Local order records point to Paddle `transaction_id`. Paddle issues the invoice/receipt. CF keeps simplified records for analytics and license generation only.
- **D-15:** BDT + USD dual pricing. BDT gateways (SSL Commerz, bKash API, manual Nagad/Rocket/Bank) for BD customers. Paddle for international (USD + 135 currencies). Currency determines visible gateways. Existing product_plans already have both BDT and USD prices.
- **D-16:** Minimal webhook events for Paddle: `transaction.completed`, `transaction.payment_failed`, `transaction.refunded`. These 3 events cover the full one-time payment lifecycle.

### bKash API & Checkout UX
- **D-17:** bKash Tokenized Checkout API (v1.2.0-beta) — customer enters bKash number on our site, gets OTP popup from bKash JS SDK, payment completes inline. No redirect to bKash app. Best UX for BD customers.
- **D-18:** Build bKash adapter fully + test with sandbox credentials. Adapter is coded and functional against bKash sandbox. Production activation requires merchant credentials from bKash post-launch. Follows same sandbox toggle pattern as SSL Commerz.
- **D-19:** Currency-first checkout UX. Customer picks BDT or USD via toggle switch at top of payment section, then sees only relevant gateways. Default based on geo/profile. Toggle updates prices and methods in-place, no page reload.
- **D-20:** bKash automatic API appears as separate entry "bKash (Auto)" alongside manual "bKash" if admin enables both. Clear distinction for customers.
- **D-21:** bKash OAuth2 tokens cached in Redis with auto-refresh before expiry (typically 1 hour TTL). Follows existing Redis pattern for rate limiting and validation cache.
- **D-22:** Inline error + retry on payment failure. Shows error message on checkout page, keeps all form data filled. Customer can try again immediately. Follows existing ManualPaymentForm error pattern.
- **D-23:** bKash SDK handles OTP natively — their JavaScript SDK renders the OTP input popup. We call the API and handle the callback. No custom OTP UI needed.
- **D-24:** bKash SDK loaded on-demand only when customer selects bKash API payment method. Uses Next.js Script component with lazy loading strategy. Reduces initial checkout page load (~200KB saved for non-bKash users).

### Admin Settings UI & Webhook Architecture
- **D-25:** Two-tab layout in admin payment settings: "Manual Payments" tab (bKash/Nagad/Rocket/Bank account cards, same as today) and "Automatic Gateways" tab (SSL Commerz, Paddle, bKash API cards). Clear dual-system visual separation.
- **D-26:** Gateway cards with enable/disable toggle, credentials form (collapsible), test mode toggle, "Test Connection" button, and status indicator (connected/disconnected). Admin sees at a glance which gateways are active.
- **D-27:** Per-gateway webhook routes: `/api/webhooks/sslcommerz`, `/api/webhooks/paddle`, `/api/webhooks/bkash`. Each route calls its adapter's `verifyWebhook()` method. Clean separation, easy to debug per gateway.
- **D-28:** Each adapter handles its own webhook authentication: SSL Commerz uses val_id server-to-server verification, Paddle uses signature header verification, bKash uses checksum validation. No shared auth — each is gateway-specific.
- **D-29:** Read-only webhook event log table in admin. Shows: timestamp, gateway, event type, status (processed/failed), payload summary. Visibility only, no reprocessing UI.
- **D-30:** Manual "Test Connection" button on gateway cards. No background health monitoring. Admin tests when configuring or troubleshooting.

### Refund & Order Schema
- **D-31:** Admin-initiated refunds only. Admin clicks refund in CF admin panel → system calls gateway's refund API → gateway processes → webhook confirms → order status changes to 'refunded' → license revoked. One-directional: CF → Gateway. Gateway-initiated refunds (chargebacks) deferred.
- **D-32:** Extend existing orders table with nullable columns: `gatewayId` (text, references payment_gateways), `gatewayTransactionId` (text, the gateway's transaction/session ID), `currency` (text, 'BDT'/'USD'). Existing orders get NULL for new columns. No new table needed.
- **D-33:** Gateway-dependent invoicing. Paddle orders: link to Paddle receipt (no local PDF). SSL Commerz/bKash orders: generate local invoice PDF as today. No duplicate invoicing.
- **D-34:** CF owns prices, sync to Paddle. Admin manages prices in product_plans table (source of truth). When admin saves prices, system syncs to Paddle via Prices API. Admin never needs to touch Paddle dashboard for pricing.

### Checkout & Portal UX
- **D-35:** Unified success page. All gateway redirects land on same `/dashboard/checkout/success?orderId=X`. Page loads order from DB and shows: status badge, license key (if completed), payment method used, gateway-specific receipt link (Paddle) or download invoice (SSL/bKash). Single unified page, gateway-agnostic rendering.
- **D-36:** String-based payment method. Switch `paymentMethod` from enum to text. Gateway adapters define their own method IDs (ssl_commerz, bkash_api, paddle, bkash, nagad, rocket, bank_transfer). No schema migration needed to add new gateways. Validate against active gateways at runtime.
- **D-37:** Unified portal billing list with gateway-aware actions. Single list of all orders. Paddle orders show "View Receipt" link to Paddle receipt URL. SSL/bKash orders show "Download Invoice" for local PDF. Customer doesn't need to know the gateway difference.
- **D-38:** Admin orders table gets "Gateway" column showing which gateway processed. Clicking opens detail panel with gateway-specific info (SSL transaction ID, Paddle transaction ID, bKash payment ID). VerifyOrder stays for manual orders only. Automatic orders are auto-verified via webhook.

### Resilience & Architecture
- **D-39:** Per-adapter timeouts: SSL Commerz 30s, Paddle 15s, bKash 20s. On timeout: return clear error to customer ("Payment service unavailable, try another method or try again"). No circuit breaker. Customer can switch gateways.
- **D-40:** Checkout split into sub-components: `CheckoutPage` (shell), `CurrencyToggle`, `GatewaySelector` (shows available gateways for selected currency), `SSLCommerzForm`, `BKashAPIForm` (with SDK loader), `ManualPaymentForm` (shared for Nagad/Rocket/Bank), `PaddleRedirectButton`. Clean separation per gateway.
- **D-41:** Unified order lifecycle: pending order created first for ALL flows (automatic and manual). Automatic: pending → gateway session → webhook → completed. Manual: pending → admin verify → completed. Same `OrderService.completeOrder()` for all paths. Different triggers, same lifecycle.
- **D-42:** Gateway activation flow: Draft → Test → Live. Three states per gateway. Draft = configured but not tested. Test = sandbox verified. Live = test connection passed, credentials validated. Admin must explicitly activate to make visible on checkout. Prevents misconfigured gateways from reaching customers.

### Claude's Discretion
- Exact `IPaymentGateway` TypeScript interface definition (method signatures, param types, return types)
- GatewayRegistry implementation details (Map-based, lazy initialization)
- AES-256 encryption utility for gateway config (key derivation, IV handling)
- Paddle API client implementation (authentication, error handling, price sync endpoints)
- bKash Tokenized Checkout API integration details (grant token, create payment, execute payment)
- Exact `payment_gateways` and `payment_webhook_events` Drizzle schema
- How existing SSL Commerz routes redirect to unified flow (301 redirects vs code-level routing)
- CurrencyToggle component default detection (Accept-Language header vs GeoIP vs user profile)
- GatewaySelector component filtering logic
- Admin webhook log page layout and filtering
- Migration of existing `paymentMethodEnum` to text column (Drizzle migration)
- How Paddle price sync handles plan changes (upsert vs create new)
- bKash SDK CDN URL and version pinning
- Checkout page responsive design for gateway selector on mobile
- Error message copy for each error category per gateway
- How the test connection button works per adapter (what API endpoint it calls)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"Multi-Gateway Payments (PAY)" — PAY-01 through PAY-06
- `.planning/PROJECT.md` §"Key Decisions" — Dual payment system, Paddle as MoR, self-contained licensing
- `.planning/ROADMAP.md` §"Phase 34: Multi-Gateway Payment System" — Success criteria 1-6
- `.planning/STATE.md` §"Open Questions" — Stripe account type, bKash API access, Paddle pricing integration

### Prior Phase Context (MUST read)
- `.planning/phases/17-billing-integration/17-CONTEXT.md` — OrderService, OrderCompleted event, IPN handler integration, Billing Context
- `.planning/phases/32-v4-milestone/32-CONTEXT.md` — v4.0 module structure, API patterns, settings storage
- `.planning/phases/33-feature-flags-tier-enforcement/33-CONTEXT.md` — productPlans.features JSONB, platform dimension, admin UI patterns

### Existing Payment Code (MUST refactor)
- `src/lib/ssl-commerz.ts` (~171 lines) — SSL Commerz client, to be extracted into SSLCommerzAdapter
- `src/app/api/ssl-commerz/create-session/route.ts` (~152 lines) — Session creation, to use adapter
- `src/app/api/ssl-commerz/ipn/route.ts` (~110 lines) — IPN handler, to use adapter.verifyWebhook()
- `src/app/api/ssl-commerz/success/route.ts` — Success redirect
- `src/app/api/ssl-commerz/fail/route.ts` — Fail redirect
- `src/app/api/ssl-commerz/cancel/route.ts` — Cancel redirect
- `src/app/(portal)/actions/checkout.ts` (~439 lines) — Checkout server actions, to be refactored for multi-gateway
- `src/app/(admin)/actions/admin-settings.ts` (~554 lines) — Payment settings actions
- `src/app/(admin)/actions/admin-orders.ts` (~211 lines) — Admin order actions

### Existing UI Components (MUST restructure)
- `src/components/admin/PaymentSettingsForm.tsx` (~515 lines) — Admin payment settings UI
- `src/components/checkout/PaymentMethodGrid.tsx` (~80 lines) — Payment method selection
- `src/components/checkout/PaymentInstructions.tsx` (~157 lines) — Manual payment instructions
- `src/components/checkout/ManualPaymentForm.tsx` (~83 lines) — Manual payment form
- `src/components/admin/OrdersTable.tsx` (~421 lines) — Admin orders table
- `src/app/(portal)/dashboard/checkout/page.tsx` (~367 lines) — Checkout page

### Billing Module (MUST integrate)
- `src/modules/billing/application/services/OrderService.ts` (~52 lines) — completeOrder(), used by all payment paths
- `src/modules/billing/application/handlers/OrderCompletedHandler.ts` (~192 lines) — License generation on order completion
- `src/modules/billing/domain/events/OrderEvents.ts` (~50 lines) — OrderCompleted event

### Database Schema (MUST extend)
- `src/lib/db/schema.ts` lines 233-251 — `orders` table (add gatewayId, gatewayTransactionId, currency columns)
- `src/lib/db/schema.ts` lines 491-506 — `paymentAccounts` table (stays for manual methods)
- `src/lib/db/schema.ts` lines 508-515 — `settings` table (existing key-value for VAT etc)
- `src/lib/db/schema.ts` paymentMethodEnum — Change from enum to text

### Infrastructure (reuse)
- `src/lib/redis.ts` — Redis client + cache helpers (bKash token caching)
- `src/lib/audit.ts` — Audit logging
- `src/lib/module-init.ts` — Module registration at startup
- `src/shared/infrastructure/eventBus/EventBus.ts` — Event bus for domain events
- `src/modules/licensing/application/commands/GenerateLicenseHandler.ts` — License generation after order completion

### External API Documentation
- Paddle Billing API — https://developer.paddle.com/paddle/billing/overview
- bKash Tokenized Checkout API — https://developer.bka.sh/docs (v1.2.0-beta)
- SSL Commerz API — https://developer.sslcommerz.com/ (existing integration)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **OrderService.completeOrder()** — The single method that completes any order. All gateway paths converge here. No changes needed to this method — it already works for webhook-triggered and admin-verified orders.
- **OrderCompletedHandler** — Orchestrates license generation after order completion. Gateway-agnostic. All gateway webhooks call OrderService.completeOrder() which publishes OrderCompleted, triggering this handler.
- **SSL Commerz client** (`ssl-commerz.ts`) — 171 lines of battle-tested payment session creation and server-to-server validation. Becomes the core of SSLCommerzAdapter.
- **Existing IPN pattern** — Idempotent webhook handling with status check before processing. Every new gateway adapter must follow this pattern.
- **Redis cache helpers** — For bKash token caching (same pattern as validation cache).
- **PaymentSettingsForm** — 515 lines of admin payment UI. Restructure into two-tab layout. Manual tab stays similar; Automatic tab is new.
- **Checkout page + components** — Existing PaymentMethodGrid, ManualPaymentForm, PaymentInstructions. Extend with CurrencyToggle, GatewaySelector, per-gateway forms.

### Established Patterns
- **API route pattern** — POST handler, rate limit, parse body, validate input, call handler/service, return JSON.
- **DDD module layering** — `domain/` (interfaces, events), `application/` (services, registry), `infrastructure/adapters/` (gateway implementations).
- **Admin server actions** — `requireAdmin()` guard, FormData parsing, db operations, audit log, revalidatePath.
- **Settings-based config** — Gateway credentials stored in DB (encrypted), read at runtime, not hardcoded.
- **Event-driven architecture** — OrderCompleted event decouples payment from fulfillment.

### Integration Points
- **`src/modules/billing/`** — OrderService.completeOrder() is the convergence point for all payment paths.
- **`src/app/api/ssl-commerz/`** — 5 routes to refactor into SSLCommerzAdapter calls. Existing routes redirect or delegate.
- **`src/app/(portal)/actions/checkout.ts`** — createManualOrder() stays for manual methods. New gateway session creation via adapter.
- **`src/app/(admin)/actions/admin-settings.ts`** — savePaymentAccount(), saveSSLSettings() refactored. New saveGatewayConfig() for payment_gateways table.
- **`src/lib/db/schema.ts`** — Add payment_gateways + payment_webhook_events tables. Extend orders table. Change paymentMethod to text.
- **`src/lib/module-init.ts`** — Register GatewayRegistry and gateway adapters at startup.
- **Checkout page** — Currency toggle + gateway selector replace current single-method payment grid.

</code_context>

<specifics>
## Specific Ideas

- Gateway adapter file structure: `src/modules/payments/infrastructure/adapters/SSLCommerzAdapter.ts`, `PaddleAdapter.ts`, `BKashAdapter.ts`
- GatewayRegistry stores adapters in a Map<string, IPaymentGateway>. getActiveGateways() filters by DB active status and currency.
- PaymentService in application layer orchestrates: createOrder (pending) → adapter.createSession() → return session data to client. Webhook handler: adapter.verifyWebhook() → OrderService.completeOrder().
- AES-256 encryption utility at `src/modules/payments/infrastructure/crypto.ts`. Uses `ENCRYPTION_KEY` env var. Encrypt before DB write, decrypt on read. Key rotation via new env var.
- CurrencyToggle component: BDT | USD toggle buttons at top of checkout. Default detection: check user profile country first, then Accept-Language header. Stores selection in state.
- GatewaySelector renders different form components based on selected gateway. Conditional rendering via switch on gatewayId.
- bKash adapter token management: Redis key `bkash:api_token` with TTL from token response (3600s). Auto-refresh at 80% TTL (2880s). Token grant uses client_id + client_secret from encrypted config.
- Paddle price sync: on admin save plan action, after DB update, call Paddle POST /prices API with CF plan data. Store Paddle priceId in payment_gateways config for checkout reference.
- SSL Commerz redirect routes become thin wrappers: `/api/ssl-commerz/success` → redirect to `/dashboard/checkout/success?orderId=X`. Same for fail/cancel.
- paymentMethod column migration: ALTER COLUMN TYPE text, DROP enum. Drizzle migration with data preservation. Existing enum values become string values.
- Admin gateway card "Test Connection" per adapter: SSL Commerz calls validateSSLPayment with test data, Paddle calls GET /transactions with sandbox auth, bKash calls grantToken with sandbox credentials.

</specifics>

<deferred>
## Deferred Ideas

- **Stripe integration** — Deferred to post-v4.0. Paddle covers international payments. Stripe adapter can be added via same IPaymentGateway interface.
- **Subscription/recurring billing** — One-time payments only. Both Paddle and the adapter interface are designed to support subscriptions later without breaking changes.
- **Circuit breaker for gateway resilience** — Timeouts + clear error messages sufficient for v4.0. Circuit breaker adds complexity.
- **Background gateway health monitoring** — Manual "Test Connection" sufficient.
- **Webhook event reprocessing** — Read-only log for visibility. Admin can manually resolve issues.
- **Bidirectional refunds** — Admin-initiated only. Gateway-initiated refunds (chargebacks) not handled in v4.0.
- **Dynamic/configurable platform list** — Fixed set of gateways for v4.0.
- **Payment retry with saved card** — Customer retries manually. No card token storage.
- **Multi-currency per gateway** — BDT + USD dual pricing only. No dynamic FX conversion.
- **Payment analytics dashboard** — Webhook event log provides raw data. Dedicated analytics dashboard is a future enhancement.

</deferred>

---

*Phase: 34-multi-gateway-payment-system*
*Context gathered: 2026-06-10*
