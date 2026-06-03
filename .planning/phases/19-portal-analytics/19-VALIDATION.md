---
phase: 19
slug: portal-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-03
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed in project |
| **Config file** | none |
| **Quick run command** | `pnpm build` (TypeScript type-check + build) |
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
| 19-01-01 | 01 | 1 | ANLT-01 | — | Analytics cache counts match DB | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | ANLT-05 | — | Geo enrichment stores country_code | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 1 | ANLT-01-04 | — | KPI cards render with cache data | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 19-03-01 | 03 | 2 | XFER-01-04 | T-01 | Transfer code atomic claim with FOR UPDATE | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 19-03-02 | 03 | 2 | XFER-03 | T-02 | Transfer audit log entries created | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 19-04-01 | 04 | 2 | ANLT-01 | — | Subscription visibility on portal | build | `pnpm build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework — validation via TypeScript build and lint checks
- [ ] All new files must pass `pnpm build` without type errors

*Existing infrastructure (TypeScript strict mode + ESLint) covers all phase requirements for compilation verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Transfer email delivery | XFER-01 | Email delivery requires Resend API + real email | Send test transfer and verify all 3 emails arrive |
| Analytics chart rendering | ANLT-01 | ApexCharts requires browser to render | Navigate to /admin/licenses/analytics/ and verify charts display |
| Geo-IP accuracy | ANLT-05 | Requires real IP addresses and MMDB data | Check activation geo table for correct country codes |

---

## Validation Sign-Off

- [ ] All tasks have build verification
- [ ] Sampling continuity: no 3 consecutive tasks without build check
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
