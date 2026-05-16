# Phase 6: Interactive Features - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up existing static page elements to become interactive: currency toggle on pricing page, functional contact form with validation, Buy Now buttons with checkout links, and count-up animations on stats. No new pages or sections — making existing mockups functional.

</domain>

<decisions>
## Implementation Decisions

### Currency Toggle
- **D-01:** Toggle button style — simple USD/BDT button pair, one highlighted, click to switch
- **D-02:** USD shows by default. BD users can switch to BDT
- **D-03:** When toggling, swap which price is primary (large) vs secondary (small). Both currencies always visible, just swap prominence
- **D-04:** Pricing page (or at least the pricing card grid) becomes a client component to support useState for currency state

### Contact Form
- **D-05:** Form validates all fields (name, email, subject, message — all required) with strict validation: email format check, character limits
- **D-06:** On valid submit, show a success confirmation message. No actual email sending for now (Resend API key needed — deferred)
- **D-07:** Inline error messages below each field for validation failures
- **D-08:** Replace the `<span>` submit button with a real `<button type="submit">` inside a `<form>` wrapper
- **D-09:** Use React state for controlled form inputs with real `name` attributes

### Buy Button Links
- **D-10:** Dual path: placeholder URLs for international checkout (replaceable later) + WhatsApp link for BD customers
- **D-11:** Small "Pay with bKash/Nagad via WhatsApp" note below the Buy Now button on each pricing card
- **D-12:** WhatsApp number from support data (src/data/support.ts). Pre-filled message with plan name
- **D-13:** Add `checkoutUrl` (placeholder) and `whatsappMessage` fields to pricing data (src/data/pricing.ts)

### Count-up Animations
- **D-14:** Animate all 5 TrustBar stats + 3 hero dashboard numbers (Revenue, Orders, Blocked) with count-up on scroll
- **D-15:** Animate hero chart bars with staggered height animation
- **D-16:** 1.5 second animation duration — snappy, not delayed
- **D-17:** Use IntersectionObserver (already in TrustBar) to trigger on scroll into view
- **D-18:** Generalize the existing count-up logic to work for any numeric stat target, not hardcoded to 500

### Claude's Discretion
- Exact animation easing curve for count-up
- Error message wording for form validation
- Exact WhatsApp pre-filled message text
- Whether to extract a reusable `useCountUp` hook or keep logic inline
- Chart bar animation timing/sequence

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` — Currency display, contact form layout, stat animations, Buy Now button styling

### Existing Source Files (must read before implementing)
- `src/app/pricing/page.tsx` — Server component, needs client component conversion for currency toggle
- `src/app/support/page.tsx` — Static form, needs full form wiring
- `src/components/sections/TrustBar.tsx` — Has 1 working count-up animation, needs generalization
- `src/components/sections/HeroSection.tsx` — Hardcoded dashboard stats, needs count-up + bar animation
- `src/data/pricing.ts` — Has `priceUSD` and `priceBDT` fields, needs `checkoutUrl` added
- `src/data/support.ts` — Has WhatsApp link (currently "#"), needs real number
- `src/data/faq.ts` — No changes needed, FAQAccordion already interactive

### Project Configuration
- `.planning/PROJECT.md` — Constraints: pnpm only, server actions preferred
- `.planning/REQUIREMENTS.md` — PRIC-02, PRIC-06, SUPP-03, SUPP-04, SUPP-05, HOME-10
- `.planning/ROADMAP.md` — Phase 6 success criteria
- `.planning/phases/05-data-layer/05-CONTEXT.md` — Data extraction decisions (D-04: dual currency structure)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `IntersectionObserver` pattern in TrustBar.tsx — already triggers count-up on scroll, generalize it
- `requestAnimationFrame` count-up logic in TrustBar.tsx (lines 36-50) — working but hardcoded to 500
- `cn()` utility at `src/lib/utils.ts` — for conditional currency-active classes
- `src/data/pricing.ts` — `PricingTier` interface with `priceUSD` and `priceBDT` strings ready for toggle

### Established Patterns
- Client components marked with `"use client"` at top of file — required for any interactive element
- Server actions preferred for form handling per PROJECT.md — use async server action for form submission
- Framer Motion already installed and used — can use for chart bar animations
- Section components in `src/components/sections/` are client components where needed

### Integration Points
- `src/app/pricing/page.tsx` — Convert to client component or extract pricing grid as client component
- `src/app/support/page.tsx` — Extract form section as client component, keep page as server component
- `src/data/pricing.ts` — Add `checkoutUrl` field to `PricingTier` interface
- `src/data/support.ts` — Update WhatsApp href from "#" to real `wa.me` link

</code_context>

<specifics>
## Specific Ideas

- The currency toggle should feel instant — no loading, no flash. useState swap with React re-render.
- WhatsApp BD note on pricing cards should be subtle (small text, not a full CTA button) — the main CTA stays "Buy Now"
- Count-up animation should use cubic ease-out for natural deceleration feel
- Hero dashboard chart bars can animate from 0% to their target height with staggered delay

</specifics>

<deferred>
## Deferred Ideas

- Actual email sending via Resend API — requires API key from developer (noted in STATE.md blockers)
- Real checkout URLs — developer must provide actual WooCommerce/EasyCart payment links
- Legal page content sourcing — deferred to Phase 7
- Full i18n content translation — deferred to Phase 9

</deferred>

---

*Phase: 06-interactive-features*
*Context gathered: 2026-05-12*
