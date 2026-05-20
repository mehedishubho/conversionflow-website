---
phase: 9
slug: settings-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (visual/structural phase — no test framework installed) |
| **Config file** | none |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | NAV-01 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | NAV-01 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | NAV-02 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | NAV-03 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | NAV-03 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-02-03 | 02 | 1 | NAV-05 | — | Auth check in layout | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-03-01 | 03 | 2 | NAV-04 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |
| 09-03-02 | 03 | 2 | NAV-04 | — | N/A | build | `pnpm build` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Build and lint are sufficient for this structural/UI phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Category cards render correctly with icons and status dots | NAV-02 | Visual verification | Navigate to /admin/settings, verify 3 cards with icons |
| Secondary sidebar highlights active section | NAV-01 | Interactive state check | Click through Payment/SMTP/SEO routes, verify highlighting |
| SEO sub-nav expands/collapses correctly | NAV-04 | Interactive behavior | Navigate to /admin/settings/seo, verify sub-items expand |
| Existing forms function identically at new routes | NAV-03 | Functional regression | Test Payment/SMTP forms at new routes, compare behavior |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
