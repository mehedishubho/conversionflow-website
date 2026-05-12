---
phase: 06-interactive-features
reviewed: 2026-05-12T12:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/hooks/useCountUp.ts
  - src/components/sections/TrustBar.tsx
  - src/components/sections/HeroSection.tsx
  - src/components/sections/PricingGrid.tsx
  - src/data/pricing.ts
  - src/data/support.ts
  - src/app/pricing/page.tsx
  - src/components/sections/ContactForm.tsx
  - src/app/support/page.tsx
findings:
  critical: 1
  warning: 1
  info: 4
  total: 6
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-05-12T12:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed 9 files covering interactive features: animated counters (useCountUp hook), TrustBar, HeroSection with dashboard mock, PricingGrid with currency toggle, ContactForm with validation, and data files for pricing/support. The code is generally well-structured with proper TypeScript types, correct React patterns, and appropriate use of IntersectionObserver and framer-motion.

One critical issue found: the ContactForm displays a success message to users but silently discards form data without sending it anywhere. This is a deceptive UX that should be addressed before launch. One warning relates to a hardcoded phone number duplicated across two files.

## Critical Issues

### CR-01: ContactForm shows fake success message without sending data

**File:** `src/components/sections/ContactForm.tsx:49-58`
**Issue:** The `handleSubmit` function validates the form, then sets `submitted = true` which renders a "Message Sent!" success screen. However, no data is actually transmitted -- there is no API call, no email send, no server action. The comment on line 57 acknowledges this ("Resend deferred"), but from the user's perspective they believe their message was delivered. This is functionally deceptive: users fill out a form, see a confirmation, and their message is silently lost.
**Fix:**
```typescript
// Option A: Add a server action to actually send the email
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }
  setIsSubmitting(true);
  try {
    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setSubmitted(true);
  } catch {
    setErrors({ message: "Failed to send. Please try again or email us directly." });
  } finally {
    setIsSubmitting(false);
  }
}

// Option B (interim): Replace success message with a WhatsApp/mailto link
// so the user still has a path to reach support.
```

## Warnings

### WR-01: Hardcoded WhatsApp phone number duplicated across files

**File:** `src/components/sections/PricingGrid.tsx:67` and `src/data/support.ts:24`
**Issue:** The WhatsApp phone number `8801721328992` is hardcoded in two separate places: as a direct string in `PricingGrid.tsx` line 67 (`https://wa.me/8801721328992`) and in `support.ts` line 24. If the number changes, it must be updated in multiple files. This is a maintenance risk that could lead to inconsistent contact info.
**Fix:** Extract the phone number into a shared constant, ideally in the support data file, and reference it from PricingGrid:
```typescript
// src/data/support.ts
export const WHATSAPP_NUMBER = "8801721328992";

// src/components/sections/PricingGrid.tsx
import { WHATSAPP_NUMBER } from "@/data/support";
// ...
href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(tier.whatsappMessage)}`}
```

## Info

### IN-01: Documentation channel href is a dead placeholder link

**File:** `src/data/support.ts:31`
**Issue:** The Documentation support channel has `href: "#"` which navigates to the top of the current page instead of actual documentation. This is clearly a placeholder awaiting a docs site.
**Fix:** Update to the real docs URL when available, or remove the card until docs exist to avoid confusing users with a non-functional link.

### IN-02: HTML entity usage in JSX where plain character suffices

**File:** `src/components/sections/HeroSection.tsx:81-83` and `src/components/sections/HeroSection.tsx:118`
**Issue:** Uses `&amp;` in JSX text content (lines 81, 83, 118). React JSX allows `&` directly -- the `&amp;` entities are unnecessary and make the source harder to read. This also appears in `src/app/support/page.tsx:28` with `We&apos;ve` -- though `&apos;` is useful to avoid quote escaping.
**Fix:** Replace `&amp;` with `&` in JSX text nodes. Keep `&apos;` for apostrophes if preferred for readability.

### IN-03: Inline styles used where Tailwind classes would be more consistent

**File:** `src/components/sections/ContactForm.tsx:65-68`, `src/components/sections/PricingGrid.tsx:57-63`
**Issue:** Several components mix inline `style` attributes with Tailwind utility classes and custom CSS classes. For example, ContactForm's success screen uses inline styles for centering and font size, while PricingGrid's button uses inline styles for width and padding. This is inconsistent with the project's Tailwind-first styling convention.
**Fix:** Replace inline styles with equivalent Tailwind utility classes:
```tsx
// Instead of style={{ width: "100%", justifyContent: "center", padding: "13px", cursor: "pointer" }}
className="btn btn-primary btn-lg w-full justify-center p-[13px] cursor-pointer"
```

### IN-04: CSS class name `tstat` may be a typo for `t-stat`

**File:** `src/components/sections/TrustBar.tsx:31`
**Issue:** The class name `tstat` on line 31 and `tstat-n` / `tstat-l` on lines 37-39 follow an abbreviated pattern that differs from other kebab-case class names used elsewhere (e.g., `trust-bar`, `pop-tag`). If `tstat` is intentional shorthand, this is purely cosmetic. If it is a typo for `t-stat`, it would only matter if the CSS definitions do not match.
**Fix:** Verify CSS definitions match. Consider renaming to `t-stat` for consistency with the project's kebab-case convention if the CSS side uses that spelling.

---

_Reviewed: 2026-05-12T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
