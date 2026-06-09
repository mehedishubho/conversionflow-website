---
phase: 20
slug: migration-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-04
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework installed — manual verification |
| **Config file** | none |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm lint`
- **Before `/gsd-verify-work`:** Build and lint must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | ARCH-07 | — | Central API file deleted, zero imports | grep | `grep -r "central-api" src/` | ⬜ W0 | ⬜ pending |
| 20-01-02 | 01 | 1 | ARCH-07 | — | centralOrderId/centralUserId removed from schema | build | `pnpm build` | ⬜ W0 | ⬜ pending |
| 20-02-01 | 02 | 1 | ARCH-09 | T-20-01 | Migration script with dry-run, backup, verification | manual | `pnpm tsx scripts/migrate-phase20.ts --dry-run` | ⬜ W0 | ⬜ pending |
| 20-02-02 | 02 | 1 | ARCH-10 | — | License keys regenerated, data preserved | manual | `grep -c "CF-" logs/phase20-migration-*.log` | ⬜ W0 | ⬜ pending |
| 20-03-01 | 03 | 2 | ARCH-07 | — | UI references removed, Local Engine card present | build | `pnpm build` | ⬜ W0 | ⬜ pending |
| 20-03-02 | 03 | 2 | ARCH-07 | — | Env var deprecation warning logged | manual | startup check | ⬜ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework — use build/lint/grep for verification
- [ ] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Migration script runs end-to-end | ARCH-09 | Requires live database connection | Run `pnpm tsx scripts/migrate-phase20.ts --dry-run` then without flag |
| API token backfill email sent | ARCH-10 | Requires email service (Resend) | Check Resend dashboard for delivery |
| pg_dump backup created | ARCH-09 | Requires database access | Check `backups/pre-phase20-*.sql` exists |
| Startup env var warning | ARCH-07 | Requires app restart with deprecated vars set | Set CENTRAL_API_URL in .env, start app, check console |

---

## Validation Sign-Off

- [ ] All tasks have verification steps (build, grep, or manual)
- [ ] Sampling continuity: build after every task commit
- [ ] No test framework needed — build + lint + manual verification sufficient
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter after execution

**Approval:** pending
