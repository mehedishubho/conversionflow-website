# Phase 19: Portal & Analytics Enhancements - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-03
**Phase:** 19-portal-analytics
**Areas discussed:** Analytics Dashboard Integration, License Transfer Mechanics, Analytics Aggregation Strategy, Transfer Limits & Restrictions, Customer Transfer History UI, Transfer Email Notifications, Geo-IP Enrichment Approach, Customer Subscription Visibility

---

## Analytics Dashboard Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Extend existing analytics page | Add license analytics sections directly to `/admin/analytics/`. Everything in one place. | |
| Separate License Analytics sub-page | Create `/admin/licenses/analytics/` as a dedicated page. Keeps license metrics focused. | ✓ |
| Tab-based within license section | Add analytics as a tab on `/admin/licenses/` (list \| analytics). | |

**User's choice:** Separate License Analytics sub-page
**Notes:** Keeps license-specific analytics separate from existing revenue/sales analytics.

### KPI Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Core 6 cards | Total, Active, Expired, Revoked, Grace Period, Activation Rate | ✓ |
| Core 6 + Revenue metrics | Same 6 plus Total Revenue, MRR, ARR | |
| Full 10-card dashboard | All of the above plus Customer Growth, Product Performance, Avg Activations | |

**User's choice:** Core 6 cards

### Charts

| Option | Description | Selected |
|--------|-------------|----------|
| License trend + Product breakdown | Area chart for status over time + bar chart for product/plan distribution | ✓ |
| Full chart suite | 4 charts including customer growth and geographic map | |
| License trend only | Single area chart, product performance as tables only | |

**User's choice:** License trend + Product breakdown (2 charts with date range selector)

### Activation Geo-Data

| Option | Description | Selected |
|--------|-------------|----------|
| Table with country column | Simple table: Country, Activations, % of Total | ✓ |
| Reuse GeoDistribution chart | Extend existing geographic distribution component with activation data | |
| Claude's discretion | Pick whichever makes sense | |

**User's choice:** Table with country column

---

## License Transfer Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Transfer code sharing | Customer generates code, shares via WhatsApp/email, recipient enters to claim | ✓ |
| Email-based invite | Customer enters recipient email, system sends transfer request | |
| Direct account transfer | Customer enters recipient email, immediate transfer if account exists | |

**User's choice:** Transfer code sharing
**Notes:** Works well for BD customers who communicate via WhatsApp.

### Transfer Code Validity

| Option | Description | Selected |
|--------|-------------|----------|
| 48 hours | Balance between security and communication time | ✓ |
| 24 hours | Tighter security, may cause friction | |
| 7 days | Generous, higher abuse risk | |

**User's choice:** 48 hours

### Activations on Transfer

| Option | Description | Selected |
|--------|-------------|----------|
| Clear all activations | Recipient starts fresh, old sites stop immediately | ✓ |
| Keep existing activations | Activations carry over to new owner | |
| Require deactivation first | Old owner must deactivate before transfer | |

**User's choice:** Clear all activations

---

## Analytics Aggregation Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-aggregated cache table | BullMQ worker writes daily snapshots to cache table. Dashboard reads cache. | ✓ |
| Real-time SQL queries | Dashboard queries `licenses` table directly. Always fresh. | |
| Hybrid | Live counts + cached charts. | |

**User's choice:** Pre-aggregated cache table

### Worker Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Daily snapshots only | Current counts, product breakdown, activation rate | ✓ |
| Daily snapshots + time series rows | Snapshots plus per-day historical rows for trend charts | |
| Claude's discretion | Keep it simple at 500-store scale | |

**User's choice:** Daily snapshots only

---

## Transfer Limits & Restrictions

### Monthly Limit

| Option | Description | Selected |
|--------|-------------|----------|
| 1 per month, admin-configurable | Default 1, adjustable via settings. Aligns with XFER-04. | ✓ |
| Lifetime limit (3 total) | Once used, no more transfers. Prevents infinite passing. | |
| Monthly + lifetime combo | Both 1/month AND 3 lifetime max. | |

**User's choice:** 1 per month, admin-configurable

### Eligibility

| Option | Description | Selected |
|--------|-------------|----------|
| Active only, account required | Only active licenses; recipient must have existing account | ✓ |
| Active + grace period, account required | More flexible during grace period | |
| Claude's discretion | Pick appropriate rules | |

**User's choice:** Active only, account required

---

## Customer Transfer History UI

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on license detail page | "Transfer History" section at bottom of `/dashboard/licenses/[id]/` | ✓ |
| Separate transfer history page | New `/dashboard/licenses/transfers` page | |
| Claude's discretion | Keep simple and consistent | |

**User's choice:** Inline on license detail page

---

## Transfer Email Notifications

| Option | Description | Selected |
|--------|-------------|----------|
| 3-email flow | Initiated to owner, Completed to owner, Received to new owner | ✓ |
| Completion email only | Single email to new owner when transfer completes | |
| Claude's discretion | Decide based on flow | |

**User's choice:** 3-email flow

---

## Geo-IP Enrichment Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Local MMDB lookup | Download free IP-to-country DB, batch process un-enriched IPs daily | ✓ |
| External API lookup | Call ipinfo.io or ip-api.com per IP. Simpler but rate-limited. | |
| Claude's discretion | Pick simplest reliable approach | |

**User's choice:** Local MMDB lookup
**Notes:** No external API dependency after database download. Country-level only.

---

## Customer Subscription Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on license detail + Renew CTA | Expiry date, days remaining, status badge, Renew button (links to pricing) | ✓ |
| Status display only, no CTA | Just show expiry and status. No renewal CTA (checkout doesn't exist yet). | |
| Claude's discretion | Decide what's appropriate | |

**User's choice:** Inline on license detail + Renew CTA
**Notes:** Renew CTA links to pricing page for now. Actual renewal checkout is a future phase. Lifetime licenses show "Lifetime" badge.

---

## Claude's Discretion

- Exact cache table and transfer table schemas
- Transfer code generation specifics
- Analytics worker implementation details
- MMDB download/storage strategy
- Email template design for transfer notifications
- Transfer code input UI on recipient side
- Renew CTA button styling
- Transfer service internal structure
- "Transfer limit reached" messaging
- Analytics cache invalidation between worker runs

## Deferred Ideas

- Renewal checkout flow — future phase
- Real-time analytics (DEFER-03) — post-MVP
- Advanced reporting with PDF exports (DEFER-05) — post-MVP
- Transfer between different products — future
- Bulk transfer operations — future
- Transfer cooldown period — monthly limit is sufficient
- Outbound webhook delivery — future phase
- In-app notifications for transfer events — future enhancement
