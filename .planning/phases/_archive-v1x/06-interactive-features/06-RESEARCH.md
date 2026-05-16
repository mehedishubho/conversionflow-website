# Phase 6: Interactive Features - Research

**Researched:** 2026-05-12
**Domain:** React client-side interactivity, form handling, scroll animations, currency switching
**Confidence:** HIGH

## Summary

Phase 6 converts existing static page elements into interactive, functional components. The four feature areas are: (1) currency toggle on the pricing page, (2) contact form with validation and success feedback, (3) Buy Now buttons linking to external checkout and WhatsApp, and (4) count-up animations on trust bar stats and dashboard numbers.

All the building blocks already exist in the codebase. TrustBar.tsx has a working `IntersectionObserver` + `requestAnimationFrame` count-up animation (hardcoded to 500). ScrollReveal.tsx demonstrates `useInView` from framer-motion. FAQAccordion.tsx shows the established client component pattern with `"use client"` and `useState`. The `cn()` utility and framer-motion are already installed and in use. No new dependencies are required for this phase.

The contact form currently uses uncontrolled `<input>` elements without `name` attributes, wrapped in a `<span>` instead of a `<form>` with `<button type="submit">`. Per D-06, actual email sending is deferred -- the server action will validate and return success without sending. This simplifies implementation significantly since no Resend API key is needed yet.

