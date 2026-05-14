# Phase 10: Polish and Enhancements - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 10-polish-and-enhancements
**Areas discussed:** Font strategy, ScrollReveal consolidation, Responsive polish, Animation coverage

---

## Font Strategy (Syne vs DM_Sans)

| Option | Description | Selected |
|--------|-------------|----------|
| Restore Syne for headings | Import Syne in layout.tsx, register --font-syne in @theme, apply to heading classes | |
| Remove Syne, DM_Sans for everything | Keep current state — all text uses DM_Sans. Simpler, fewer font loads | ✓ |
| Hybrid — Syne for hero/titles only | Use Syne only for hero headline and page titles, DM_Sans for everything else | |

**User's choice:** Remove Syne, DM_Sans for everything
**Notes:** Simplifies font stack. ROADMAP success criteria "Syne font renders weight 900" reinterpreted as "headings render with DM_Sans at appropriate weights without synthetic bold."

---

## ScrollReveal Consolidation

### Which implementation to keep

| Option | Description | Selected |
|--------|-------------|----------|
| Keep layout/ version | whileInView prop pattern, simpler API, no ref management | ✓ |
| Keep sections/ version | useInView hook pattern, more imperative control | |
| Merge into single component | Combine best parts of both | |

**User's choice:** Keep layout/ version (whileInView pattern)
**Notes:** Delete `src/components/sections/ScrollReveal.tsx`. Update any imports to use `layout/ScrollReveal`.

### Legacy CSS classes

| Option | Description | Selected |
|--------|-------------|----------|
| Remove legacy CSS classes | Remove .sr, .sr.vis, .sr-d1-d4 from globals.css | ✓ |
| Keep as fallback | Don't conflict with Framer Motion, keep for safety | |

**User's choice:** Remove legacy CSS classes
**Notes:** Framer Motion components fully replace CSS scroll-reveal classes.

---

## Responsive Polish Scope

### Breakpoint strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Audit existing breakpoints only | Keep 960px/640px, fix layout issues found | ✓ |
| Add large-screen breakpoint | Add 1200px+ breakpoint, widen container, adjust grids | |
| Both | Audit existing AND add large-screen | |

**User's choice:** Audit existing breakpoints only
**Notes:** No new breakpoints. Fix issues at 960px (tablet) and 640px (mobile).

### Container width

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 1160px container | Current max-width works for most screens | |
| Widen to 1280px | More content breathing room on larger screens | ✓ |

**User's choice:** Widen to 1280px
**Notes:** Update `.container` class in globals.css from `max-width: 1160px` to `max-width: 1280px`.

---

## Animation Coverage

### ScrollReveal application

| Option | Description | Selected |
|--------|-------------|----------|
| ScrollReveal on all sections | Wrap all below-the-fold sections across all pages | ✓ |
| Selective application | Only apply to sections that visibly benefit | |
| No additional animations | Current coverage is sufficient | |

**User's choice:** ScrollReveal on all sections across all pages
**Notes:** Features, Pricing, Changelog, Support, Blog, Docs, Legal pages all need ScrollReveal audit and wrapping.

### Page transitions

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current PageTransition | Simple fade/slide, verify locale route compatibility | ✓ |
| Enhance page transitions | More elaborate transitions (shared layout, exit-before-enter) | |

**User's choice:** Keep current PageTransition
**Notes:** Verify it works with `/en/*` and `/bn/*` locale routes.

---

## Agent's Discretion

- Exact DM_Sans weight values for heading classes (700 vs 800)
- Which specific sections on each page need ScrollReveal wrapping
- Minor responsive fixes discovered during audit
- Whether to consolidate `cn` imports after deleting `sections/ScrollReveal.tsx`

## Deferred Ideas

None — discussion stayed within phase scope
