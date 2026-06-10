# Phase 33: Feature Flags & Tier Enforcement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md ― this log preserves the alternatives considered.

**Date:** 2026-06-10
**Phase:** 33-feature-flags-tier-enforcement
**Areas discussed:** Feature data model, Admin platform toggle matrix, Validate endpoint + SDK integration, Customer portal feature display

---

## Feature Data Model

| Option | Description | Selected |
|--------||--------------|------кона |
| All features per-platform | Every feature key maps to { wordpress: boolean, laravel: boolean, shopify: boolean, nextjs: boolean } | ✉ |
| Hybrid: global + per-platform | Most features are global bools, only platform-specific ones get nested | |
| Separate columns (backwards compat) | Keep features as flat Record<string, boolean>, add separate platform_features column | |

**User's choice:** All features per-platform (full matrix)

## Platform List

| Option | Description | Selected |
|-------||--------------|---------n|
| Fixed 4 platforms (wordpress, laravel, shopify, nextjs) | Hardcoded, simple, matches v4.0 scope | ✉ |
| Dynamic platform list | Admin configurable, more flexible but over-engineering | |

**User's choice:** Fixed 4 platforms

## Feature Keys

| Option | Description | Selected |
|-------||--------------|---------.|
| Catalog-based | Admin picks from predefined list | ✉ |
| Free-form (current approach) | Admin types keys manually | |
| Catalog + custom | Predefined list + allow custom additions | |

**User's choice:** Catalog-based


## Admin Platform Toggle Matrix

| Option | Description | Selected |
|-------||--------------|---------.|
| Embedded in PlanForm | Replace existing flag section in the same form | ✉ |
| Separate feature editor page | Clicking Manage Features opens a dedicated matrix editor | |

**User's choice:** Embedded in PlanForm

## Matrix Layout

| Option | Description | Selected |
|-------||--------------|---------n|
| Checkbox grid | Feature name on left, 4 toggle columns | ✉ |
| Expandable cards | Each feature expands to show platform toggles | |

**User's choice:** Checkbox grid

# Validate Endpoint + SDK Integration

## Features in Validate Response

| Option | Description | Selected |
|-------||--------------|---------.|
| Platform-filtered | SDK sends platform, response returns only that platform's features as flat list | ✉ |
| Full matrix in response | Returns full nested matrix, SDK filters client-side | |
| Conditional (filtered if platform sent) | If platform provided, return filtered; if absent, return full | |

**User's choice:** Platform-filtered

# Platform Parameter

| Option | Description | Selected |
|-------||--------------|---------.|
| Required field | Reject if missing or invalid | ✉ |
| Optional field | If provided, filter; if missing, no features | |

**User's choice:** Required field

# Beta Channel

| Option | Description | Selected |
|-------||--------------|---------.|
| As a feature flag | beta_channel in catalog, when enabled for platform, update check returns beta versions | ✉ |
| Separate per-license toggle | Per-customer beta opt-in, not tied to plan | |
| Defer beta channel | Skip in Phase 33, focus on core feature flags | |

**User's choice:** As a feature flag

## Customer Portal Feature Display

## Feature Presentation

| Option | Description | Selected |
|-------||--------------|---------n|
| Feature checklist | Simple green/gray checkmarks for enabled/disabled | ✉ |
| Tier comparison table | Shows customer tier vs higher tiers | |
| Checklist + upgrade prompt | Checklist plus expandable section for locked features | |

**User's choice:** Feature checklist

## Portal Location

| Option | Description | Selected |
|-------||--------------|---------.|
| License detail page | Add below activations section on existing page | ✉ |
| Both detail + list pages | Add to license detail and main licenses list | |

**User's choice:** License detail page

---


## Claude's Discretion

1. TypeScript type definitions for nested features structure
2. Feature catalog source file location and format
3. Exact feature catalog entries and display names
4. Migration strategy for existing seed data
5. How update check endpoint reads beta_channel flag
6. Whether status endpoint requires platform as required or optional
7. Exact checkbox grid component implementation
8. How portal resolves product-to-platform mapping
9. Error response format for invalid/missing platform
10. Cache invalidation when plan features change

## Deferred Ideas

- Dynamic configurable platform list - Over-engineering for v4.0
- Tier comparison table in portal - Future enhancement
- Runtime feature gating - Consumer concern for SDKs
- Feature flag analytics - Future admin enhancement
- Feature flag change history - Existing audit log sufficient