**Primary recommendation:** Reuse existing patterns (client components with `"use client"`, framer-motion's `useInView`, `cn()` for conditional classes). Extract a `useCountUp` hook from TrustBar's inline animation logic. Keep the pricing page as a server component and extract only the pricing card grid as a client component for currency toggle. Keep the support page as a server component and extract the contact form as a client component.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Toggle button style -- simple USD/BDT button pair, one highlighted, click to switch
- **D-02:** USD shows by default. BD users can switch to BDT
- **D-03:** When toggling, swap which price is primary (large) vs secondary (small). Both currencies always visible, just swap prominence
- **D-04:** Pricing page (or at least the pricing card grid) becomes a client component to support useState for currency state
- **D-05:** Form validates all fields (name, email, subject, message -- all required) with strict validation: email format check, character limits
- **D-06:** On valid submit, show a success confirmation message. No actual email sending for now (Resend API key needed -- deferred)
- **D-07:** Inline error messages below each field for validation failures
- **D-08:** Replace the `<span>` submit button with a real `<button type="submit">` inside a `<form>` wrapper
- **D-09:** Use React state for controlled form inputs with real `name` attributes
- **D-10:** Dual path: placeholder URLs for international checkout (replaceable later) + WhatsApp link for BD customers
- **D-11:** Small "Pay with bKash/Nagad via WhatsApp" note below the Buy Now button on each pricing card
- **D-12:** WhatsApp number from support data (src/data/support.ts). Pre-filled message with plan name
- **D-13:** Add `checkoutUrl` (placeholder) and `whatsappMessage` fields to pricing data (src/data/pricing.ts)
- **D-14:** Animate all 5 TrustBar stats + 3 hero dashboard numbers (Revenue, Orders, Blocked) with count-up on scroll
- **D-15:** Animate hero chart bars with staggered height animation
- **D-16:** 1.5 second animation duration -- snappy, not delayed
- **D-17:** Use IntersectionObserver (already in TrustBar) to trigger on scroll into view
- **D-18:** Generalize the existing count-up logic to work for any numeric stat target, not hardcoded to 500

### Claude's Discretion
- Exact animation easing curve for count-up
- Error message wording for form validation
- Exact WhatsApp pre-filled message text
- Whether to extract a reusable `useCountUp` hook or keep logic inline
- Chart bar animation timing/sequence

### Deferred Ideas (OUT OF SCOPE)
- Actual email sending via Resend API -- requires API key from developer (noted in STATE.md blockers)
- Real checkout URLs -- developer must provide actual WooCommerce/EasyCart payment links
- Legal page content sourcing -- deferred to Phase 7
- Full i18n content translation -- deferred to Phase 9
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRIC-02 | USD/BDT currency toggle switches all prices between dollar and taka | D-01 through D-04: Client component with useState, swap priceUSD/priceBDT prominence. Pricing data already has both fields. |
| PRIC-06 | "Buy Now" buttons link to external checkout; "WhatsApp" option shown for BD payment methods | D-10 through D-13: Add checkoutUrl + whatsappMessage to pricing data. Convert `<span>` to `<a>` with href. |
| SUPP-03 | Contact form sends email via server action using Resend | D-06: Deferred -- server action skeleton returns success without sending. Placeholder for future Resend integration. |
| SUPP-04 | Form validation provides inline error messages for required fields | D-05, D-07, D-09: Controlled inputs with useState, validate on submit, show errors below fields. |
| SUPP-05 | Success/error feedback displayed after form submission | D-06: Success state in component, reset form after successful submit. |
| HOME-10 | Count-up animations trigger on scroll for trust bar stats and dashboard numbers | D-14 through D-18: Generalize existing TrustBar count-up to a reusable hook. Apply to all stats + hero dashboard numbers. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 | Scroll-triggered animations, chart bar transitions | Already installed; used in TrustBar, ScrollReveal, Navbar, HeroSection |
| clsx | 2.1.1 | Conditional class merging | Already installed; used via `cn()` utility |
| tailwind-merge | 3.6.0 | Tailwind class dedup | Already installed; used via `cn()` utility |
| React 19 | 19.2.4 | useState, useRef, useEffect for client component state | Framework built-in |
| Next.js 16 | 16.2.6 | App Router, server actions, metadata API | Framework built-in |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.14.0 | Icons for form UI (optional) | If adding validation check/x icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom useCountUp hook | react-countup library | Library is overkill for 8 number animations; existing rAF pattern is simpler and already proven in TrustBar |
| Zod for form validation | Native JS validation | Zod adds dependency for 5 fields; native email regex + required checks are sufficient for this form |
| React Hook Form | Manual controlled inputs | RHF adds complexity for a single contact form; 5 controlled inputs are trivial without it |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

**Version verification:**
| Package | Installed | Latest on npm | Status |
|---------|-----------|---------------|--------|
| framer-motion | 12.38.0 | 12.38.0 | Current [VERIFIED: pnpm view] |
| next | 16.2.6 | 16.2.6 | Current [VERIFIED: pnpm view] |
| react | 19.2.4 | 19.2.6 | Minor patch behind; no action needed |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   └── useCountUp.ts          # NEW: Reusable count-up animation hook
├── components/
│   ├── sections/
│   │   ├── TrustBar.tsx        # MODIFY: Use useCountUp hook for all 5 stats
│   │   ├── HeroSection.tsx     # MODIFY: Count-up on dashboard stats + chart bar animation
│   │   ├── PricingGrid.tsx     # NEW: Client component for pricing cards with currency toggle
│   │   └── ContactForm.tsx     # NEW: Client component for validated contact form
│   └── layout/
├── app/
│   ├── pricing/
│   │   └── page.tsx            # MODIFY: Import PricingGrid client component
│   ├── support/
│   │   └── page.tsx            # MODIFY: Import ContactForm client component
│   └── ...
├── data/
│   ├── pricing.ts              # MODIFY: Add checkoutUrl, whatsappMessage fields
│   └── support.ts              # MODIFY: Real WhatsApp wa.me link
└── lib/
    └── utils.ts                # EXISTING: cn() utility, no changes
```

### Pattern 1: Client Component Extraction
**What:** Keep page components as server components (for metadata), extract interactive sections as client components
**When to use:** Any page that needs both server-side metadata and client-side interactivity
**Example:**
```typescript
// src/app/pricing/page.tsx -- SERVER COMPONENT (unchanged metadata)
import { PricingGrid } from "@/components/sections/PricingGrid";
import type { Metadata } from "next";

export const metadata: Metadata = { /* ... */ };

export default function Pricing() {
  return (
    <>
      <div className="page-hero-sm">{/* static hero */}</div>
      <section className="sec">
        <PricingGrid /> {/* CLIENT COMPONENT BOUNDARY */}
        <div className="trust-strip">{/* static */}</div>
        <FAQAccordion /> {/* existing client component */}
      </section>
    </>
  );
}
```

### Pattern 2: useCountUp Hook
**What:** Generalized count-up animation hook using IntersectionObserver + requestAnimationFrame
**When to use:** Any numeric stat that should animate when scrolled into view
**Example:**
```typescript
// src/hooks/useCountUp.ts
"use client";
import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  target: number;
  duration?: number;
  threshold?: number;
  suffix?: string;
}

