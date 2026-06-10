# Phase 34: Multi-Gateway Payment System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-10
**Phase:** 34-multi-gateway-payment-system
**Areas discussed:** Gateway Abstraction Design, Stripe & Paddle Integration Model, bKash API & Checkout UX, Admin Settings UI & Webhook Architecture, Refund & Chargeback Flow, Order Schema Changes, Invoice & Receipt Model, Paddle Price Catalog Sync, Checkout Success Flow, Payment Method Enum Strategy, Portal Billing & History UX, Admin Order Management Updates, bKash SDK Loading Strategy, Tax/VAT Dual Model, Secrets Management, Implementation Order/Phasing, External API Resilience, Checkout Component Architecture, Order Creation Unification, Gateway Activation Flow

---

## Gateway Abstraction Design

| Option | Description | Selected |
|--------|-------------|----------|
| Full Lifecycle | Interface covers createSession, verifyPayment, handleWebhook, processRefund, getPaymentStatus | ✓ |
| Payment + Webhook Only | Only createSession() + verifyWebhook(). Refunds stay gateway-specific | |
| Dual Interface (Auto + Manual) | Separate interfaces for automatic and manual gateways | |

**User's choice:** Full Lifecycle
**Notes:** Most flexible — each gateway implements all methods. More upfront work but future-proofs the system.

| Option | Description | Selected |
|--------|-------------|----------|
| New Payments Module | Create src/modules/payments/ bounded context with DDD layers | ✓ |
| Inside Billing Module | Add adapters inside src/modules/billing/infrastructure/adapters/ | |

**User's choice:** New Payments Module

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Table | New payment_gateways table with JSONB config, encrypted credentials | ✓ |
| Existing Settings Table | Keep using settings key-value table for all gateway config | |
| Hybrid (Table + Settings) | payment_gateways for metadata + settings for credentials | |

**User's choice:** Dedicated Table

| Option | Description | Selected |
|--------|-------------|----------|
| Customer Selects | Customer picks gateway in checkout. Currency-aware filtering. | ✓ |
| Auto-Route by Currency | System auto-selects gateway based on currency and amount. | |

**User's choice:** Customer Selects

| Option | Description | Selected |
|--------|-------------|----------|
| Typed Error Categories | PaymentGatewayError with NETWORK_ERROR, INVALID_CONFIG, PAYMENT_FAILED, etc. | ✓ |
| Result Objects (No Exceptions) | Every method returns { ok, data?, error? }. No exceptions. | |

**User's choice:** Typed Error Categories

| Option | Description | Selected |
|--------|-------------|----------|
| Idempotent + Event Log | Webhook handlers idempotent + payment_webhook_events table for raw payloads | ✓ |
| Idempotent Only | Just idempotent handlers, no webhook event log | |

**User's choice:** Idempotent + Event Log

| Option | Description | Selected |
|--------|-------------|----------|
| Per-Gateway Toggle | Each gateway has testMode boolean in payment_gateways table | ✓ |
| Global Platform Toggle | PLATFORM_TEST_MODE env var puts all gateways in sandbox | |

**User's choice:** Per-Gateway Toggle

| Option | Description | Selected |
|--------|-------------|----------|
| Self-Register in Module Init | Adapters register via GatewayRegistry in module-init.ts | ✓ |
| Central Config Map | Central file maps gatewayId to adapter class | |

**User's choice:** Self-Register in Module Init

| Option | Description | Selected |
|--------|-------------|----------|
| Extract SSL Commerz into Adapter | Refactor existing SSL Commerz code into SSLCommerzAdapter | ✓ |
| Leave SSL Commerz As-Is | Keep SSL Commerz in current routes, only new gateways use abstraction | |

**User's choice:** Extract SSL Commerz into Adapter

---

## Stripe & Paddle Integration Model

