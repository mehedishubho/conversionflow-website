# Phase 2: Homepage - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Port all homepage sections from `woobooster-v2.html` (lines 452-683) into Next.js React components. The homepage consists of 8 sections: Hero, Trust Bar, Features Bento Grid, Video Section, BD (Built for Bangladesh) Section, How It Works, Testimonials, and CTA Banner. All sections must match the visual design reference. The current `src/app/page.tsx` is a default Next.js starter placeholder that will be completely replaced.

HOME-05 ("All sections match visual design from `woobooster-v2.html`") is the binding constraint — every section in the HTML homepage template must be ported.

</domain>

<decisions>
## Implementation Decisions

### Hero Section (HOME-01)
- **D-01:** Recreate the hero dashboard mockup as a **full React component** (not an image or simplified version). The mockup contains: revenue/orders/blocked stats, a 7-day revenue chart bar visualization, and an order list with status badges. This is a key visual differentiator that demonstrates the product.
- **D-02:** The dashboard mockup uses a **CSS floating animation** (`mockFloat` keyframe) — implement via the existing `@keyframes meshFloat` pattern in `globals.css` or add the specific keyframe. No Framer Motion needed for this loop animation.
- **D-03:** The hero eyebrow badge (version pill with animated dot) and the word-by-word headline reveal are **porteda as-is** from the HTML reference. The word-by-word animation uses Framer Motion staggered children.
- **D-04:** Hero trust pills ("500+ Active Stores", "30-Day Money Back", "bKash & Nagad Ready") are static text with a green dot indicator — no animation needed beyond scroll-reveal entrance.
- **D-05:** Hero section is a **client component** — needs Framer Motion for entrance animations (staggered word reveal, CTA entrance, mockup float-in).
- **D-06:** Hero CTA buttons use the existing `.btn .btn-primary .btn-lg` and `.btn .btn-outline .btn-lg` classes from `globals.css`. Links go to `/pricing` and `/features` via Next.js `<Link>`.

### Trust Bar (HOME-03 partial)
- **D-07:** The trust bar with 5 stats (500+ Active Stores, 3 BD Couriers, 6 Tracking Platforms, 100% CAPI Accuracy, BDT Pricing) is a **client component** — the "500+" counter uses a count-up animation triggered by IntersectionObserver (implement via Framer Motion `useInView` + `useMotionValue` or a simple `useEffect` + `requestAnimationFrame` pattern matching the HTML reference).
- **D-08:** Other stat numbers (3, 6, 100%, BDT symbol) are **static** — no count-up animation. Only the first stat animates.

### Features Bento Grid (HOME-02)
- **D-09:** The 6-card bento grid is a **server component** — hover effects (border color change, lift, icon scale/rotate) are pure CSS transitions. No JavaScript interaction needed.
- **D-10:** The first card ("Automated Courier Sync") spans 2 columns (`.w2` equivalent). Implement via Tailwind `col-span-2` on the grid item.
- **D-11:** Each feature card has: icon emoji, title, description, and tags. All content is hardcoded (static marketing site).
- **D-12:** The bento grid uses CSS Grid: 3 columns on desktop, 2 on tablet (≤960px), 1 on mobile (≤640px). Matching the HTML reference responsive breakpoints.

### Video Section
- **D-13:** The video section is **included** in the homepage (HOME-05 requires all sections match). The section renders as a dark-background section with the video thumbnail UI mockup, play button with pulsing ring animation, and caption text.
- **D-14:** The video lightbox (`#vl`) is **not implemented** — there is no actual video content. The play button is decorative. If clicked, it does nothing (or optionally scrolls to features). This avoids building a lightbox system for placeholder content.
- **D-15:** The play button ring pulse animation is CSS-only (`@keyframes ringPulse`) — add to `globals.css`.

### BD Section ("Built for Bangladesh")
- **D-16:** This section is **included** in homepage scope. HOME-05 requires all sections match. The section contains: headline, description, order flow visualization (Pending → Shipped → Delivered / Returned), checkmark list, and courier cards with live indicators.
- **D-17:** The BD section is a **server component** — all interactivity is CSS-only (hover effects on courier cards: border color + translateX shift).
- **D-18:** Courier cards show "Live" badges with animated dots. The dot pulse animation reuses the existing `pulseDot` keyframe pattern.

### How It Works Section
- **D-19:** **Included** in homepage scope (HOME-05). Three step cards with number, title, and description. Hover effects are CSS-only (border color, translateY lift, shadow).
- **D-20:** This is a **server component** — no JavaScript interactivity.