export function useCountUp({ target, duration = 1500, threshold = 0.3 }: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            observer.unobserve(entry.target);

            const startTime = performance.now();
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Cubic ease-out: fast start, natural deceleration
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * target));

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(target);
              }
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, target, duration, threshold]);

  return { count, ref };
}
```

### Pattern 3: Controlled Form with Validation
**What:** React state manages form values, validation runs on submit, errors display inline
**When to use:** Simple forms without complex validation rules
**Example:**
```typescript
// src/components/sections/ContactForm.tsx
"use client";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  licenseKey: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", licenseKey: "", subject: "", message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email format";
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) errs.message = "Message is required";
    else if (formData.message.length < 10) errs.message = "Message must be at least 10 characters";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // D-06: No actual email sending -- deferred
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="contact-form" style={{ textAlign: "center", padding: "60px 40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
        <div className="sec-title" style={{ fontSize: "24px" }}>Message Sent!</div>
        <p className="sec-sub">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      {/* Controlled inputs with name attributes */}
      {/* Error messages below each field */}
    </form>
  );
}
```

### Pattern 4: Currency Toggle with useState
**What:** Simple USD/BDT toggle using a pair of buttons, one active, swapping price prominence
**When to use:** Dual-currency display where both values are always present but prominence changes
**Example:**
```typescript
// Inside PricingGrid client component
const [currency, setCurrency] = useState<"USD" | "BDT">("USD");

// Toggle UI
<div className="flex gap-2 justify-center mb-8">
  <button
    onClick={() => setCurrency("USD")}
    className={cn("btn", currency === "USD" ? "btn-primary" : "btn-outline")}
  >
    USD ($)
  </button>
  <button
    onClick={() => setCurrency("BDT")}
    className={cn("btn", currency === "BDT" ? "btn-primary" : "btn-outline")}
  >
    BDT (৳)
  </button>
</div>

// Price display per card -- swap prominence
<div className="p-price">
  {currency === "USD" ? tier.priceUSD : tier.priceBDT}
  <span>{tier.period}</span>
</div>
<div className="p-bdt" style={{ opacity: currency === "BDT" ? 0.5 : 1 }}>
  {currency === "USD" ? tier.priceBDT : tier.priceUSD}
</div>
```

### Pattern 5: WhatsApp Link Construction
**What:** Build wa.me URL with pre-filled message text
**When to use:** Directing BD customers to WhatsApp for payment
**Example:**
```typescript
// WhatsApp URL format: https://wa.me/{phone}?text={encodedMessage}
// Phone: 8801721328992 (from support data, no + or dashes)
// Pre-filled: "Hi, I'd like to purchase WooBooster [Plan Name]. I want to pay via bKash/Nagad."

const whatsappUrl = `https://wa.me/8801721328992?text=${encodeURIComponent(
  `Hi, I'd like to purchase WooBooster ${tier.plan}. I want to pay via bKash/Nagad.`
)}`;

<a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
  Pay with bKash/Nagad via WhatsApp
</a>
```

