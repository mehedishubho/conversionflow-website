---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Self-Contained Licensing Architecture
status: executing
stopped_at: Completed 19-03-PLAN.md
last_updated: "2026-06-03T17:36:08Z"
last_activity: 2026-06-03
progress:
  total_phases: 13
  completed_phases: 0
  total_plans: 4
  completed_plans: 3
---

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-29)

**Core value:** A production-grade, self-contained licensing platform where Bangladeshi WooCommerce store owners purchase ConversionFlow licenses, manage billing and downloads, get support — while Devsroom operators gain real-time business intelligence, revenue analytics, and complete control over the licensing lifecycle. All licensing operations are managed directly within ConversionFlow without external dependencies.

**Current focus:** Phase 19 — portal-analytics

## Current Position

Phase: 19 (portal-analytics) — EXECUTING
Plan: 4 of 4
**Phase:** 19
**Plan:** 03 complete, 04 next
**Status:** Executing Phase 19
**Last activity:** 2026-06-03

```
v3.0 Progress: [░░░░░░░░░░] 0%
```

**Phase 14 Goals:**

- Organize codebase into modular monolith with DDD bounded contexts
- Implement event bus (EventEmitter + Redis Pub/Sub)
- Create repository base classes and interfaces
- Define shared value objects (LicenseKey, Money, Email, Domain)
- Enforce module boundaries via import rules

## Performance Metrics

**Velocity:**

- Total plans completed: 67 (v1.0/v1.1/v2.0/v2.1 milestones)
- v3.0 plans completed: 0
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Status | Notes |
|-------|-------|--------|-------|
| v1.0 Phases 1-4 | 13/13 | Complete | Shipped 2026-05-11 |
| v1.1 Phases 5-10 | 15/15 | Complete | Shipped 2026-05-14 |
| v2.0 Phase 1 | 4/4 | Complete | Foundation: DB, auth, routes, admin setup |
| v2.0 Phase 2 | 3/3 | Verified | Dashboard shell, TailAdmin port, UAT 9/9 |
| v2.0 Phase 3 | 5/5 | Verified | Customer Portal, UAT 6/6, route fix |
| v2.0 Phase 4 | 6/6 | Executed (UAT pending) | Checkout and Payments |
| v2.0 Phase 5 | 6/6 | Complete | Admin BI Dashboard |
| v2.0 Phase 6 | 4/4 | Complete | Webhooks, Jobs, License Intelligence |
| v2.1 Phase 9 | 3/3 | Complete | Settings Foundation |
| v2.1 Phase 10 | 5/5 | Complete | Core SEO Configuration |
| v2.1 Phase 11 | 5/5 | Complete | Tracking Pixels & Social SEO |
| v2.1 Phase 12 | 5/5 | Complete | Advanced SEO Controls |
| v2.1 Phase 13 | 3/3 | Complete | SEO Analytics Dashboard |
| v3.0 Phase 14 | 0/TBD | Not Started | Shared DDD Infrastructure |
| v3.0 Phase 15 | 0/TBD | Not Started | Products Bounded Context |
| v3.0 Phase 16 | 0/TBD | Not Started | Licensing Core (Generation & Validation) |
| v3.0 Phase 17 | 0/TBD | Not Started | Customer & Billing Integration |
| v3.0 Phase 18 | 0/TBD | Not Started | Subscription & Status Management |
| v3.0 Phase 19 | 0/TBD | Not Started | Portal & Analytics Enhancements |
| v3.0 Phase 20 | 0/TBD | Not Started | Migration & External API Removal |

## Accumulated Context

### Decisions

Decisions are logged in `PROJECT.md` Key Decisions table.

Recent decisions affecting current work:

- [v3.0]: Self-contained licensing — no external dependencies, complete control
- [v3.0]: Modular Monolith + DDD — scalable architecture with clear domain boundaries
- [v3.0]: Service Layer Pattern — business logic abstraction, testability
- [v3.0]: Repository Pattern — data access abstraction, easier testing
- [v3.0]: Local license generation — crypto.randomBytes(), no external API calls
- [v3.0]: Grace periods (7-30 days) — avoid service interruption
- [v3.0]: Feature flag rollout — safe migration, gradual traffic shift
- [v2.1]: SEO Analytics Dashboard — 404 tracking, sitemap health, crawl issues
- [v2.1]: Advanced SEO Controls — redirects, AI bots, image/performance SEO
- [v2.1]: Tracking Pixels & Social SEO — Meta CAPI, TikTok, Google Analytics, Schema
- [v2.1]: Core SEO Configuration — general settings, verification, sitemaps, robots.txt

### Architecture Blueprint

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

### Build Order

