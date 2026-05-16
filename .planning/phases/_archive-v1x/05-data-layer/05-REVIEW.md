---
phase: 05-data-layer
reviewed: 2026-05-12T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - .dockerignore
  - Dockerfile
  - next.config.ts
  - package.json
  - pnpm-workspace.yaml
  - src/app/changelog/page.tsx
  - src/app/features/page.tsx
  - src/app/pricing/page.tsx
  - src/app/support/page.tsx
  - src/components/layout/Footer.tsx
  - src/components/layout/Navbar.tsx
  - src/components/sections/FAQAccordion.tsx
  - src/components/sections/FeaturesBento.tsx
  - src/components/sections/Testimonials.tsx
  - src/data/changelog.ts
  - src/data/faq.ts
  - src/data/features.ts
  - src/data/navigation.ts
  - src/data/pricing.ts
  - src/data/support.ts
  - src/data/testimonials.ts
findings:
  critical: 1
  warning: 3
  info: 3
  total: 7
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-12
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

Reviewed 20 files comprising the data layer, page routes, layout components, section components, and Docker/build configuration for the WooBooster marketing website. The data layer files (`src/data/*.ts`) are well-structured with proper TypeScript interfaces and clean exports. The page components correctly export metadata for SEO and render content from data modules.

One critical build reliability issue was found: five runtime dependencies are imported in source code but missing from `package.json` and absent from the lockfile. The build succeeds locally only because stale `node_modules/` artifacts remain. Any clean install or CI/CD pipeline will fail.

Three warnings address non-functional UI elements: the features page tabs are static with no interactivity, the pricing page CTA buttons are `<span>` elements with no navigation, and the support page contact form has no `<form>` element, no `name` attributes, and no submission mechanism.

## Critical Issues

### CR-01: Missing runtime dependencies in package.json -- clean install will break

**File:** `package.json`
**Issue:** Five packages are imported in source files but are not declared in `package.json` and are absent from `pnpm-lock.yaml`:

| Package | Imported by |
|---|---|
| `clsx` | `src/lib/utils.ts` |
| `tailwind-merge` | `src/lib/utils.ts` |
| `framer-motion` | `src/components/layout/Navbar.tsx` |
| `lucide-react` | `src/components/layout/Navbar.tsx` |
| `next-themes` | `src/components/layout/Navbar.tsx` |

The build succeeds locally because these packages exist in `node_modules/` from a prior install state. However, `pnpm-lock.yaml` does not reference any of them, so a clean `pnpm install --frozen-lockfile` (as used in the Dockerfile on line 8) will not install them. This means the Docker build and any CI/CD pipeline will fail.

**Fix:**
```bash
pnpm add clsx tailwind-merge framer-motion lucide-react next-themes
```

This will add all five to `package.json` and update `pnpm-lock.yaml`.

## Warnings

### WR-01: Features page tabs are non-interactive -- no client directive or click handlers

**File:** `src/app/features/page.tsx:38-44`
**Issue:** The features page renders a row of filter tabs (`All Modules`, `Courier Sync`, `Tracking`, etc.) with a hardcoded `active` class on "All Modules". The component is a server component (no `"use client"`), so there are no click handlers. Users see what appear to be clickable tabs but nothing happens when they click them. This is a functional dead-end.

**Fix:** Either (a) add `"use client"` with `useState` to track the active tab and filter `detailModules` accordingly, or (b) remove the tab bar entirely if filtering is not needed at this stage. If option (a):

```tsx
"use client";

import { useState } from "react";
// ...existing imports...

const tabFilters: Record<string, string | null> = {
  "All Modules": null,
  "Courier Sync": "Module 01",
  "Tracking": "Module 02",
  "Fraud Shield": "Module 03",
  "Analytics": null,
  "Lead Recovery": null,
};

export default function Features() {
  const [activeTab, setActiveTab] = useState("All Modules");
  const filteredModules = activeTab === "All Modules"
    ? detailModules
    : detailModules.filter((m) => m.eyebrow === tabFilters[activeTab]);
  // ...render tabs with onClick and active state...
}
```

### WR-02: Pricing CTA buttons are non-functional `<span>` elements

**File:** `src/app/pricing/page.tsx:57-67`
**Issue:** Each pricing tier's call-to-action button (e.g., "Get Starter", "Get Professional", "Get Agency") is rendered as a `<span>` with `cursor: pointer` styling but no `href`, no `onClick`, and no navigation behavior. These are the primary conversion elements on the pricing page and they do nothing when clicked.

**Fix:** Replace `<span>` with `<Link>` pointing to the purchase/contact flow:
```tsx
<Link
  href={`/pricing?plan=${tier.plan.toLowerCase()}`}
  className={`btn ${tier.buttonStyle}`}
  style={{
    width: "100%",
    justifyContent: "center",
    padding: "13px",
  }}
>
  {tier.buttonText}
</Link>
```

### WR-03: Support contact form is entirely non-functional

**File:** `src/app/support/page.tsx:60-107`
**Issue:** The "Send Us a Message" contact form has multiple problems:
1. No `<form>` element wrapping the inputs -- just a `<div className="contact-form">`.
2. No `name` attributes on any `<input>` or `<textarea>` elements, so no data can be submitted.
3. No `action` or `method` on a form element.
4. The submit button is a `<span>` with no click handler.
5. No client-side state management or form validation.

This renders as a visual form but is completely non-functional.

**Fix:** Wrap inputs in a `<form>` with `name` attributes and add a server action or client-side handler. At minimum for the current static site, add `"use client"`, form state, and a `onSubmit` handler (even if it just shows a "coming soon" message):
```tsx
// In a separate client component file:
"use client";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire to server action or external service
    setSubmitted(true);
  };
  return (
    <form onSubmit={handleSubmit} className="contact-form">
      {/* inputs with name attributes */}
      <button type="submit" className="btn btn-primary btn-lg">
        {submitted ? "Message Sent!" : "Send Message →"}
      </button>
    </form>
  );
}
```

## Info

### IN-01: Multiple footer and navigation links are placeholder `href="#"` anchors

**File:** `src/data/navigation.ts:21,27,31-34`
**Issue:** Six links use `href: "#"` as placeholders: Documentation, Blog, Privacy Policy, Terms of Service, Refund Policy, and License Agreement. Clicking these scrolls the user to the top of the current page, which is confusing UX.

**Fix:** Either create the target pages and update the hrefs, or add a visual indicator that these are "coming soon" and use `href="/not-found"` or remove them until the pages exist.

### IN-02: WhatsApp support channel link is a dead placeholder

**File:** `src/data/support.ts:27`
**Issue:** The WhatsApp support entry displays the phone number `+880 1721-328992` but the `href` is `"#"` instead of a proper WhatsApp link.

**Fix:** Replace with a WhatsApp deep link:
```ts
href: "https://wa.me/8801721328992",
```

### IN-03: Copyright year is hardcoded to 2025

**File:** `src/components/layout/Footer.tsx:78`
**Issue:** The footer reads "2025 Devsroom" but the current year is 2026. This will need manual updating each year.

**Fix:** Use dynamic year generation:
```tsx
<div>© {new Date().getFullYear()} Devsroom · WooBooster. All rights reserved.</div>
```
Note: Since Footer is a server component, `new Date().getFullYear()` runs at build time, which is acceptable for a static site.

---

_Reviewed: 2026-05-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