### Anti-Patterns to Avoid
- **Making the entire page a client component:** Only the interactive section needs `"use client"`. Keep the page.tsx as a server component for metadata exports. Extract the interactive grid/form as a separate client component.
- **Over-engineering form validation with Zod/RHF:** 5 fields with simple rules (required + email format) do not need a validation library. Native checks are clearer and zero-dependency.
- **Using CSS transitions for count-up:** requestAnimationFrame gives frame-perfect animation with easing curves. CSS animations can only transition between two states, not incrementally count.
- **Hardcoding animation targets:** The current TrustBar hardcodes `500` in three places. The new hook must accept `target` as a parameter.
- **Inline count-up logic duplicated across components:** Extract into a reusable `useCountUp` hook rather than copying rAF + IntersectionObserver code into HeroSection.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Intersection detection | Custom scroll listener with getBoundingClientRect | IntersectionObserver (native) or framer-motion `useInView` | Scroll listeners cause jank; IntersectionObserver is async and optimized |
| Eased animation loop | setInterval-based counting | requestAnimationFrame + cubic ease-out formula | rAF syncs to display refresh, gives smooth animation. setInterval can miss frames. |
| Class name toggling | String concatenation or template literals | `cn()` utility (clsx + tailwind-merge) | Handles falsy values, deduplicates Tailwind classes |
| Chart bar animations | Manual height manipulation with JS | framer-motion `motion.div` with animate prop | framer-motion handles layout animations, stagger delays, and hardware acceleration |

**Key insight:** The codebase already has the right patterns in place. TrustBar has the count-up animation, ScrollReveal has `useInView`, FAQAccordion has client component with `useState`. This phase is about reusing and generalizing, not introducing new patterns.

## Common Pitfalls

### Pitfall 1: Server/Client Component Boundary Misplacement
**What goes wrong:** Adding `"use client"` to a page.tsx that exports `metadata` -- Next.js will error because `generateMetadata` only works in server components.
**Why it happens:** Forgetting that page.tsx must remain a server component to export metadata.
**How to avoid:** Extract only the interactive section (pricing grid, contact form) as a separate client component. Import it into the server component page.
**Warning signs:** Build error: "You are attempting to export 'metadata' from a component marked with 'use client'"

### Pitfall 2: TrustBar Multiple IntersectionObservers
**What goes wrong:** If each stat creates its own IntersectionObserver, you get 5 observers for TrustBar alone plus more for hero stats.
**Why it happens:** Naively applying the useCountUp hook to each stat individually.
**How to avoid:** Have a single observer per component. TrustBar already uses one ref on the first stat. The hook approach should observe a parent container, and all stats animate together when that container enters view. Alternatively, use a single `hasAnimated` state at the component level, passing the same trigger to all stat counters.
**Warning signs:** Performance degradation on mobile; multiple callback invocations per scroll event.

### Pitfall 3: WhatsApp URL Malformed Phone Number
**What goes wrong:** Including + sign, dashes, or spaces in the wa.me URL phone number.
**Why it happens:** Copying the display format ("+880 1721-328992") directly into the URL.
**How to avoid:** Strip all non-digit characters from the phone number before constructing the URL. Format: `https://wa.me/8801721328992` (no +, no spaces, no dashes).
**Warning signs:** WhatsApp link opens but shows "phone number not found" or redirects to error page.

### Pitfall 4: Form State Lost on Re-render
**What goes wrong:** Form inputs become uncontrolled because value/state gets out of sync.
**Why it happens:** Using `defaultValue` instead of `value` for controlled inputs, or forgetting the `onChange` handler.
**How to avoid:** Every controlled input needs both `value={formData.field}` and `onChange={(e) => setFormData({...formData, field: e.target.value})}`. Alternatively, use a single update function: `const update = (field: keyof FormData) => (e) => setFormData(prev => ({...prev, [field]: e.target.value}))`.
**Warning signs:** React warning: "A component is changing an uncontrolled input to be controlled."

### Pitfall 5: Count-Up Animation Re-triggers
**What goes wrong:** Numbers animate again when navigating back to the page or re-scrolling.
**Why it happens:** Missing the `hasAnimated` guard in the IntersectionObserver callback.
**How to avoid:** The hook must track `hasAnimated` state and disconnect the observer after first trigger. The existing TrustBar code does this correctly -- the hook must preserve this behavior.
**Warning signs:** Stats re-animate every time user scrolls away and back.

