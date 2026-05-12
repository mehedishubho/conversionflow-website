# Phase 8: SEO Completion - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md; this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 08-seo-completion
**Areas discussed:** Analytics provider, production domain, sitemap scope

---

## Analytics Provider

| Option | Description | Selected |
|--------|-------------|----------|
| Self-hosted Plausible | Matches prior research, privacy-first, cookie-free, and fits the self-hosted deployment constraint. | yes |
| No analytics now | Ships sitemap and robots only; SEO-05 stays incomplete or needs an explicit override. | |
| Umami | Also privacy-friendly and self-hostable, but differs from existing project research recommendation. | |

**User's choice:** Accepted recommended defaults via "ok".
**Notes:** Prior research in `.planning/research/STACK.md` already recommends self-hosted Plausible.

---

## Production Domain

| Option | Description | Selected |
|--------|-------------|----------|
| `woobooster.com` | Uses the domain already configured in root metadataBase. | yes |
| `www.woobooster.com` | Uses the www host everywhere and would require updating metadataBase expectations. | |
| Env variable | Reads from a site URL env var for deployment flexibility, with a fallback. | |

**User's choice:** Accepted recommended defaults via "ok".
**Notes:** Existing `src/app/layout.tsx` has `metadataBase: new URL("https://woobooster.com")`.

---

## Sitemap Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All public routes | Includes home, marketing pages, blog posts, docs, legal pages, changelog, pricing, support, and features. | yes |
| Core sales pages only | Keeps sitemap lean but omits blog/docs/legal SEO discovery. | |
| Exclude legal pages | Lists blog/docs/sales pages while leaving legal pages crawlable via links only. | |

**User's choice:** Accepted recommended defaults via "ok".
**Notes:** Phase 7 verification confirms blog/docs/legal routes are public and ready for sitemap inclusion.

---

## the agent's Discretion

- Exact sitemap priorities and change frequencies.
- Helper structure for route inventory.
- Analytics env var names and fallback mechanics.

## Deferred Ideas

- Conversion/event analytics.
- A/B testing.
- Cookie consent UX.
- i18n sitemap alternates for future Phase 9.
