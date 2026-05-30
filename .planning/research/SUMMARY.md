# Research Summary

**Project:** ConversionFlow v3.0 Self-Contained Licensing Architecture
**Researched:** 2026-05-29
**Overall Confidence:** HIGH

## Executive Summary

Four parallel research threads (Stack, Features, Architecture, Pitfalls) confirm that **ConversionFlow v3.0 can successfully transition from external licensing dependency to a fully self-contained system** using existing infrastructure (PostgreSQL, Drizzle ORM, Redis, BullMQ) with minimal new dependencies. The research validates a **Modular Monolith architecture with Domain-Driven Design (DDD)** as the optimal approach, providing clear domain boundaries (Licensing, Billing, Customers, Products, Analytics) while maintaining deployment simplicity.

## Key Findings Across All Research Threads

### Stack Research (HIGH confidence)
- **Minimal new dependencies required** — existing v2.x infrastructure supports 90% of v3.0 needs
- **Node.js built-in `crypto` module** is sufficient for license key generation (no external crypto library needed)
- **BullMQ already installed** — just needs expansion for license expiration checks and renewal reminders
- **No new database** — PostgreSQL with Drizzle ORM already supports required patterns
- **Total new packages**: 0-2 optional (job monitoring UI only)

### Features Research (MEDIUM confidence)
- **Well-established patterns** for WordPress plugin licensing systems exist
- **Table stakes identified**: License generation/validation, domain activation, activation limits, status management
- **Differentiators noted**: Offline validation (not required for MVP), advanced analytics, automated compliance
- **MVP recommendation**: Prioritize core licensing → enforcement → subscription lifecycle
- **Grace periods (7-30 days)** are standard practice to avoid service interruption

### Architecture Research (HIGH confidence)
- **Modular Monolith with DDD** provides optimal balance of maintainability and scalability
- **Five bounded contexts** identified: Licensing, Billing, Customers, Products, Analytics
- **Domain events** enable loose coupling between contexts
- **Service Layer + Repository Pattern** abstracts business logic and data access
- **Existing infrastructure** (PostgreSQL, Drizzle, Redis, BullMQ) supports all patterns

### Pitfalls Research (HIGH confidence)
- **18 domain-specific pitfalls** identified across security, correctness, performance, and operations
- **5 critical pitfalls** that can cause rewrites or security breaches:
  1. License key predictability (must use `crypto.randomBytes()`)
  2. Race conditions in activation (requires atomic DB operations)
  3. Time-based expiration edge cases (requires UTC + grace period)
  4. Data migration corruption (requires verification strategy)
  5. Domain activation bypass via headers (requires DNS/file/meta tag verification)
- **Phase-specific warnings** provided for each development phase
- **Security checklist** with 15 verification items

## Stack Additions (from STACK.md)

### Zero new core dependencies needed:
| Technology | Purpose | Notes |
|------------|---------|-------|
| Node.js `crypto` module | License key generation/validation | Built-in, zero dependencies |
| `EventEmitter` | In-memory event bus | Built-in Node.js module |
| Redis Pub/Sub | Cross-process events | Already have `ioredis` installed |
| BullMQ | Background jobs (expiration, renewals) | Already installed, needs expansion |

### Optional additions (not blocking):
| Technology | Purpose | When to Add |
|------------|---------|-------------|
| `bullmq-board` | Job monitoring UI | When background job complexity increases |

## Architecture Blueprint (from ARCHITECTURE.md)

### Bounded Context Structure:
```
src/
├── modules/
│   ├── licensing/         # License generation, validation, activation
│   ├── billing/           # Order processing, payment, invoices
│   ├── customers/         # Customer profiles, activity tracking
│   ├── products/          # Product catalog, plans, versions
│   └── analytics/         # Revenue metrics, license analytics
├── shared/                # Shared kernel (DB, Redis, event bus)
└── app/                   # Next.js App Router (thin layer)
```

### Build Order (Dependency Chain):
1. **Shared Infrastructure** — Event bus, repositories base, value objects
2. **Products Bounded Context** — Foundation for other contexts (read-only dependency)
3. **Customers Bounded Context** — Wraps existing Better Auth users
4. **Licensing Bounded Context** — Core v3.0 functionality, depends on Products + Customers
5. **Billing Bounded Context** — Refactor existing checkout, integrate with Licensing via events
6. **Analytics Bounded Context** — Subscribe to all events for BI aggregations
7. **Cleanup** — Remove `central-api.ts`, `centralOrderId`, `centralLicenseId`, `centralUserId` fields

### Critical Integration Points:
- `src/lib/central-api.ts` → Replace with Licensing Context services
- Webhook handlers → Replace with domain event handlers
- Checkout actions (`checkout.ts`) → Refactor into Billing Context services
- License actions (`admin-licenses.ts`) → Move into Licensing Context

## Feature Landscape (from FEATURES.md)

### Table Stakes (Must-Have):
- License Key Generation (XXXX-XXXX-XXXX-XXXX format)
- License Validation API (activate, deactivate, check endpoints)
- Domain-Based Activation (with normalization)
- Activation Limits (enforced per plan)
- License Status Management (active, expired, revoked, suspended)
- Customer Portal (view keys, manage activations)
- Subscription Expiry Tracking with Grace Periods
- Admin Dashboard (manage all entities)

### Differentiators (Nice-to-Have):
- Cryptographic Offline Validation (defer post-MVP)
- Real-time Analytics Dashboard
- Hardware Fingerprinting (defer post-MVP)
- Multi-Product License Keys
- License Transfer System

