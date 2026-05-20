---
phase: 07
slug: notification-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework — manual verification via build + runtime checks |
| **Config file** | none |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm build && pnpm lint` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build`
- **After every plan wave:** Run `pnpm build && pnpm lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | NOTIF-01 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | NOTIF-01 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | NOTIF-02 | — | SMTP creds not logged | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 1 | NOTIF-03 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-04-01 | 04 | 2 | NOTIF-05, NOTIF-01 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-05-01 | 05 | 2 | NOTIF-04 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-06-01 | 06 | 2 | NOTIF-07 | — | N/A | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 07-07-01 | 07 | 3 | NOTIF-06 | — | Admin-only access | build | `pnpm build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test framework needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email delivery with Resend | NOTIF-02 | Requires live Resend API key and valid recipient | Trigger notification, check inbox for email |
| SMTP fallback delivery | NOTIF-02 | Requires SMTP server credentials | Switch provider to SMTP in admin settings, trigger notification |
| WhatsApp manual send link | NOTIF-04 | Opens external wa.me link | Click "Send WhatsApp" in admin, verify link opens correctly |
| Notification bell polling | NOTIF-03 | Requires browser session | Open portal, trigger notification from another context, wait for badge update |
| Notification preferences save | NOTIF-07 | Requires user session + DB write | Toggle preferences, reload page, verify persisted |

---

## Validation Sign-Off

- [x] All tasks have automated verify via `pnpm build`
- [x] Sampling continuity: build after every task commit
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
