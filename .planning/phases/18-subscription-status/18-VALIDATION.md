---
phase: 18
slug: subscription-status
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-03
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework installed — use TypeScript build checks |
| **Config file** | `tsconfig.json` (strict mode) |
| **Quick run command** | `pnpm tsc --noEmit` |
| **Full suite command** | `pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm tsc --noEmit`
- **After every plan wave:** Run `pnpm build`
- **Before `/gsd-verify-work`:** Full build must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | LSTAT-01 | — | Enum only accepts valid values | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 18-01-02 | 01 | 1 | LSTAT-01 | — | Invalid transitions rejected | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 1 | LSTAT-02, LSTAT-04 | — | Exact calendar date calculation | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 18-03-01 | 03 | 1 | LSTAT-03 | — | Grace period real-time check in validation | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 18-04-01 | 04 | 2 | LSTAT-07, JOB-01 | — | Worker processes licenses daily | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 18-05-01 | 05 | 2 | JOB-02 | — | Reminder emails sent at correct milestones | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 18-06-01 | 06 | 2 | JOB-04 | — | Retry with exponential backoff | build | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework required — TypeScript strict mode + `pnpm build` provides type safety verification
- [ ] Drizzle schema push: `npx drizzle-kit push` validates schema changes against live database

*Existing infrastructure covers all phase type-safety requirements. Schema push validates DB layer.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Worker sends reminder emails at correct milestones | JOB-02 | Requires running worker with real email service | Trigger worker manually, check Resend dashboard for email delivery |
| Grace period validation returns correct response | LSTAT-03 | Requires license past expires_at with active status | Create test license with past expires_at, call validation API, verify grace_period_expires_at in response |
| Admin settings UI saves and reads grace period config | LSTAT-03 | UI interaction required | Open admin settings, change grace period days, verify saved value persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
