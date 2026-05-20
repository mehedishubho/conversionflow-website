---
phase: 10
phase_name: Core SEO Configuration
created: 2026-05-20
---

# Phase 10 Discussion Log

## Discussion Date: 2026-05-20

## Gray Areas Identified

### Round 1: Core Architecture

1. **SEO Library Integration** — How does admin SEO config integrate with the existing hardcoded `seo.ts`?
2. **SERP Preview Component** — What search engine previews to show?
3. **Robots.txt Editor UX** — How to present robots.txt editing to non-technical admins?
4. **AI Bot Controls** — How to present AI crawler controls?

### Round 2: Extended Scope

5. **SEO Score Calculation** — How sophisticated should the SEO score be?
6. **Static vs Dynamic Generation** — How are robots.txt and sitemap.xml generated?
7. **Verification Status Display** — How to show verification status per engine?

## Decisions Made

### Q1: SEO Library Integration
**Options presented:** DB overrides hardcoded / Full DB replacement / Dual mode toggle
**User chose:** DB overrides hardcoded (Recommended)
**Decision ID:** D-01
**Rationale:** Preserves current behavior as fallback, enables admin overrides without touching code.

### Q2: SERP Preview Component
**Options presented:** Google snippet only / Multi-engine previews / No preview
**User chose:** Google snippet only (Recommended)
**Decision ID:** D-02
**Rationale:** Google snippet covers 90%+ of BD search traffic.

### Q3: Robots.txt Editor UX
**Options presented:** Visual + Raw dual mode / Visual only / Raw textarea only
**User chose:** Visual + Raw dual mode (Recommended)
**Decision ID:** D-03
**Rationale:** Visual mode prevents syntax errors for non-technical admins. Raw mode provides escape hatch for advanced users.

### Q4: AI Bot Controls
**Options presented:** Individual toggle cards / Bulk toggle / JSON textarea
**User chose:** Individual toggle cards (Recommended)
**Decision ID:** D-04
**Rationale:** Individual cards are more intuitive than a JSON textarea.

### Q5: SEO Score Calculation
**Options presented:** Simple filled count / Weighted scoring / No score
**User chose:** Simple filled count (Recommended)
**Decision ID:** D-06
**Rationale:** Avoids subjective scoring algorithms. Non-judgmental — just a count.

### Q6: Static vs Dynamic Generation
**Options presented:** Dynamic routes / Static generation with rebuild / API routes
**User chose:** Dynamic routes (Recommended)
**Decision ID:** D-07
**Rationale:** Next.js route handlers are the canonical way to generate these files.

### Q7: Verification Status Display
**Options presented:** Dots with expand / Full inline / Badge only
**User chose:** Dots with expand (Recommended)
**Decision ID:** D-08
**Rationale:** Dots provide instant visual status. Expand-on-click keeps the page clean.

## Scope Redirects

None — all discussions stayed within Phase 10 scope.

## Deferred Ideas

None — all gray areas were resolved within scope.