| Option | Description | Selected |
|--------|-------------|----------|
| Checkout Sessions | Redirect to Stripe-hosted payment page. PCI-compliant. | (moot — Stripe deferred) |
| Payment Intents (Custom UI) | Collect card details on-site via Stripe Elements. More control. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Paddle Billing (New API) | Modern REST API, transaction-based model, released 2023+ | ✓ |
| Paddle Classic (Legacy) | Legacy checkout system, deprecated path | |

**User's choice:** Paddle Billing (New API)

| Option | Description | Selected |
|--------|-------------|----------|
| Hosted Checkout | Redirect to Paddle payment page. Matches SSL Commerz pattern. | ✓ |
| Inline Checkout | Paddle checkout appears inline in our page via iframe | |

**User's choice:** Hosted Checkout

| Option | Description | Selected |
|--------|-------------|----------|
| One-Time Only for Now | Build one-time payment support only. Subscriptions deferred. | ✓ |
| Include Subscriptions Now | Build subscription support for Stripe and Paddle in Phase 34 | |

**User's choice:** One-Time Only for Now

| Option | Description | Selected |
|--------|-------------|----------|
| Paddle Owns Transaction | Local order points to Paddle transaction_id. Paddle issues invoice. | ✓ |
| We Own Order, Paddle Processes | We create order first, Paddle is just payment processor. | |

**User's choice:** Paddle Owns Transaction

| Option | Description | Selected |
|--------|-------------|----------|
| BDT + USD Dual Pricing | BDT gateways for BD, USD gateways for international. Currency determines visible gateways. | ✓ |
| Multi-Currency Per Gateway | All gateways process in all currencies. More complex FX logic. | |

**User's choice:** BDT + USD Dual Pricing

| Option | Description | Selected |
|--------|-------------|----------|
| Standard Account | Direct Stripe account, requires BD business registration | |
| Decide Later, Build Now | Build integration, decide on account later | |
| Stripe Deferred, Paddle Only | Skip Stripe for v4.0, Paddle handles all international | ✓ |

**User's choice:** Stripe Deferred, Paddle Only — Bangladesh not in Stripe supported countries.

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal Set (6 events) | Paddle: transaction.completed, payment_failed, refunded | ✓ |
| Extended Event Set | Include dispute/chargeback and subscription events | |

**User's choice:** Minimal Set

---

## bKash API & Checkout UX

| Option | Description | Selected |
|--------|-------------|----------|
| Tokenized Checkout | Inline OTP popup, no redirect. Best UX for BD customers. | ✓ |
| Standard Checkout (Redirect) | Redirect to bKash payment page. Simpler but less seamless. | |

**User's choice:** Tokenized Checkout

| Option | Description | Selected |
|--------|-------------|----------|
| Build Adapter + Test with Sandbox | Full adapter coded and tested with bKash sandbox. | ✓ |
| Stub Only, Activate Later | Adapter structure with stubbed responses | |

**User's choice:** Build Adapter + Test with Sandbox

| Option | Description | Selected |
|--------|-------------|----------|
| Currency-First, Then Gateway | Customer picks BDT/USD first, then sees relevant gateways only | ✓ |
| All Gateways, Currency-Grouped | Show all gateways grouped by currency in single step | |
| Auto-Detect + Override | Detect currency from geo/profile, customer can override | |

**User's choice:** Currency-First, Then Gateway

| Option | Description | Selected |
|--------|-------------|----------|
| Separate Entry | bKash (Auto) alongside manual bKash if admin enables both | ✓ |
| Unified Entry (Auto Fallback) | Single bKash entry that uses auto if configured, manual otherwise | |

**User's choice:** Separate Entry

| Option | Description | Selected |
|--------|-------------|----------|
| Redis Cache with Auto-Refresh | Store tokens in Redis with TTL, auto-refresh before expiry | ✓ |
| Fresh Token Per Session | Request new token for each checkout session | |

**User's choice:** Redis Cache with Auto-Refresh

| Option | Description | Selected |
|--------|-------------|----------|
| Inline Error + Retry | Show error on checkout, keep form data, retry immediately | ✓ |
| Dedicated Failed Page | Redirect to separate payment failed page | |

**User's choice:** Inline Error + Retry

