---
title: Affiliate Network System
trigger_condition: Ready to build after notification engine is complete
planted_date: 2026-05-20
---

## Vision

Build a full affiliate marketing system where customers can become affiliates, share referral links, track conversions, and earn commission payouts processed manually by admin.

## Architecture Sketch

```
Visitor clicks ?ref=CODE → Cookie set (30d) → Places order → Commission created
                                                          → Affiliate dashboard shows earnings
                                                          → Affiliate requests payout
                                                          → Admin approves + transfers via bKash/Nagad/bank
```

## DB Schema Sketch

- **`affiliates`** — id, userId, code (unique), commissionRate, status (pending/active/suspended), bankInfo, createdAt
- **`affiliate_clicks`** — id, affiliateId, visitorIp, userAgent, landingPage, createdAt
- **`affiliate_commissions`** — id, affiliateId, orderId, amount, commissionRate, status (pending/approved/rejected), createdAt
- **`affiliate_payouts`** — id, affiliateId, amount, method (bkash/nagad/bank), accountInfo, status (requested/approved/rejected/paid), requestedAt, processedAt

## Key Components

1. **`src/lib/affiliate.ts`** — Core service: generateAffiliateCode, trackClick, attributeOrder, calculateCommission, requestPayout
2. **`src/app/(portal)/affiliate/page.tsx`** — Affiliate dashboard (stats, referral link, earnings, payout history)
3. **`src/app/(admin)/admin/affiliates/page.tsx`** — Admin affiliate management (approve, set rates, process payouts)
4. **Referral middleware** — Detect `?ref=` param in proxy.ts or layout, set cookie
5. **Order webhook hook** — After successful payment, check for affiliate cookie and create commission

## Dependencies

- No new external packages needed — uses existing DB, auth, and server action patterns
- Cookie handling via Next.js cookies API
- Commission calculation is pure TypeScript

## Estimated Scope

- Large feature, likely its own GSD phase
- Touches: orders, payments, customer portal, admin panel
- Depends on: notification engine (for affiliate approval/payout notifications)

## Related

- See affiliate-system-decisions note for exploration decisions
- See notification-engine seed for notification triggers this feature will need
