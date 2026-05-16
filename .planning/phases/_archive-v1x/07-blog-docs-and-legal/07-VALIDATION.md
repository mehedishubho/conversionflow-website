---
phase: 7
slug: blog-docs-and-legal
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-12
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework — build verification only |
| **Config file** | none — Wave 0 not applicable |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm lint`
- **Before `/gsd-verify-work`:** Full build must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | BLOG-01..04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | BLOG-01..04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | BLOG-01..04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | DOCS-01..02 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | DOCS-01..02 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 1 | LEGL-01..04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 1 | LEGL-01..04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-03-03 | 03 | 1 | LEGL-01..04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test framework is installed for this project (marketing website). Build verification (`pnpm build`) is sufficient to catch type errors, missing imports, and routing issues.

*Existing infrastructure (pnpm build) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog listing card grid renders correctly | BLOG-01 | Visual layout verification | Navigate to /blog, verify 2-3 column grid with cards |
| Blog post MDX renders with code blocks, tables | BLOG-02 | Rich content rendering | Click a blog post, verify code blocks, tables, headings styled |
| Docs sidebar navigation works | DOCS-01 | Interactive navigation | Navigate /docs, click sidebar links, verify content loads |
| Docs TOC highlights active section on scroll | DOCS-01 | Scroll-based interaction | Scroll through a doc page, verify TOC active state changes |
| Legal pages display full content | LEGL-01..04 | Content completeness | Visit /privacy, /terms, /refund, /license and verify content |
| Footer links navigate to correct pages | All | Navigation | Click footer Blog, Docs, and legal links |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