1. **Shared Infrastructure** (Phase 14) — Event bus, repositories, value objects
2. **Products Bounded Context** (Phase 15) — Foundation for other contexts
3. **Licensing Bounded Context** (Phase 16) — Core v3.0 functionality
4. **Billing Bounded Context** (Phase 17) — Checkout refactor, event integration
5. **Subscription Management** (Phase 18) — Expiry, grace periods, renewals
6. **Portal & Analytics** (Phase 19) — UI enhancements, dashboards
7. **Migration & Cleanup** (Phase 20) — Data migration, remove central API deps

### Critical Security Considerations

**5 Critical Pitfalls to Address in Phase 14-16:**

1. **License Key Predictability** — MUST use `crypto.randomBytes()` only, never `Math.random()` or timestamps
2. **Race Conditions in Activation** — MUST use atomic DB operations for activation counting
3. **Time-Based Expiration Edge Cases** — MUST use UTC-only comparisons with grace period
4. **Data Migration Corruption** — MUST have verification, dry-run, rollback plan
5. **Domain Activation Bypass** — MUST require DNS/file/meta tag verification, never trust HTTP headers

### Requirements Coverage

**Total v3.0 Requirements:** 47 requirements across 10 categories

**Requirements by Category:**

- PROD (Products): 7 requirements → Phase 15
- LGEN (License Generation): 9 requirements → Phase 16
- ACT (Activation): 8 requirements → Phase 16
- LSTAT (License Status): 7 requirements → Phase 17, 18
- ARCH (Architecture): 10 requirements → Phase 14, 17, 20
- ANLT (Analytics): 5 requirements → Phase 19
- API (Public API): 5 requirements → Phase 16
- JOBS (Background Jobs): 4 requirements → Phase 18, 19
- XFER (Transfer): 4 requirements → Phase 19

**Coverage:** 47/47 requirements mapped to phases ✓

### Pending Todos

**v3.0 Roadmap:**

- [ ] Plan Phase 14: Shared DDD Infrastructure
- [ ] Plan Phase 15: Products Bounded Context
- [ ] Plan Phase 16: Licensing Core (Generation & Validation)
- [ ] Plan Phase 17: Customer & Billing Integration
- [ ] Plan Phase 18: Subscription & Status Management
- [ ] Plan Phase 19: Portal & Analytics Enhancements
- [ ] Plan Phase 20: Migration & External API Removal

### Technical Debt Accumulated

**v2.x Debt (to be addressed in v3.0):**

- External dependency on license.devsroom.com for license generation
- centralOrderId, centralLicenseId, centralUserId fields in database
- src/lib/central-api.ts file with external API client
- Webhook handlers for central license API events
- License actions scattered across admin routes

**v3.0 Debt Reduction Plan:**

- Phase 14-16: Build local licensing infrastructure
- Phase 17: Refactor billing to use local license generation
- Phase 20: Remove all external API dependencies and database fields

### Open Questions

1. **License key format specifics** — Finalize exact format (segment length, prefix, checksum validation)
2. **Secret key management** — How to store and rotate license signing secrets securely
3. **Domain normalization** — How to handle www vs non-www, http vs https variations
4. **Public API authentication** — API token scheme for external license validation calls
5. **Grace period configuration** — Per-plan or global configuration
6. **DNS verification provider** — Use built-in `dns` module or external DoH service
7. **Staging/dev environment handling** — Whitelist development domains without counting against limits

## Session Continuity

**Last session:** 2026-06-03T17:36:08Z
**Stopped at:** Completed 19-03-PLAN.md
**Resume file:** .planning/phases/19-portal-analytics/19-03-SUMMARY.md

**Current session:** 2026-06-03
**Stopped at:** Phase 19 Plan 03 complete, Plan 04 next
**Resume action:** `/gsd-execute-phase 19 plan 04`

### What "Done" Looks Like for v3.0

**Success Criteria:**

- [ ] License generation is completely local with no external API calls
- [ ] Public validation API is available with rate limiting and caching
- [ ] Domain activation with verification is implemented
- [ ] Subscription lifecycle with grace periods is working
- [ ] Analytics dashboards show license and revenue metrics
- [ ] All data from external API is migrated successfully
- [ ] centralOrderId, centralLicenseId, centralUserId fields are removed
- [ ] src/lib/central-api.ts file is deleted
- [ ] Webhook handlers for central API are removed

### Risk Assessment

**Technical Risks:**

- Data migration complexity (mitigated by verification strategy and feature flags)
- Race conditions in activation (mitigated by atomic DB operations)
- Key predictability (mitigated by crypto.randomBytes())

**Operational Risks:**

- Downtime during migration (mitigated by gradual feature flag rollout)
- Service interruption for existing customers (mitigated by grace period)
