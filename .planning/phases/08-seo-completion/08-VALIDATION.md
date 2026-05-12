---
phase: 8
slug: seo-completion
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-12
---

# Phase 8 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | No test framework; build and route verification only |
| Quick run command | `pnpm build` |
| Route smoke command | `pnpm dev`, then request `/sitemap.xml`, `/robots.txt`, and `/` |
| Full gate | `pnpm build` plus scoped ESLint on changed Phase 8 files |
| Known lint caveat | Full `pnpm lint` has unrelated existing noise from generated `.claude/worktrees/**/.next` output and pre-existing Navbar lint |

## Sampling Rate

- After Plan 01: run `pnpm build`; then smoke `/sitemap.xml` and `/robots.txt`
- After Plan 02: run `pnpm build`; then inspect root HTML for Plausible script markup
- Before verification: confirm sitemap includes all static, blog, docs, and legal routes

## Per-Task Verification Map

| Task ID | Plan | Requirement | Automated Command | Manual/Smoke Check | Status |
|---------|------|-------------|-------------------|--------------------|--------|
| 08-01-01 | 01 | SEO-03 | `pnpm build` | `/sitemap.xml` lists core marketing routes | pending |
| 08-01-02 | 01 | SEO-03 | `pnpm build` | `/sitemap.xml` lists all blog and docs slugs from MDX | pending |
| 08-01-03 | 01 | SEO-04 | `pnpm build` | `/robots.txt` allows crawling and points to sitemap | pending |
| 08-02-01 | 02 | SEO-05 | `pnpm build` | root HTML includes Plausible script with `data-domain="woobooster.com"` | pending |
| 08-02-02 | 02 | SEO-05 | `pnpm build` | no cookie banner or event tracking added | pending |

## Manual-Only Verifications

| Behavior | Requirement | Test Instructions |
|----------|-------------|-------------------|
| Search Console sitemap readiness | SEO-03 | Confirm sitemap URL is absolute and canonical: `https://woobooster.com/sitemap.xml` |
| Robots crawl policy | SEO-04 | Confirm robots allows `/` and does not block public app routes |
| Cookie-free analytics intent | SEO-05 | Confirm only Plausible standard script is loaded; no cookies, consent modal, or event instrumentation |

## Validation Sign-Off

- [x] Every phase requirement maps to an automated or smoke verification
- [x] Build is the hard automated gate
- [x] Route outputs are directly inspectable
- [x] No watch-mode commands
- [x] Feedback latency is under one minute
