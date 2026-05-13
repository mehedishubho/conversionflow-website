# Phase 10: Polish and Enhancements

This phase brings the site from functional to premium by removing unused typographic elements, improving animation choreography with Framer Motion, rebuilding the custom cursor for smoother physics, and ensuring consistent responsive degradation across devices.

## Proposed Changes

### 1. Typography Simplification

#### [MODIFY] src/app/[locale]/layout.tsx & globals.css
- Completely remove all references to the `Syne` font across the project.
- Rename the font variable from `--font-syne` to `--font-dm-sans` to accurately reflect the use of `DM_Sans` for all text (headings and body).
- Update `globals.css` to remove the `.font-syne` utility class and any `font-family: var(--font-syne)` CSS rules, standardizing the entire site on `DM_Sans`.

### 2. Header & General Responsiveness

#### [MODIFY] src/components/layout/Navbar.tsx & globals.css
- **Header Responsiveness:** Audit the padding, flex gap, and alignment in the `Navbar.tsx` specifically for mobile (below 640px) and tablet views. Ensure the Language Toggle, Theme Toggle, and Mobile Menu toggle fit comfortably on narrow screens (e.g., iPhone SE) without overlapping or breaking layout.
- **General Responsiveness:** Apply the "Balanced Degradation" strategy to the rest of the site (Bento grids drop to 2 columns on tablet, stack to 1 column on mobile).

### 3. Custom Cursor Improvements

#### [MODIFY] src/components/layout/CustomCursor.tsx
- Refactor the component to use `framer-motion` (`useMotionValue`, `useSpring`) instead of vanilla `requestAnimationFrame` for a premium, buttery-smooth feel.
- Retain the check for touch devices `(pointer: coarse)` so it's disabled appropriately.

### 4. Animation Choreography

#### [NEW] src/components/layout/ScrollReveal.tsx
- Create a reusable `ScrollReveal` Framer Motion wrapper component.
- Utilize `whileInView` with `viewport={{ once: true, margin: "-100px" }}` to trigger simple, elegant fade-up animations.

#### [MODIFY] src/app/[locale]/page.tsx (and related structural components)
- Wrap key structural sections (Hero, Bento Grid, Features, etc.) with the new `ScrollReveal` component to orchestrate the page entrance via elegant fade-ups.

## Verification Plan

### Automated Tests
- Run `pnpm lint` and `pnpm build` to verify no typescript errors were introduced by the Framer Motion hooks and font variables removal.

### Manual Verification
- **Visual inspection on desktop:** Verify `DM_Sans` is applied cleanly across all headings.
- **Responsive test (Header):** Test the Navbar down to 320px width in browser dev tools to confirm all elements are accessible and don't wrap incorrectly.
- **Visual inspection on desktop:** Verify the custom cursor tracks the pointer smoothly with spring physics and blend-mode styling.
- **Scroll test:** Confirm sections fade-up elegantly without causing layout shifts or scroll jank.
