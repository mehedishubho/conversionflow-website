---
phase: 06
slug: webhooks-jobs
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-18
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual UAT (consistent with Phases 1-5) |
| **Config file** | None |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm lint`
- **Before `/gsd-verify-work`:** Build must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 06-01-01 | 01 | 1 | LIC-05 | T-06-01 | HMAC timing-safe comparison rejects invalid signatures | build | `pnpm build` | pending |
| 06-01-02 | 01 | 1 | LIC-03 | T-06-02 | Webhook dispatches to event-specific handlers | build | `pnpm build` | pending |
| 06-02-01 | 02 | 1 | LIC-04 | T-06-03 | BullMQ repeatable job registered with 15-min interval | build | `pnpm build` | pending |
| 06-03-01 | 03 | 2 | LINT-01 | — | KPI cards render correct counts from DB | build | `pnpm build` | pending |
| 06-03-02 | 03 | 2 | LINT-01 | — | Plan distribution chart renders | build | `pnpm build` | pending |
| 06-04-01 | 04 | 2 | LINT-02 | — | Domain tracking detail page shows activation data | build | `pnpm build` | pending |
| 06-05-01 | 05 | 2 | LINT-03 | T-06-04 | Piracy flags appear for suspicious patterns | build | `pnpm build` | pending |
| 06-05-02 | 05 | 2 | LINT-03 | — | Admin can dismiss or suspend flagged licenses | build | `pnpm build` | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — consistent with Phases 1-5.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Webhook HMAC verification rejects tampered payloads | LIC-05 | Requires sending crafted HTTP requests | Send POST to /api/webhooks/license with invalid HMAC header, verify 401 response |
| 15-min sync job triggers and processes pending licenses | LIC-04 | Requires BullMQ worker running + Redis | Check BullMQ dashboard or logs for repeatable job execution |
| Piracy flags appear in admin review queue | LINT-03 | Requires license data matching trigger patterns | Seed license with activation count > max, verify flag appears |
| Sync failure filter shows pending_sync licenses | LIC-03 | Requires sync failure state | Mark license as pending_sync, verify filter shows it |

---

## Validation Sign-Off

- [x] All tasks have automated verify (build check) or manual-only justification
- [x] Sampling continuity: no 3 consecutive tasks without build verify
- [x] Wave 0 covers all MISSING references (none — no test framework needed)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-18
