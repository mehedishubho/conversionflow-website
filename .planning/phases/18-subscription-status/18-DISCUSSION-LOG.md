# Phase 18: Subscription & Status Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-03
**Phase:** 18-subscription-status
**Areas discussed:** Grace Period Enforcement, Worker Architecture, Expiry Calculation, Reminder Channels, Admin Settings Scope, State Transition Rules, Config Change Handling, Activation Behavior on Expiry, Worker Batch Processing, Domain Events on Transitions

---

## Grace Period Enforcement

| Option | Description | Selected |
|--------|-------------|----------|
| Worker-only (simple) | Validation API only reads DB status. License may show valid for up to 24 hours after actual expiry. | |
| Real-time check (accurate) | Validation API also checks expires_at timestamp. Prevents stale-status window. | |
| You decide | Claude's discretion | ✓ |

**User's choice:** You decide (Claude's discretion) → Selected real-time check
**Notes:** Real-time check is just a date comparison, prevents 24-hour stale-status window. Worker still handles DB transitions and emails; API adds safety net.

---

## Grace Period vs Admin Actions

| Option | Description | Selected |
|--------|-------------|----------|
| Grace period only for natural expiry | Admin revocation/suspension is always immediate | ✓ |
| Grace period for admin actions too | Admin actions can also be delayed | |

**User's choice:** Grace period only for natural expiry
**Notes:** Admin actions bypass grace period — always immediate.

---

## Worker Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Single combined worker | One daily cron job handles everything: expiring checks, reminders, grace period, expiration | ✓ |
| Dispatcher + specialized workers | Daily cron dispatches to separate reminder-sender, status-transitioner workers | |

**User's choice:** Single combined worker (Recommended)

---

## Worker Failure Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Continue on partial failure | Status transitions proceed even if email fails. Next run retries email via dedup table. | ✓ |
| All-or-nothing per license | Skip entire license if any part fails | |

**User's choice:** Continue on partial failure (Recommended)

---

## Expiry Calculation

| Option | Description | Selected |
|--------|-------------|----------|
| Exact calendar dates | Same day next month with last-day clamp. Jan 31 → Feb 28/29. | ✓ |
| Fixed day counts (current) | Monthly = 30 days, yearly = 365 days. Approximate. | |
| You decide | Claude's discretion | |

**User's choice:** Exact calendar dates (Recommended)

---

## Grace Period End Calculation

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed days after expiry | grace_period_ends_at = expires_at + grace_days. Simple and predictable. | ✓ |
| End-of-day extension | Grace period extends to end of the grace day (23:59:59 UTC) | |

**User's choice:** Fixed days after expiry (Recommended)

---

## Monthly Renewal Date

| Option | Description | Selected |
|--------|-------------|----------|
| Same day next month, last day clamp | Jan 31 → Feb 28/29, Apr 30. Standard approach. | ✓ |
| Fixed 30/365 regardless | No month boundary logic. Sometimes 28 days, sometimes 31. | |

**User's choice:** Same day next month, last day clamp (Recommended)

---

## Renewal Start Date

| Option | Description | Selected |
|--------|-------------|----------|
| From renewal date (fresh start) | New expires_at = now + billing cycle. Clean start. | ✓ |
| From old expiry date (stack) | New expires_at = old expires_at + billing cycle. Customer gets grace period days back. | |

**User's choice:** From renewal date (fresh start) (Recommended)
**Notes:** Noted for Phase 19's renewal checkout flow.

---

## Reminder Channels

| Option | Description | Selected |
|--------|-------------|----------|
| Email only for now | Simple, follows existing Resend patterns. In-app notifications deferred to Phase 19. | ✓ |
| Email + in-app notifications | Also add bell icon with alerts in customer portal | |
| You decide | Claude's discretion | |

**User's choice:** Email only for now (Recommended)

---

## Reminder Email Templates

| Option | Description | Selected |
|--------|-------------|----------|
| Single template, variable urgency | One template for all countdown reminders. Subject/body changes per milestone. | ✓ |
| Different templates per milestone | Separate templates for 30d, 14d, 7d, 3d, 1d. More tailored but more maintenance. | |

