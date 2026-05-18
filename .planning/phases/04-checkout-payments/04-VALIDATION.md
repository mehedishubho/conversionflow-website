---
phase: 4
slug: checkout-payments
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — prior phases used manual UAT verification |
| **Config file** | None |
| **Quick run command** | `pnpm build` (type-check + build) |
| **Full suite command** | `pnpm build && manual UAT` |
| **Estimated runtime** | ~30 seconds build + manual UAT |

**Note:** Previous phases (1-3) completed successfully without test infrastructure using manual UAT. This phase follows the same pattern. Vitest installation is deferred to a future milestone.

---

## Sampling Rate

- **After every task commit:** `pnpm build` (verify no type/build errors)
- **After every plan wave:** Manual smoke test in browser
- **Before `/gsd-verify-work`:** Full UAT pass required

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | PAY-01 | T-04-01 | Server-side price from plan data, not client | build | `pnpm build` | pending |
| 04-01-02 | 01 | 1 | PAY-01 | T-04-03 | Transactional coupon validation | build | `pnpm build` | pending |
| 04-02-01 | 02 | 1 | PAY-02 | T-04-04 | SSL Commerz verify_sign validation on IPN | build | `pnpm build` | pending |
| 04-03-01 | 03 | 2 | PAY-03 | T-04-02 | Dedup on paymentRef column | build | `pnpm build` | pending |
| 04-04-01 | 04 | 2 | PAY-04 | — | VAT calculation matches mode config | build | `pnpm build` | pending |
| 04-05-01 | 05 | 2 | PAY-05 | — | PDF generation succeeds | build | `pnpm build` | pending |
| 04-06-01 | 06 | 2 | PAY-06, LIC-01, LIC-02 | — | Central API called with correct payload | build | `pnpm build` | pending |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Checkout flow: select plan then choose payment then submit | PAY-01 | Requires browser interaction | Navigate pricing page, click Buy Now, complete checkout form |
| SSL Commerce redirect and return | PAY-02 | External payment gateway | Choose SSL Commerce, verify redirect, test success/fail callbacks |
| Admin order verification | PAY-01 | Multi-role flow | Create manual order as customer, verify as admin from /admin/orders |
| Invoice PDF download | PAY-05 | Visual verification | Download PDF, verify content matches HTML view |
| Coupon code application | PAY-03 | UI interaction | Enter valid/expired/limit-reached coupon codes |

---

## Validation Sign-Off

- [x] All tasks have build verification
- [x] Sampling continuity: build check after every task
- [x] No watch-mode flags
- [x] Feedback latency < 30s (build time)
- [ ] nyquist_compliant: true — set after UAT pass

**Approval:** pending