### Anti-Features (Explicitly NOT Building):
- Phone-home every request (use caching instead)
- Obscure key formats (use standard segmented format)
- Silent revocation (always notify customers)
- Central API dependency (being removed in v3.0)

## Critical Pitfalls (from PITFALLS.md)

### 5 Critical Pitfalls (must address in Phase 1):

1. **License Key Predictability** — Use `crypto.randomBytes()` only, never `Math.random()` or timestamps
2. **Race Conditions in Activation** — Use atomic DB operations: `UPDATE licenses SET currentActivations = currentActivations + 1 WHERE id = ? AND currentActivations < maxActivations`
3. **Time-Based Expiration Edge Cases** — UTC-only comparisons with 7-30 day grace period
4. **Data Migration Corruption** — Verify counts, dry-run on production snapshot, rollback plan
5. **Domain Activation Bypass** — Require DNS/file/meta tag verification, never trust HTTP headers

### Security Checklist (15 items):
- [ ] License key generation uses `crypto.randomBytes()`
- [ ] License keys have UNIQUE database constraint
- [ ] Activation/deactivation uses atomic DB operations
- [ ] All timestamps in UTC
- [ ] Grace period implemented (7-30 days)
- [ ] Domain verification required (DNS/file/meta tag)
- [ ] Validation cache has short TTL (5-15 min) with invalidation
- [ ] Public API rate limited (100 req/min per IP)
- [ ] Audit log records all operations (immutable)
- [ ] Migration has verification and rollback plan
- [ ] Dashboard queries have proper indexes
- [ ] Expiration notifications configured
- [ ] License transfer mechanism exists
- [ ] Load tested for 10K+ concurrent validations

## Recommended Roadmap Structure

Based on all research threads, the v3.0 milestone should be structured into **5-7 phases**:

### Phase 1: Shared Infrastructure
- Database schema additions (products, product_plans, product_versions, license_activations)
- Event bus implementation (EventEmitter for in-process, Redis Pub/Sub for cross-process)
- Repository base interfaces and implementations
- Shared value objects (LicenseKey, Money, Email)

### Phase 2: Products Bounded Context
- Product domain entities and repository
- Product application services (CRUD)
- Product API routes (admin)
- Seed data migration

### Phase 3: Licensing Bounded Context (Core)
- License domain entities and value objects
- Local license key generation algorithm (`crypto.randomBytes()`)
- License validation service (with caching, rate limiting)
- License activation service (atomic operations, domain verification)
- License events and handlers
- Public license validation API

### Phase 4: Customer & Billing Integration
- Refactor checkout actions into Billing Context services
- OrderCompleted event → License generation
- Invoice generation
- Payment webhook handlers (existing SSL Commerz, bKash integration)

### Phase 5: Subscription Management
- Subscription expiry tracking with grace periods
- Renewal processing
- Expiration notification background job
- Lifetime license support

### Phase 6: Portal & Dashboard Enhancements
- Customer portal license management UI
- Admin dashboard license intelligence
- License transfer mechanism
- Audit trail viewer

### Phase 7: Migration & Cleanup
- Data migration from central API (with verification)
- Feature flag rollout (10% → 25% → 50% → 100%)
- Remove `central-api.ts`, `centralOrderId`, `centralLicenseId`, `centralUserId`
- Remove webhook handlers for central API

## Open Questions to Resolve

1. **License key format specifics** — Finalize exact format (segment length, prefix, checksum validation)
2. **Secret key management** — How to store and rotate license signing secrets securely
3. **Domain normalization** — How to handle www vs non-www, http vs https variations
4. **Public API authentication** — API token scheme for external license validation calls
5. **Grace period configuration** — Per-plan or global configuration
6. **DNS verification provider** — Use built-in `dns` module or external DoH service
7. **Staging/dev environment handling** — Whitelist development domains without counting against limits

## Migration Strategy (from PITFALLS.md)

### Data Migration Plan:
1. Add new columns to local tables for any central API fields not present
2. Create `licenses_migration` temp table
3. Run import with `ON CONFLICT DO UPDATE` for duplicates
4. Create mapping table: `central_id_map (central_license_id, local_license_id)`
5. Verify counts match between source and target
6. Feature flag rollout with gradual traffic migration
7. Keep central API read-only for 30 days
8. Remove `centralOrderId`, `centralLicenseId`, `centralUserId` columns

## Performance Considerations

| Metric | 500 licenses | 10K licenses | 100K licenses |
|--------|--------------|--------------|---------------|
| License validation | Direct DB queries fine | Add Redis caching (5-15 min TTL) | Read replica + cache warming |
| Activation checks | In-memory counter | Redis counters per license | Redis cluster, sharded by prefix |
| Expiration jobs | Single worker, daily | Single worker, daily | Multiple workers, sharded |
| Event handling | In-memory event bus | In-memory fine | Consider Redis Streams |

## Sources

All four research threads cite authoritative sources:
- **Stack**: Existing v2.0 codebase audit, Node.js crypto documentation, BullMQ docs
- **Features**: EDD Software Licensing, Keygen documentation, WooCommerce license manager patterns
- **Architecture**: Modular Monolith DDD references, Next.js service layer patterns, Repository pattern implementations
- **Pitfalls**: Codebase audit (`central-api.ts`, `schema.ts`), OWASP security guidelines, distributed systems best practices

---
*Research completed: 2026-05-29*
*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