### Pitfall 6: Chart Bar Animation Layout Shift
**What goes wrong:** Chart bars animate from 0 height, causing the chart container to resize during animation.
**Why it happens:** Bars with `height: 0` take no space, then grow and push other elements.
**How to avoid:** Use `transform: scaleY(0)` to `scaleY(1)` with `transform-origin: bottom` instead of animating `height`. This avoids layout recalculation. Or use framer-motion's `animate` with the final height values and let it handle the transition.
**Warning signs:** Chart container "jumps" when bars start animating.

## Code Examples

### Existing Count-Up Pattern (TrustBar.tsx lines 29-45)
```typescript
// CURRENT: Hardcoded to 500, single stat
const duration = 1800;
const startTime = performance.now();
const animate = (currentTime: number) => {
  const elapsed = currentTime - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
  setCount(Math.floor(eased * 500)); // HARDCODED TARGET
  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    setCount(500); // HARDCODED TARGET
  }
};
requestAnimationFrame(animate);
```

### Target: useCountUp Hook (Extracted)
```typescript
// src/hooks/useCountUp.ts -- generalized from TrustBar pattern
export function useCountUp({ target, duration = 1500, threshold = 0.3 }: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            observer.unobserve(entry.target);
            const startTime = performance.now();
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * target));
              if (progress < 1) requestAnimationFrame(animate);
              else setCount(target);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, target, duration, threshold]);

  return { count, ref };
}
```

### WhatsApp URL Construction
```typescript
// Format: https://wa.me/{digits-only}?text={encoded}
const phone = "8801721328992"; // from support data, digits only
const message = `Hi, I'd like to purchase WooBooster ${plan}. I want to pay via bKash/Nagad.`;
const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
```
[ASSUMED] -- WhatsApp wa.me URL format is stable and well-documented. The phone number format requires digits only (no + or dashes). The `text` parameter pre-fills the message input.

### Framer Motion Chart Bar Stagger
```typescript
// HeroSection dashboard chart bars -- staggered height animation
{chartBars.map((bar, i) => (
  <motion.div
    key={i}
    className={cn("cb", bar.color)}
    initial={{ scaleY: 0 }}
    animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    style={{ height: bar.height, transformOrigin: "bottom" }}
  />
))}
```

### Email Validation Regex
```typescript
// Standard email format check (no need for RFC 5322 full compliance)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  errors.email = "Please enter a valid email address";
}
```
[ASSUMED] -- This regex covers 99%+ of real-world email validation needs for a contact form. It checks: something@something.something. Not RFC-complete but sufficient for this use case.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<form>` with full page reload | Server actions with `useFormState` | Next.js 13+ | Progressive enhancement; works with JS disabled |
| Zod for all validation | Simple native checks for small forms | Evergreen | 5 fields don't need a schema library |
| CSS scroll-spy for animations | IntersectionObserver (native) + framer-motion useInView | ~2020 / 2022 | No scroll listeners, no layout thrashing |
| setInterval for count-up | requestAnimationFrame with easing | ~2015 | Frame-synced, no dropped frames |

**Deprecated/outdated:**
- `useFormState` / `useFormStatus` from `react-dom`: These React 19 experimental hooks are available but add unnecessary complexity for a simple contact form. Manual state management with `useState` is clearer. [ASSUMED]
- `getBoundingClientRect()` + scroll listeners for visibility detection: Replaced by IntersectionObserver (supported in all modern browsers).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | WhatsApp wa.me URL format (`https://wa.me/{digits}?text={encoded}`) is stable and correct | Code Examples | Link won't work; users can't reach WhatsApp |
| A2 | Email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is sufficient for contact form validation | Code Examples | Some valid emails rejected; not a critical issue for a contact form |
| A3 | `useFormState`/`useFormStatus` from React 19 add unnecessary complexity for this simple form | State of the Art | If wrong, we'd miss out on progressive enhancement; but the form still works fine with manual state |
| A4 | Framer-motion `motion.div` with `scaleY` is the best approach for chart bar animation | Code Examples | Alternative approaches exist (CSS height transition, Web Animations API) but framer-motion is already in the project |
| A5 | Phone number 8801721328992 (from support.ts display "+880 1721-328992") is correct for WhatsApp | Code Examples | If wrong, WhatsApp link goes to wrong number |

## Open Questions