### Testimonials Section (HOME-03)
- **D-21:** Three testimonial cards with star ratings, quotes (mix of Bangla and English text), author avatar (colored circle with initials), name, and store info. All hardcoded.
- **D-22:** This is a **server component** — hover effects are CSS-only.
- **D-23:** The decorative quote character (`❝`) positioned as a pseudo-element is implemented via a Tailwind `before:` utility or a CSS class in `globals.css`.

### CTA Banner (HOME-04)
- **D-24:** Full-width accent-colored banner with radial gradient overlay, BD tag, headline, subheadline, white CTA button, and note text.
- **D-25:** This is a **server component** — purely static content. CTA links to `/pricing`.
- **D-26:** Uses the existing `.btn-white` class from `globals.css`.

### Animation Strategy
- **D-27:** **Scroll-reveal animations** use Framer Motion `whileInView` with `once: true` (animate on first intersection only, matching the HTML's `IntersectionObserver` with `unobserve`). Each section's entrance uses a fade-up pattern (`opacity: 0 → 1`, `translateY: 32px → 0`).
- **D-28:** **Staggered delays** replicate the HTML's `.sr-d1` through `.sr-d4` classes using Framer Motion `transition.delay` on children.
- **D-29:** **Magnetic tilt cards** (the HTML's `mousemove` perspective rotation on `.bc`, `.tcard`, `.pc`, `.step-card`) are **not implemented** — this is a complex interaction that requires per-card mouse tracking with minimal visual payoff. CSS hover transitions (lift + shadow) provide sufficient interactivity.
- **D-30:** **Custom cursor** (`#cursor` element) is **not implemented** — it's a desktop-only novelty that conflicts with native cursor behavior and adds no value to a marketing site.
- **D-31:** **Page transition animations** (the HTML's `.leaving` class fade) are not needed — Next.js App Router handles page transitions differently. No custom page transition wrapper.

### Component Organization
- **D-32:** Section components live in `src/components/sections/` (new directory). One file per major section:
  - `HeroSection.tsx` (client — animations)
  - `TrustBar.tsx` (client — counter animation)
  - `FeaturesBento.tsx` (server — CSS-only hover)
  - `VideoSection.tsx` (server — CSS-only, decorative play button)
  - `BDSection.tsx` (server — CSS-only hover)
  - `HowItWorks.tsx` (server — CSS-only hover)
  - `Testimonials.tsx` (server — CSS-only hover)
  - `CTASection.tsx` (server — static)
- **D-33:** `src/app/page.tsx` becomes a thin composition layer that imports and renders all section components in order. It remains a **server component** (no `"use client"`).
- **D-34:** Sub-components used only within one section (e.g., `DashboardMockup`, `CourierCard`, `TestimonialCard`, `StepCard`) are co-located in the same file as their parent section component — not extracted into separate files unless reused across sections.

### Responsive Layout
- **D-35:** All responsive breakpoints match the HTML reference: 960px (tablet) and 640px (mobile). The Tailwind equivalents are `lg:` and `sm:` breakpoints, but the actual pixel values from the reference should be used with custom breakpoints or `max-` variants where Tailwind defaults don't align.
- **D-36:** The dashboard mockup in hero is **hidden on tablet/mobile** (`display:none` at ≤960px), matching the HTML reference where `.dash-mock{display:none}` at that breakpoint.

### Agent's Discretion
- Exact animation timing and easing curves — follow the HTML reference values (e.g., `cubic-bezier(.22,1,.36,1)` for entrances, `0.55s` for nav drop).
- Whether to add `@keyframes` for `mockFloat`, `pulseDot`, `underlineIn`, `ringPulse`, `wordUp` to `globals.css` or implement purely via Framer Motion — agent should choose the simplest approach per animation.
- Whether the dashboard mockup chart bars use hardcoded heights or generate from data — hardcoded is fine for a static marketing site.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` lines 452-683 — Homepage template (`<template id="tpl-home">`): hero (452-506), trust bar (509-519), features bento (522-568), video section (571-603), BD section (606-639), how it works (642-655), testimonials (658-670), CTA (673-683)
- `woobooster-v2.html` lines 88-324 — CSS for all homepage sections: hero styles (88-113), dashboard mock (115-142), trust bar (145-150), section commons (152-160), bento grid (163-172), video section (175-211), feature rows (214-263), how it works (266-271), testimonials (274-283), CTA banner (316-323)
- `woobooster-v2.html` lines 382-405 — Responsive breakpoints for homepage sections
- `woobooster-v2.html` lines 1107-1143 — JavaScript for scroll reveal and word-by-word reveal animations

### Existing Source Files
- `src/app/page.tsx` — Current placeholder (Next.js starter). Will be completely replaced.
- `src/app/globals.css` — Design tokens, `.hero-mesh`, `.glass`, button classes (`.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg`, `.btn-xl`, `.btn-white`). New keyframes and section-specific CSS needed.
- `src/app/layout.tsx` — Root layout with Navbar, Footer, ThemeProvider. No changes needed.
- `src/components/layout/Navbar.tsx` — Existing navbar with Framer Motion, Lucide icons, `cn()` usage pattern.
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge).

### Project Configuration
- `.planning/PROJECT.md` — Design fidelity constraint, tech stack
- `.planning/REQUIREMENTS.md` — HOME-01 through HOME-05 acceptance criteria
- `.planning/ROADMAP.md` — Phase 2 plans (02-01, 02-02, 02-03)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`cn()` from `@/lib/utils`**: Available for conditional class merging. Used extensively in Navbar — same pattern applies to section components.
- **Design token system**: Full light/dark theme CSS variables in `globals.css` (`:root` and `.dark`). All section colors map to existing tokens (`--accent`, `--surface`, `--border`, `--text2`, `--muted`, `--green`, `--red`, `--orange` and their variants).
- **Button classes**: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg`, `.btn-xl`, `.btn-white` all defined in `globals.css` (lines 118-161). Hero CTAs, CTA banner buttons use these directly.
- **`.hero-mesh` utility**: Already defined in `globals.css` (lines 102-116) with `::before` and `::after` pseudo-elements for the gradient orbs. Can be applied to the hero section directly.
- **`.glass` utility**: Glassmorphism effect available for any section that needs it.
- **Framer Motion**: Already used in Navbar (`motion.div`, `AnimatePresence`, `layoutId`). Same patterns apply to section animations.

### Established Patterns
- **Server components by default**: `page.tsx` and `layout.tsx` have no `"use client"`. Section components that don't need JS follow this pattern.
- **Client components for interactivity**: Mark with `"use client"` at top (Navbar.tsx pattern). Sections needing Framer Motion animations use this.
- **TailwindCSS v4 CSS-first**: All customization via `@theme` block and CSS variables. No `tailwind.config.js`.
- **Font system**: `font-syne` for headings, `font-dm-sans` for body — already available via CSS variables and Tailwind font classes.
- **Import style**: Named imports from packages, `@/` alias for internal modules.

### Integration Points
- `src/app/page.tsx` — Will be rewritten. Currently a placeholder.
- `src/app/globals.css` — New CSS keyframes and section-specific styles will be added here (following existing pattern of `@layer utilities` for custom classes).
- `src/components/sections/` — New directory for section components (does not exist yet).
- `src/app/layout.tsx` — No changes needed. Already wraps pages with Navbar + Footer.

</code_context>

<specifics>
## Specific Ideas

- The dashboard mockup in the hero is a key visual element that shows the product in action. It should feel like a real dashboard preview, not a generic illustration.
- Testimonial quotes include Bangla text — preserve the original language as in the HTML reference.
- The trust bar counter animation ("500+") should feel smooth and count up naturally, matching the HTML's 1800ms `requestAnimationFrame` animation.
- All emoji icons (🚚, 📊, 🛡️, 📈, 🛒, 💎, 📦, 🛵, 🔴, etc.) are preserved as-is from the HTML reference — they serve as feature icons.
- The hero section's `min-height: 100vh` ensures it fills the viewport. The content is vertically centered with padding.

</specifics>

<deferred>
## Deferred Ideas

None — all sections from the HTML homepage template are included in Phase 2 scope per HOME-05.

The following interactive features from the HTML reference are explicitly excluded from Phase 2 (they are JavaScript behaviors, not visual sections):
- Custom cursor (`#cursor`) — desktop novelty, conflicts with native cursor
- Magnetic tilt cards (`mousemove` perspective rotation) — complex, low ROI
- Video lightbox — no actual video content exists
- FAQ accordion — belongs to the Pricing page (Phase 3)
- Feature tabs — belongs to the Features page (Phase 3)

</deferred>

---

*Phase: 02-homepage*
*Context gathered: 2026-05-11*