| Option | Description | Selected |
|--------|-------------|----------|
| bKash SDK Handles OTP | bKash JS SDK renders OTP popup natively | ✓ |
| Custom OTP Input | We build custom OTP input and send to bKash API | |

**User's choice:** bKash SDK Handles OTP

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle Switch | BDT/USD toggle at top of payment section, updates in-place | ✓ |
| Separate Pages | Two separate checkout routes for BDT and USD | |

**User's choice:** Toggle Switch

---

## Admin Settings UI & Webhook Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Two-Tab Layout | Manual Payments and Automatic Gateways tabs | ✓ |
| Single Page Sections | Manual gateways on top, Automatic below, single scroll | |

**User's choice:** Two-Tab Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Card with Status + Test | Enable/disable toggle, credentials form, test mode, Test Connection | ✓ |
| Modal Configuration | Gateway config via modal dialog | |

**User's choice:** Card with Status + Test

| Option | Description | Selected |
|--------|-------------|----------|
| Per-Gateway Routes | /api/webhooks/sslcommerz, /api/webhooks/paddle, /api/webhooks/bkash | ✓ |
| Unified Single Route | Single /api/webhooks/payment route with gateway parameter | |

**User's choice:** Per-Gateway Routes

| Option | Description | Selected |
|--------|-------------|----------|
| Adapter Handles Auth | Each adapter implements its own verification method | ✓ |
| Route Layer + Adapter Auth | Route does basic auth then adapter does gateway-specific | |

**User's choice:** Adapter Handles Auth

| Option | Description | Selected |
|--------|-------------|----------|
| Read-Only Log Table | Admin sees webhook events with timestamp, gateway, type, status | ✓ |
| Full Management UI | List, detail, raw payload, reprocess button | |

**User's choice:** Read-Only Log Table

| Option | Description | Selected |
|--------|-------------|----------|
| Manual Test Only | Test Connection button on gateway cards. No background monitoring. | ✓ |
| Background Health Monitoring | Cron job pings gateway health endpoints periodically | |

**User's choice:** Manual Test Only

---

## Refund & Chargeback Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Admin-Initiated via Gateway | Admin refund via gateway API, webhook confirms, license revoked | ✓ |
| Bidirectional (Admin + Gateway) | Support both admin-initiated and gateway-initiated refunds | |

**User's choice:** Admin-Initiated via Gateway

---

## Order Schema Changes

| Option | Description | Selected |
|--------|-------------|----------|
| Extend Existing Orders Table | Add nullable gatewayId, gatewayTransactionId, currency columns | ✓ |
| New Payment Transactions Table | Separate table for gateway-specific data | |

**User's choice:** Extend Existing Orders Table

---

## Invoice & Receipt Model

| Option | Description | Selected |
|--------|-------------|----------|
| Gateway-Dependent | Paddle: link to receipt. SSL/bKash: local PDF. No duplicates. | ✓ |
| Always Local Invoice | Generate local PDF regardless of gateway | |

**User's choice:** Gateway-Dependent

---

## Paddle Price Catalog Sync

| Option | Description | Selected |
|--------|-------------|----------|
| CF Owns Prices, Sync to Paddle | Admin manages in product_plans, syncs to Paddle Prices API | ✓ |
| Paddle Owns Prices | Prices managed in Paddle dashboard, fetched for checkout | |

**User's choice:** CF Owns Prices, Sync to Paddle

---

## Checkout Success Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Unified Success Page | All gateways redirect to /dashboard/checkout/success?orderId=X | ✓ |
| Gateway-Specific Handlers + Redirect | Each gateway has own success handler | |

**User's choice:** Unified Success Page

---

## Payment Method Enum Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| String-Based | Switch from enum to text. No migration for new gateways. | ✓ |
| Expand Enum | Add new values to enum, requires Drizzle migration | |

**User's choice:** String-Based

---

## Portal Billing & History UX

| Option | Description | Selected |
|--------|-------------|----------|
| Unified List, Gateway-Aware Actions | Paddle: receipt link. SSL/bKash: local PDF. Single list. | ✓ |
| Separate Sections per Gateway | Different portal sections for local and Paddle orders | |

