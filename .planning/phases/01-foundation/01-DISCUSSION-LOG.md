# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 01-foundation
**Areas discussed:** Footer animation, Navbar skeleton design, Footer link behavior, Button CSS scope

---

## Footer Animation

| Option | Description | Selected |
|--------|-------------|----------|
| Static render | No Framer Motion — Footer is always visible, animation adds no value | ✓ |
| Framer Motion entrance | Match Navbar's `motion.nav` pattern with `initial`/`animate` for consistency | |
| Fade-in on scroll | Trigger footer animation when it enters viewport using `whileInView` | |

**User's choice:** [auto] Static render (recommended default)
**Notes:** Footer is a server component at page bottom. No interactivity needed. Keeps it simple and avoids unnecessary client-side JavaScript.

---

## Navbar Skeleton Design

| Option | Description | Selected |
|--------|-------------|----------|
| Invisible spacer | Empty `div` matching navbar height — no visual content, just prevents layout shift | ✓ |
| Visual skeleton | Shimmer/placeholder shapes hinting at logo, links, and buttons | |
| Match Navbar markup | Render the full Navbar structure with invisible/placeholder content | |

**User's choice:** [auto] Invisible spacer (recommended default)
**Notes:** Simplest approach. Avoids flash of unstyled content. The spacer div needs to match the navbar's rendered height (including the `fixed top-4` positioning context).

---

## Footer Link Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js `<Link>` for internal, `#` for placeholder | Internal nav uses `<Link>`, external uses real URLs, legal uses `#` | ✓ |
| All `<Link>` components | Create placeholder pages for legal/policy routes | |
| All `#` links | Keep everything as anchor links, add `<Link>` in later phases | |

**User's choice:** [auto] Next.js `<Link>` for internal, `#` for placeholder (recommended default)
**Notes:** Internal routes (Features, Pricing, Changelog, Support) already defined in Navbar's `navLinks`. External links (Devsroom, WPMHS) have real URLs in the reference. Legal pages are out of scope for v1.

---

## Button CSS Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All variants now | Add `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg`, `.btn-xl`, `.btn-white` | ✓ |
| Core only | Add only `.btn`, `.btn-primary`, `.btn-outline` (required by Navbar) | |
| Core + sizes | Add `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg`, `.btn-xl` | |

**User's choice:** [auto] All variants now (recommended default)
**Notes:** Hero section (Phase 2) uses `btn-lg`, pricing cards (Phase 3) use `btn-lg` and `btn-white`. Adding all now avoids returning to `globals.css` later.

---

## Agent's Discretion

- Navbar skeleton spacer exact dimensions — agent determines based on rendered navbar height.
- Button hover transition details — follow HTML reference CSS exactly.

## Deferred Ideas

None — all discussion stayed within Phase 1 scope.