1. **Should the useCountUp hook handle special formatting?**
   - What we know: TrustBar has stats like "100%" (suffix), "৳৳৳" (display override), "500+" (suffix + plus)
   - What's unclear: Whether the hook should return raw count and let the component handle formatting, or accept formatting options
   - Recommendation: Hook returns `{ count, ref }` only. Component handles formatting (suffix, prefix, display overrides). This keeps the hook simple and reusable.

2. **Should all TrustBar stats share one observer or each have their own?**
   - What we know: Currently only the first stat (500) animates, and it uses one observer on its ref
   - What's unclear: Whether to observe a parent container or use individual refs per stat
   - Recommendation: Single observer on a wrapper div ref. All stats start animating when the TrustBar enters view. This is more performant and creates a synchronized animation effect.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/run | Yes | - | - |
| pnpm | Package management | Yes | - | - |
| framer-motion | Animations | Yes | 12.38.0 | - |
| Next.js 16 | Framework | Yes | 16.2.6 | - |
| React 19 | UI runtime | Yes | 19.2.4 | - |

**Missing dependencies with no fallback:**
- None -- all required dependencies are already installed.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRIC-02 | Currency toggle switches USD/BDT prices | Manual (visual) | N/A | N/A |
| PRIC-06 | Buy Now links to external checkout; WhatsApp note visible | Manual (click test) | N/A | N/A |
| SUPP-03 | Form submits and shows success feedback | Manual (form fill) | N/A | N/A |
| SUPP-04 | Form validates required fields with inline errors | Manual (empty submit) | N/A | N/A |
| SUPP-05 | Success/error state renders after submission | Manual (form fill) | N/A | N/A |
| HOME-10 | Count-up animation triggers on scroll | Manual (scroll test) | N/A | N/A |

### Sampling Rate
- **Per task commit:** `pnpm build` (verify no compile errors)
- **Per wave merge:** `pnpm build` + manual visual testing
- **Phase gate:** Full `pnpm build` passes + all 6 requirements verified manually

### Wave 0 Gaps
- [ ] No test framework -- all testing is manual for this phase
- [ ] The marketing site has no test infrastructure and the interactive features are primarily visual/UX behaviors best tested manually
- [ ] If test coverage is desired in future phases, recommend adding Vitest + React Testing Library

**Note:** This is a marketing website with primarily visual/UX interactive features. The test value for "does a count-up animation look right" is limited compared to functional testing. Manual testing across light/dark mode and mobile/desktop is the pragmatic approach here.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth on marketing site |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Public pages only |
| V5 Input Validation | Yes | Form field validation before submission |
| V6 Cryptography | No | No sensitive data |

### Known Threat Patterns for Next.js Contact Forms

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via form fields | Tampering | React auto-escapes rendered content; no dangerouslySetInnerHTML used |
| Form spam/bot submission | Spoofing | Consider rate limiting or honeypot field in future (deferred -- no real email sending yet) |
| Email injection | Tampering | Not applicable yet -- no email sending (deferred per D-06) |
| CSRF | Tampering | Next.js server actions include CSRF protection by default [ASSUMED] |

## Sources

### Primary (HIGH confidence)
- Codebase analysis: TrustBar.tsx, HeroSection.tsx, PricingPage.tsx, SupportPage.tsx, pricing.ts, support.ts -- all source files read and analyzed in this session
- Existing patterns: ScrollReveal.tsx (useInView), FAQAccordion.tsx (client component + useState), globals.css (form styles)
- Package versions verified via `pnpm view` for framer-motion (12.38.0), next (16.2.6), react (19.2.6)

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions -- locked by user, treated as verified requirements
- WhatsApp wa.me URL format -- widely documented, format has been stable for years [ASSUMED]

### Tertiary (LOW confidence)
- None -- all claims are either verified from codebase or clearly tagged as [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies needed; all existing deps verified at current versions
- Architecture: HIGH -- patterns already established in codebase (client component extraction, cn() utility, framer-motion)
- Pitfalls: HIGH -- derived from direct codebase analysis of existing components and Next.js constraints

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (stable -- no fast-moving dependencies)