**User's choice:** Unified List, Gateway-Aware Actions

---

## Admin Order Management Updates

| Option | Description | Selected |
|--------|-------------|----------|
| Gateway Column + Detail Panel | Gateway column, detail panel with transaction info | ✓ |
| Separate Views per Gateway | Each gateway gets own admin order view | |

**User's choice:** Gateway Column + Detail Panel

---

## bKash SDK Loading Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| On-Demand Loading | Load SDK only when bKash API selected. ~200KB saved. | ✓ |
| Always Preload | Load SDK on every checkout page | |

**User's choice:** On-Demand Loading

---

## Tax/VAT Dual Model

| Option | Description | Selected |
|--------|-------------|----------|
| Skip VAT for Paddle, Keep for BDT | Paddle handles tax as MoR. Our VAT only for BDT orders. | ✓ |
| Show VAT Always (Informational) | Always show our VAT, informational for Paddle orders | |

**User's choice:** Skip VAT for Paddle, Keep for BDT

---

## Secrets Management

| Option | Description | Selected |
|--------|-------------|----------|
| Encrypted in DB | AES-256 encryption with ENCRYPTION_KEY env var | ✓ |
| Environment Variables Only | All secrets in env vars, no admin UI for credentials | |

**User's choice:** Encrypted in DB

---

## Implementation Order/Phasing

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential (5 Plans) | (1) Core + schema, (2) SSL extraction, (3) Paddle, (4) bKash, (5) Admin + checkout UI | ✓ |
| 3-Plan Batch | (1) Core + SSL, (2) Paddle + bKash, (3) All UI | |

**User's choice:** Sequential (5 Plans)

---

## External API Resilience

| Option | Description | Selected |
|--------|-------------|----------|
| Timeouts + Clear Error | Per-adapter timeouts. Customer sees error + can switch gateway. | ✓ |
| Circuit Breaker | Auto-disable gateway after N consecutive failures | |

**User's choice:** Timeouts + Clear Error

---

## Checkout Component Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-Components per Gateway | CurrencyToggle, GatewaySelector, per-gateway forms | ✓ |
| Single Component + Conditionals | One large checkout component with conditional rendering | |

**User's choice:** Sub-Components per Gateway

---

## Order Creation Unification

| Option | Description | Selected |
|--------|-------------|----------|
| Unified Lifecycle, Different Triggers | Pending first for all. Webhook or admin verify triggers completion. | ✓ |
| Automatic Orders on Success Only | No pending state for automatic gateways | |

**User's choice:** Unified Lifecycle, Different Triggers

---

## Gateway Activation Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Draft -> Test -> Live | Three states. Admin must explicitly activate. Prevents misconfig. | ✓ |
| Simple Enable/Disable Toggle | Admin responsible for testing before enabling | |

**User's choice:** Draft -> Test -> Live

---

## Claude's Discretion

- Exact TypeScript interface definitions
- GatewayRegistry implementation details
- AES-256 encryption utility implementation
- Paddle API client details
- bKash Tokenized Checkout API integration details
- Drizzle schema for new tables
- SSL Commerz route redirect strategy
- CurrencyToggle default detection logic
- GatewaySelector filtering logic
- Admin webhook log page layout
- paymentMethodEnum to text migration
- Paddle price sync upsert strategy
- bKash SDK CDN URL and version
- Checkout responsive design for mobile
- Error message copy per gateway
- Test Connection implementation per adapter

## Deferred Ideas

- Stripe integration — deferred to post-v4.0
- Subscription/recurring billing — deferred to future phase
- Circuit breaker pattern — too complex for v4.0
- Background gateway health monitoring — manual test sufficient
- Webhook event reprocessing UI — read-only log for now
- Bidirectional refunds (chargebacks) — admin-initiated only
- Payment retry with saved card — customer retries manually
- Multi-currency per gateway — BDT + USD only
- Payment analytics dashboard — future enhancement