**User's choice:** Single template, variable urgency (Recommended)

---

## Grace/Expiration Email Templates

| Option | Description | Selected |
|--------|-------------|----------|
| Separate templates for grace/expire | Different subject and body structure for state transitions vs countdown | ✓ |
| Same template for everything | All emails use same framework with different urgency | |

**User's choice:** Separate templates for grace/expire (Recommended)

---

## Admin Settings Scope

| Option | Description | Selected |
|--------|-------------|----------|
| DB entries only, no UI | Just settings table entries with defaults. Admin UI deferred to Phase 19. | |
| Include admin settings UI | New section on existing settings page for grace period and reminder config. | ✓ |

**User's choice:** Include admin settings UI
**Notes:** Adds a "Subscription" section to existing admin settings page with grace_period_days and reminder_milestones.

---

## State Transition Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Strict state machine | Only valid transitions allowed (active→grace_period→expired, etc.). Invalid throws error. | ✓ |
| Open (any to any) | Any status can be set to any other status freely. | |

**User's choice:** Strict state machine (Recommended)

---

## License Reactivation Path

| Option | Description | Selected |
|--------|-------------|----------|
| Only admin restore or renewal | Admin can restore any license to active. Renewal also sets to active. | ✓ |
| Admin restore + customer self-renew | Also allow customer self-service renewal | |

**User's choice:** Only admin restore or renewal (Recommended)
**Notes:** Customer self-renew comes with Phase 19's checkout flow.

---

## Config Change Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Apply immediately | Next worker run re-evaluates all licenses against current settings. No per-license snapshots. | ✓ |
| Only future transitions | Existing licenses keep original config. Requires per-license tracking. | |

**User's choice:** Apply immediately (Recommended)

---

## Activation Behavior on Expiry

| Option | Description | Selected |
|--------|-------------|----------|
| Keep activations | Domain activations preserved. Renewal = instant reactivation, zero downtime. | ✓ |
| Auto-deactivate on expiry | Worker removes all domain activations when license expires. | |

**User's choice:** Keep activations (Recommended)

---

## Worker Batch Processing

| Option | Description | Selected |
|--------|-------------|----------|
| Process all at once | One query + loop. Simple. 500 stores scale doesn't need batching. | ✓ |
| Chunked processing | Fetch in chunks of N. More resilient at scale but adds complexity. | |

**User's choice:** Process all at once (Recommended)

---

## Domain Events on Transitions

| Option | Description | Selected |
|--------|-------------|----------|
| Publish domain events | LICENSE_GRACE_PERIOD_STARTED, LICENSE_EXPIRED via event bus. Consistent with Phase 14-17 patterns. | ✓ |
| Handle internally, no events | Worker does everything. No events. Other modules can't react. | |

**User's choice:** Publish domain events (Recommended)

---

## Event Bus Choice

| Option | Description | Selected |
|--------|-------------|----------|
| In-process (synchronous) | inProcessPublisher, same pattern as OrderCompleted. Simple, events handled in same run. | ✓ |
| Cross-process (Redis Pub/Sub) | Events go through Redis. More decoupled but adds complexity for single worker. | |

**User's choice:** In-process (synchronous) (Recommended)

---

## Claude's Discretion

- Grace period enforcement: real-time check in validation API
- Exact `license_reminders` table schema
- Worker registration pattern
- Email template design, content, subject lines (3 templates)
- Failed job surfacing to admin
- Exact exponential backoff intervals
- State machine implementation pattern
- Admin settings UI layout

## Deferred Ideas

- **In-app notifications** — Phase 19 (Portal & Analytics Enhancements)
- **Worker batch/chunk processing** — If scale grows beyond 500 stores
- **Renewal from old expiry date (stacking)** — Customer preferred fresh start
- **Cross-process event publishing** — In-process sufficient for single-worker architecture
- **Customer self-renewal** — Phase 19
