---
phase: 21
slug: backup-restore
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-04
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (manual verification per project convention) |
| **Config file** | none |
| **Quick run command** | `pnpm build` (type checking) |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build` (type check)
- **After every plan wave:** Manual verification of backup/restore flow in dev server
- **Before `/gsd-verify-work`:** All 7 success criteria manually verified
- **Max feedback latency:** 30 seconds (build time)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | D-01 | T-21-01 | execFileSync with array args, no shell injection | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-01-02 | 01 | 1 | D-03 | — | File naming format validation | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-01-03 | 01 | 1 | D-10 | — | Retention query uses ordered DELETE | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-02-01 | 02 | 1 | D-09 | — | Cron pattern mapping correctness | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-02-02 | 02 | 1 | D-06 | T-21-02 | Redis restore status with TTL, no leak | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-03-01 | 03 | 2 | D-12 | — | Backup dashboard renders KPIs and table | manual | visual check | ❌ W0 | ⬜ pending |
| 21-03-02 | 03 | 2 | D-13, D-14 | — | Table filtering and sorting | manual | visual check | ❌ W0 | ⬜ pending |
| 21-03-03 | 03 | 2 | D-17 | T-21-03 | Download route validates backup ID from DB, not user path | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-04-01 | 04 | 2 | D-07 | T-21-04 | Proxy checks maintenance_mode, blocks non-admin | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-04-02 | 04 | 2 | D-05 | T-21-05 | Pre-restore backup created before any restore | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-04-03 | 04 | 2 | D-08 | — | Restore failure triggers auto-rollback | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 21-05-01 | 05 | 3 | D-11 | — | Settings form saves/loads backup config | manual | visual check | ❌ W0 | ⬜ pending |
| 21-05-02 | 05 | 3 | D-02 | T-21-06 | Cloud credentials encrypted in settings | build | `pnpm build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test framework is installed in this project. All existing phases rely on manual verification. This phase follows the same convention.

*Existing infrastructure covers all phase requirements via build type-checking and manual verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Backup creation via pg_dump | D-01 | Requires PostgreSQL client tools on PATH | 1. Install pg_dump 2. Click "Create Backup" 3. Verify .sql file in backups/ |
| Restore from backup | D-05 | Requires psql + database reset | 1. Create a backup 2. Click "Restore" 3. Confirm dialog 4. Verify maintenance mode + data restored |
| Scheduled backup runs | D-09 | Requires BullMQ + Redis running | 1. Set interval to "Every 6 hours" 2. Wait or trigger manually 3. Verify scheduled backup appears |
| Backup dashboard rendering | D-12 | UI verification | 1. Navigate to /admin/backup 2. Verify 4 KPI cards + data table |
| Settings form saves correctly | D-11 | Full form interaction | 1. Navigate to /admin/settings/backup 2. Change settings 3. Save and verify persistence |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (build) or manual verify instructions
- [ ] Sampling continuity: no 3 consecutive tasks without build verification
- [ ] Wave 0 covers all MISSING references (N/A — no test framework)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
