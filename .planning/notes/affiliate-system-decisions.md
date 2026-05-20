---
title: Affiliate Network System Decisions
date: 2026-05-20
context: Exploration session on affiliate marketing for ConversionFlow
---

## Decisions

- **Scope:** Full affiliate network — affiliates get unique referral links, track clicks/conversions, earn commissions, request payouts
- **Commission model:** Percentage-based — configurable per affiliate or per product tier
- **Payout flow:** Manual approval — affiliates request payout, admin reviews and approves via bKash/Nagad/bank transfer
- **Tracking:** Cookie-based click tracking + server-side conversion attribution via existing order flow

## Key Components

1. **Affiliate registration** — customers apply to become affiliates, admin approves
2. **Referral links** — unique `?ref=CODE` parameter tracked via cookie (30-day expiry)
3. **Dashboard** — affiliates see clicks, conversions, earnings, payout history
4. **Admin management** — approve/reject affiliates, set commission rates, process payouts
5. **Commission engine** — auto-calculate commission on completed orders using referral cookie

## BD-Specific Considerations

- Payout methods: bKash, Nagad, bank transfer (manual admin process)
- Currency: BDT only
- No automated payment gateway — admin marks payouts as completed after manual transfer
- Commission rates may vary for different product tiers (single license vs bundle)

## Related

- See notification-engine seed for future notification triggers (affiliate approved, payout sent)
- Affiliate commissions tie into existing orders table and SSLCommerz payment flow
