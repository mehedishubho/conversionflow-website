# Phase 15: Products Bounded Context - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 15-products-context
**Areas discussed:** Product scope & structure, Plan pricing & licensing model, Version management depth, Feature flags & plan differentiation

---

## Product Scope & Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-product ready | Schema and UI designed for multiple products from day one | ✓ |
| Single product only | One row in products table, UI assumes single product | |
| No product entity | Skip products table, keep hardcoded approach | |

**User's choice:** Multi-product ready — future-proof without much added complexity.

| Option | Description | Selected |
|--------|-------------|----------|
| Product → Plans + Versions | Standard SaaS hierarchy, each product has plans and versions | ✓ |
| Plan = Product (flat) | Each tier is its own product, breaks down with multiple products | |

**User's choice:** Product → Plans + Versions (standard hierarchy).

---

## Plan Pricing & Licensing Model

| Option | Description | Selected |
|--------|-------------|----------|
| Dual currency BDT+USD | Each plan stores both prices, BDT default with USD toggle | ✓ |
| BDT primary, USD display-only | Priced in BDT, USD shown as approximate conversion | |
| USD primary, BDT converted | Priced in USD, BDT converted at checkout | |

**User's choice:** Dual currency BDT+USD — Money value object already supports both.

| Option | Description | Selected |
|--------|-------------|----------|
| Lifetime + Subscription | Plans can be lifetime or subscription, admin picks per plan | ✓ |
| Duration-based only | All plans have fixed durations, no recurring billing | |
| One-time purchase only | No recurring, all plans are single purchase with validity period | |

**User's choice:** Lifetime + Subscription — supports current tiers and future subscription models.

| Option | Description | Selected |
|--------|-------------|----------|
| Per-plan activation limit | maxActivations field per plan (1, 3, 0 for unlimited) | ✓ |
| Predefined activation tiers | Fixed tiers (single, small-team, unlimited) | |
| Unlimited for all plans | No activation limits on any plan | |

**User's choice:** Per-plan activation limit — simple integer field, admin sets per plan.

---

## Version Management Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Full version tracking | Version number, download URL, changelog, release date, stable/beta status | ✓ |
| Simple version+URL only | Just version number and download URL, no changelog or status | |
| No version management | Keep current latest-version-only approach | |

**User's choice:** Full version tracking — complete lifecycle management for software releases.

---

## Feature Flags & Plan Differentiation

| Option | Description | Selected |
|--------|-------------|----------|
| Named feature flags | JSONB features field with named boolean flags, admin toggles per plan | ✓ |
| No flags — price/limit only | Plans differ only by price, activation limit, and duration | |
| Feature table per plan | Separate plan_features table with structured rows | |

**User's choice:** Named feature flags via JSONB — extensible without schema changes.

---

## Claude's Discretion

- Exact database column types and constraints
- Domain entity class structure within DDD layers
- Admin UI component choices (table vs card layout, form design)
- How to seed initial ConversionFlow product with 3 plans
- Event types to emit from this bounded context

## Deferred Ideas

None — discussion stayed within phase scope.
