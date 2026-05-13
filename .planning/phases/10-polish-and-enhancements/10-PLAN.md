# Phase 10: Polish and Enhancements

This phase brings the site from functional to premium by addressing typographic weight issues, improving animation choreography with Framer Motion, rebuilding the custom cursor for smoother physics, and ensuring consistent responsive degradation across devices.

## Proposed Changes

### 1. Typography Fixes

#### [MODIFY] src/app/[locale]/layout.tsx
- Replace the `DM_Sans` override mapped to `--font-syne` with the correct `Syne` Google Font import.
- Ensure the weight range includes `900` to fix the missing weights in headings.

### 2. Custom Cursor Improvements

#### [MODIFY] src/components/layout/CustomCursor.tsx
- Refactor the component to use `framer-motion` (`useMotionValue`, `useSpring`) instead of vanilla `requestAnimationFrame`.
- Retain the check for touch devices `(pointer: coarse)` so it's disabled on mobile/tablet.

### 3. Animation Choreography

#### [NEW] src/components/layout/ScrollReveal.tsx
- Create a reusable `ScrollReveal` Framer Motion wrapper component.
- Utilize `whileInView` with `viewport={{ once: true, margin: "-100px" }}` to trigger simple, elegant fade-up animations as sections enter the screen.

#### [MODIFY] src/app/[locale]/page.tsx (and related structural components)
- Wrap key structural sections (Hero, Bento Grid, Features, etc.) with the new `ScrollReveal` component to orchestrate the page entrance.

### 4. Responsive Degradation & Layout

#### [MODIFY] src/app/globals.css
- Audit the existing media queries (`@media (max-width: 960px)` and `640px`).
- Ensure the "Balanced Degradation" strategy is applied:
  - Tablet (`960px`): Ensure grids drop to 2 columns appropriately with balanced padding.
  - Mobile (`640px`): Stack securely to 1 column. 

## Verification Plan

### Automated Tests
- Run `pnpm lint` and `pnpm build` to verify no typescript errors were introduced by the Framer Motion hooks.

### Manual Verification
- **Visual inspection on desktop:** Verify Syne 900 renders properly in `<h1>` / `.sec-title` tags without synthetic browser bolding.
- **Visual inspection on desktop:** Verify the custom cursor tracks the pointer smoothly with spring physics and blend-mode styling.
- **Scroll test:** Confirm sections fade-up elegantly without causing layout shifts or scroll jank.
- **Responsive test:** Simulate tablet (768px) and mobile (375px) in DevTools to ensure column structures degrade cleanly.
