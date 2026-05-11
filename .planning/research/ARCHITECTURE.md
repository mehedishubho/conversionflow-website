# Architecture Research: WooCommerce Plugin Marketing Site

**Research Date:** 2026-05-11

## Standard Architecture

### Component Structure
```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, theme, nav, footer)
│   ├── page.tsx                  # Homepage (hero + sections)
│   ├── features/page.tsx         # Features page
│   ├── pricing/page.tsx          # Pricing page
│   ├── changelog/page.tsx        # Changelog page
│   ├── support/page.tsx          # Support page
│   └── not-found.tsx             # Custom 404
├── components/
│   ├── layout/                   # Shell components (nav, footer, theme)
│   ├── sections/                 # Homepage sections (hero, features preview, pricing preview, CTA)
│   ├── features/                 # Feature page components
│   ├── pricing/                  # Pricing page components
│   ├── ui/                       # Reusable primitives (Button, Card, Badge)
│   └── icons/                    # Custom SVG components (if needed)
├── lib/
│   ├── utils.ts                  # cn() and other utilities
│   └── constants.ts              # Site-wide constants (nav links, pricing data)
└── styles/                       # (optional) Component-specific CSS modules
```

### Data Flow
```
Static Content (hardcoded) → Server Components → HTML
                              ↓
                    Client Components (interactivity)
                              ↓
                    Theme Provider (dark/light)
                    Navbar (mobile menu, scroll)
                    Animations (Framer Motion)
```

### Component Boundaries
- **Server Components**: Pages, layouts, static content sections
- **Client Components**: Navbar, ThemeProvider, interactive elements (toggles, mobile menu, animated sections)
- **Shared**: UI primitives (Button, Card), utilities (cn)

## Build Order (Dependencies)

1. **Foundation** — Fix build errors, create utilities
   - `src/lib/utils.ts` (cn function)
   - `src/components/layout/Footer.tsx`
   - Button CSS classes in `globals.css`

2. **Homepage** — Port hero and key sections from HTML reference
   - Hero section with CTA
   - Features preview section
   - Social proof / testimonials section
   - CTA section

3. **Content Pages** — Individual route pages
   - Features page (detailed feature showcase)
   - Pricing page (tiers, comparison)
   - Changelog page (version history)
   - Support page (FAQ, contact)

4. **Polish** — Cross-cutting improvements
   - Custom 404 page
   - SEO metadata (OG tags, structured data)
   - Scroll animations
   - Performance optimization
   - Custom favicon/brand assets

5. **Quality** — Testing and CI
   - Unit tests for utilities
   - Component tests for Navbar, Footer
   - E2E tests for critical flows
   - CI/CD pipeline

## Key Patterns for Marketing Sites

- **Section-based homepage**: Each section is a self-contained component with its own styling
- **Shared layout shell**: Navbar + Footer wrap all pages consistently
- **Content as constants**: Pricing tiers, feature lists, nav links defined as data arrays, not inline JSX
- **Responsive-first**: Design for mobile, enhance for desktop
- **Progressive enhancement**: Animations are decorative, not functional — site works without JS

## Integration Points (Future)

- **CMS**: If content needs to be editable, integrate with headless CMS (Sanity, Contentful)
- **Analytics**: Add Vercel Analytics or Plausible for traffic insights
- **Forms**: Support page may need a contact form (server action or third-party)
