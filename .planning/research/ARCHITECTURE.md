# Architecture Patterns

**Domain:** Next.js 16 marketing website (WooBooster)
**Researched:** 2026-05-11
**Confidence:** HIGH (based on codebase analysis + official Next.js docs)

## Recommended Architecture

The site uses a **layered App Router architecture** with Server Components by default, Client Components only for interactivity, and static content driven by TypeScript data files. The architecture must accommodate planned growth: i18n (English + Bengali), MDX blog, server actions for forms, and self-hosted standalone deployment.

### Target Directory Structure

```
src/
├── app/                              # Next.js App Router (routing + layouts)
│   ├── [lang]/                       # i18n route segment (future)
│   │   ├── layout.tsx                # Locale-aware layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── changelog/page.tsx
│   │   ├── support/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog listing
│   │   │   └── [slug]/page.tsx       # Individual MDX posts
│   │   ├── docs/
│   │   │   ├── page.tsx              # Docs landing
│   │   │   └── [...slug]/page.tsx    # Doc pages
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── refund/page.tsx
│   │   └── license/page.tsx
│   ├── layout.tsx                    # Root layout (fonts, html, body)
│   ├── globals.css                   # Design tokens + Tailwind
│   └── not-found.tsx                 # Global 404
├── components/
│   ├── layout/                       # Shell components (rendered by root layout)
│   │   ├── Navbar.tsx                # Client component (scroll, mobile, theme)
│   │   ├── Footer.tsx                # Server component
│   │   ├── ThemeProvider.tsx         # Client component (next-themes wrapper)
│   │   └── PageTransition.tsx        # Client component (Framer Motion wrapper)
│   ├── sections/                     # Homepage + reusable page sections
│   │   ├── HeroSection.tsx           # Client component (animations)
│   │   ├── TrustBar.tsx              # Client component (count-up animation)
│   │   ├── FeaturesBento.tsx         # Server component
│   │   ├── VideoSection.tsx          # Server component (placeholder)
│   │   ├── BDSection.tsx             # Server component
│   │   ├── HowItWorks.tsx            # Server component
│   │   ├── Testimonials.tsx          # Server component
│   │   ├── CTASection.tsx            # Server component
│   │   ├── FAQAccordion.tsx          # Client component (toggle state)
│   │   ├── ScrollReveal.tsx          # Client component (IntersectionObserver)
│   │   └── PageHero.tsx              # Server component (reusable page header)
│   ├── ui/                           # Generic reusable primitives
│   │   ├── Button.tsx                # Server/client (based on usage)
│   │   ├── Badge.tsx                 # Server component
│   │   ├── Card.tsx                  # Server component
│   │   ├── Accordion.tsx             # Client component
│   │   └── VideoPlayer.tsx           # Client component (lightbox)
│   └── blog/                         # Blog-specific components
│       ├── BlogCard.tsx              # Server component
│       ├── MDXComponents.tsx         # Custom MDX rendering components
│       └── TableOfContents.tsx       # Client component
├── content/                          # MDX blog posts and docs
│   ├── blog/
│   │   ├── getting-started.mdx
│   │   └── courier-sync-guide.mdx
│   └── docs/
│       ├── installation.mdx
│       └── meta-capi-setup.mdx
├── data/                             # Static content as TypeScript data files
│   ├── navigation.ts                 # Nav links, footer links
│   ├── pricing.ts                    # Pricing tiers, features, BDT/USD values
│   ├── features.ts                   # Feature modules with details
│   ├── changelog.ts                  # Version history entries
│   ├── testimonials.ts               # Customer testimonials
│   ├── faq.ts                        # FAQ items
│   ├── couriers.ts                   # BD courier data
│   └── support.ts                    # Support channels, contact info
├── i18n/                             # Internationalization
│   ├── dictionaries/
│   │   ├── en.json                   # English translations
│   │   └── bn.json                   # Bengali translations
│   ├── config.ts                     # Locale list, default locale, routing config
│   └── get-dictionary.ts             # Translation loader (server-only)
├── lib/
│   ├── utils.ts                      # cn() className merger
│   ├── mdx.ts                        # MDX utilities (getPost, getAllPosts)
│   └── constants.ts                  # Shared constants
└── actions/                          # Server actions
    └── contact.ts                    # Contact form submission handler

public/
├── images/                           # Optimized images
│   ├── og/                           # Open Graph images per page
│   └── brand/                        # Logo, favicon variants
├── favicon.svg
└── robots.txt
```

### Component Boundaries

| Component | Type | Responsibility | Communicates With |
|-----------|------|---------------|-------------------|
| `app/layout.tsx` | Server | HTML shell, font loading, global metadata | ThemeProvider, Navbar, Footer |
| `ThemeProvider` | Client | Wraps next-themes provider | Root layout (renders it), Navbar (reads theme) |
| `Navbar` | Client | Navigation, scroll detection, mobile menu, theme toggle | Router (usePathname), ThemeProvider (useTheme) |
| `Footer` | Server | Footer links, brand info, legal links | None (pure presentational) |
| `PageTransition` | Client | Framer Motion page enter/exit animations | Layout (wraps children) |
| `ScrollReveal` | Client | IntersectionObserver-based scroll animation | Section components (wraps them) |
| `FAQAccordion` | Client | Toggle open/close state for FAQ items | None (self-contained state) |
| `TrustBar` | Client | Count-up animation on scroll | None (self-contained state) |
| Pages (page.tsx) | Server | Compose sections, export metadata | Section components, data files |
| Data files | Module | Static content (pricing, features, changelog) | Pages import them |
| Server actions | Server | Form handling (contact form) | Support page (form submission) |
| i18n dictionaries | JSON | Translated strings | Pages via getDictionary() |

### Data Flow

```
[TypeScript Data Files] ──import──> [Server Component Pages]
                                            │
                                            ├── renders ──> [Server Section Components]
                                            │                      │
                                            │                      └── wrapped by ──> [ScrollReveal]
                                            │
                                            └── renders ──> [Client Section Components]
                                                                   │
                                                                   ├── reads ──> [next-themes context]
                                                                   ├── reads ──> [Router state]
                                                                   └── manages ──> [Local UI state]

[MDX Files in /content] ──dynamic import──> [Blog/Doc Pages via generateStaticParams]

[i18n JSON dictionaries] ──getDictionary()──> [Pages access via lang param]

[Contact Form] ──form action──> [Server Action] ──> [Email send (Resend/Nodemailer)]
```

**Theme Data Flow:**
```
Root Layout (suppressHydrationWarning)
  └── ThemeProvider (wraps app with next-themes context)
        ├── Navbar reads theme via useTheme(), toggles light/dark
        └── CSS variables in globals.css switch between :root and .dark
```

**Navigation Data Flow:**
```
Navbar reads usePathname() → determines active link
  └── Framer Motion layoutId="active-nav" animates underline to active link
  └── AnimatePresence handles mobile menu enter/exit
```

## Patterns to Follow

### Pattern 1: Data-First Content Architecture
**What:** Extract all hardcoded content into TypeScript data files under `src/data/`.
**When:** For any content that appears in JSX as inline text arrays (pricing tiers, changelog entries, testimonials, FAQs, nav links).
**Why:** Separates content from presentation, enables i18n translation later, allows content reuse across pages.
**Example:**

```typescript
// src/data/pricing.ts
export const pricingTiers = [
  {
    plan: "Starter",
    price: { usd: 29, bdt: 3499 },
    period: "one-time",
    features: [/* ... */],
    popular: false,
  },
  // ...
] as const;

// src/app/pricing/page.tsx imports from data
import { pricingTiers } from "@/data/pricing";
```

**Current state:** Pricing page already has data inline. Changelog page has data inline. FAQAccordion has data inline. All need extraction to `src/data/`.

### Pattern 2: Server Component by Default
**What:** All components are Server Components unless they need `useState`, `useEffect`, browser APIs, or event handlers.
**When:** Every component creation decision.
**Example:**

```typescript
// Server Component (default) - no "use client"
export function FeaturesBento() {
  return <section>...</section>;
}

// Client Component - ONLY when interactivity is needed
"use client";
export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  // ...
}
```

**Current state:** Correctly applied in existing codebase. FeaturesBento, BDSection, HowItWorks, Testimonials, CTASection, VideoSection, Footer are all Server Components. HeroSection, ScrollReveal, TrustBar, Navbar, FAQAccordion are Client Components (correctly, since they use hooks/animations).

### Pattern 3: Reusable PageHero Component
**What:** Extract the repeated page-hero-sm pattern from Features, Pricing, Changelog, and Support pages into a shared component.
**When:** Multiple pages share identical hero structure with eyebrow, title, subtitle.
**Example:**

```typescript
// src/components/sections/PageHero.tsx
interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <div className="page-hero-sm">
      <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
        <div className="eyebrow">{eyebrow}</div>
        <div className="sec-title" style={{ fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-2px" }}>
          {title}
        </div>
        <p className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
```

### Pattern 4: Framer Motion Page Transitions via Layout
**What:** Wrap `{children}` in the layout with a Framer Motion AnimatePresence component that animates page transitions.
**When:** Route changes should feel smooth rather than instant hard swaps.
**Example:**

```typescript
// src/components/layout/PageTransition.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 5: i18n via Dynamic Route Segment with Dictionary Files
**What:** Use App Router `[lang]` dynamic segment with JSON dictionary files and `generateStaticParams` for static generation of both locales.
**When:** Supporting English (primary) and Bengali (secondary).
**Why:** This is the officially recommended Next.js i18n pattern. It keeps translations as simple JSON, works with Server Components (no client-side bundle cost), and supports static generation.
**Example:**

```typescript
// src/i18n/config.ts
export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// src/i18n/get-dictionary.ts
import "server-only";
import { type Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  bn: () => import("./dictionaries/bn.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

// src/app/[lang]/page.tsx
import { getDictionary } from "@/i18n/get-dictionary";

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <h1>{dict.hero.title}</h1>;
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "bn" }];
}
```

**Important:** This requires restructuring the entire `app/` directory to nest under `[lang]/`. This is a significant migration that should be planned as its own phase.

### Pattern 6: MDX Blog via Dynamic Imports
**What:** Store MDX files in `src/content/blog/`, load them dynamically in `[slug]` pages using `generateStaticParams`.
**When:** Blog section with developer-authored posts.
**Why:** Official `@next/mdx` pattern. Supports React components inside posts. Statically generated at build time. No CMS dependency.
**Configuration required:**

```typescript
// next.config.ts - add MDX support
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
```

**Required files:**
- `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx` packages
- `mdx-components.tsx` at project root (required by @next/mdx)
- `src/content/blog/*.mdx` for posts
- `src/lib/mdx.ts` for utilities like `getAllPosts()`, `getPost(slug)`

### Pattern 7: Server Actions for Contact Form
**What:** Use Next.js Server Actions (async functions with `"use server"`) for the support page contact form.
**When:** Form submission needs to send email without exposing API logic to the client.
**Example:**

```typescript
// src/actions/contact.ts
"use server";
import { redirect } from "next/navigation";

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Validate inputs
  if (!name || !email || !message) {
    return { error: "All fields are required" };
  }

  // Send email (Resend, Nodemailer, etc.)
  // await sendEmail({ to: "mhs@wpmhs.com", subject: `Support: ${subject}`, ... });

  redirect("/support?success=true");
}
```

**Support page form** would use `action={submitContactForm}` on a native `<form>` element, enabling progressive enhancement (works without JavaScript).

### Pattern 8: Self-Hosted Standalone Deployment
**What:** Configure `output: "standalone"` in `next.config.ts` for minimal Docker/VPS deployment.
**When:** Self-hosted deployment (not Vercel).
**Why:** Produces a minimal `.next/standalone/` folder with only necessary files, no full `node_modules`. Includes a `server.js` that replaces `next start`.
**Configuration:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  // If images need optimization, configure allowed domains
  images: {
    remotePatterns: [
      // Add any external image sources here
    ],
  },
};
```

**Deployment steps:**
1. `pnpm build` produces `.next/standalone/`
2. Copy `public/` and `.next/static/` into the standalone output
3. Run `node .next/standalone/server.js` (or Dockerize)

**Important:** The project rules require `proxy.ts` instead of `middleware.ts`. In Next.js 16, proxy files handle server-side routing logic. For i18n locale detection, the proxy file would handle redirect logic that was previously middleware-based.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client Components for Static Content
**What:** Marking sections as "use client" when they contain no interactivity.
**Why bad:** Ships unnecessary JavaScript to the browser, increases bundle size, hurts performance.
**Instead:** Default to Server Components. Only add "use client" when the component uses `useState`, `useEffect`, event handlers, or browser APIs.

**Current codebase status:** Correctly applied. `FeaturesBento`, `BDSection`, `HowItWorks`, `Testimonials`, `CTASection`, `VideoSection`, `Footer` are all Server Components. No violations found.

### Anti-Pattern 2: Inline Data in Page Components
**What:** Defining arrays of pricing tiers, changelog entries, or FAQ items directly inside page components.
**Why bad:** Cannot be reused across pages. Cannot be translated. Cannot be tested independently. Makes components harder to read.
**Instead:** Extract to `src/data/*.ts` files and import.
**Current violations:** `pricing/page.tsx` has `pricingTiers` inline. `changelog/page.tsx` has `changelogEntries` and `tagLabels` inline. `FAQAccordion.tsx` has `faqItems` inline. All should be extracted.

### Anti-Pattern 3: Duplicated Page Hero Markup
**What:** Copy-pasting the `page-hero-sm` block across Features, Pricing, Changelog, Support pages.
**Why bad:** Any hero design change requires updating 4+ files. Inconsistent styling drifts over time.
**Instead:** Create a reusable `PageHero` component.
**Current violations:** All four content pages have identical hero structure duplicated.

### Anti-Pattern 4: CSS-in-JS for a Tailwind Project
**What:** Using styled-components, Emotion, or other CSS-in-JS libraries.
**Why bad:** Conflicts with TailwindCSS v4's CSS-first approach. Adds bundle weight. Requires client component boundary.
**Instead:** Use Tailwind utility classes and CSS custom properties (the existing pattern).

### Anti-Pattern 5: Barrel Files (index.ts Re-exports)
**What:** Creating `src/components/index.ts` that re-exports everything.
**Why bad:** Defeats tree-shaking. Next.js bundler cannot optimize imports through barrel files. Slows builds as the project grows.
**Instead:** Import directly from component files: `import { Navbar } from "@/components/layout/Navbar"`.

### Anti-Pattern 6: Global State Management for a Static Marketing Site
**What:** Adding Redux, Zustand, or other state management libraries.
**Why bad:** A marketing site has minimal state (theme toggle, mobile menu, form inputs). Local component state is sufficient.
**Instead:** Use `useState` in client components, `next-themes` for theme, and server-side data resolution for content.

## Scalability Considerations

| Concern | At 5 pages (current) | At 15 pages (with blog/docs/legal) | At 50+ pages |
|---------|---------------------|------------------------------------|--------------|
| Build time | < 10s | 15-30s (MDX compilation) | 30-60s (may need ISR) |
| Data loading | Direct imports from data files | Same pattern, more files | Consider caching layer |
| i18n overhead | None | 2x routes (en/bn), 2x static pages | Manageable with generateStaticParams |
| Bundle size | Small (mostly server components) | Grows with blog MDX components | Lazy load heavy components |
| Image assets | Minimal | Blog post images need optimization | Consider CDN for images |

## Build Order Implications (Dependencies Between Components)

The architecture imposes a strict dependency order for implementation:

```
Phase 1: Foundation (no dependencies)
├── src/lib/utils.ts
├── src/components/layout/Footer.tsx
├── globals.css (button utilities)
└── src/data/navigation.ts (extract nav links)

Phase 2: Homepage (depends on Phase 1)
├── src/components/sections/HeroSection.tsx
├── src/components/sections/TrustBar.tsx
├── src/components/sections/FeaturesBento.tsx
├── src/components/sections/VideoSection.tsx
├── src/components/sections/BDSection.tsx
├── src/components/sections/HowItWorks.tsx
├── src/components/sections/Testimonials.tsx
├── src/components/sections/CTASection.tsx
├── src/components/sections/ScrollReveal.tsx
└── src/app/page.tsx (composes sections)

Phase 3: Content Pages (depends on Phase 2)
├── src/components/sections/PageHero.tsx (reusable)
├── src/components/sections/FAQAccordion.tsx
├── src/data/pricing.ts
├── src/data/changelog.ts
├── src/data/faq.ts
├── src/data/testimonials.ts
├── src/app/features/page.tsx
├── src/app/pricing/page.tsx
├── src/app/changelog/page.tsx
└── src/app/support/page.tsx

Phase 4: Polish (depends on Phase 3)
├── src/app/not-found.tsx
├── SEO metadata per page
├── public/favicon.svg
└── Performance optimization

Phase 5: i18n Infrastructure (BREAKING CHANGE - restructures app/)
├── src/i18n/config.ts
├── src/i18n/get-dictionary.ts
├── src/i18n/dictionaries/en.json
├── src/i18n/dictionaries/bn.json
├── Migrate all pages under src/app/[lang]/
└── src/proxy.ts (locale detection and redirect)

Phase 6: Blog (depends on Phase 5 for i18n, or Phase 4 if i18n deferred)
├── @next/mdx setup (next.config.ts modification)
├── mdx-components.tsx (project root)
├── src/lib/mdx.ts
├── src/content/blog/*.mdx
├── src/components/blog/BlogCard.tsx
├── src/app/[lang]/blog/page.tsx
└── src/app/[lang]/blog/[slug]/page.tsx

Phase 7: Server Actions + Deployment (depends on Phase 6)
├── src/actions/contact.ts
├── Support page form wired to server action
├── output: "standalone" in next.config.ts
├── Dockerfile or deployment config
└── proxy.ts for server-side routing
```

**Key dependency:** i18n is a structural breaking change that moves all pages under `[lang]/`. It should either be done early (before blog/docs/legal pages exist) or late (as a focused migration phase). Mid-project i18n introduction is the worst option.

## Architecture Decision Records

### ADR-1: Data Files over CMS
**Decision:** Use TypeScript data files (`src/data/*.ts`) for all content.
**Context:** Small team, developer-managed content, no non-technical editors.
**Consequence:** Content changes require code commits. No admin UI. Version-controlled content. Zero infrastructure cost.

### ADR-2: @next/mdx over next-mdx-remote
**Decision:** Use `@next/mdx` (official plugin) for blog posts, not `next-mdx-remote`.
**Context:** Blog posts are local files in the repository, not fetched from a CMS.
**Consequence:** Posts must be `.mdx` files in the project. Cannot fetch remote MDX at runtime. Simpler setup. Better build performance.

### ADR-3: App Router i18n over next-intl
**Decision:** Use the native App Router `[lang]` pattern with JSON dictionaries, not a third-party i18n library.
**Context:** Only 2 locales (en, bn). Simple translation needs (no pluralization, no complex date formatting). Project rules prefer minimal dependencies.
**Consequence:** No library overhead. Manual locale routing logic. Must implement own dictionary loading (trivial with dynamic imports). If needs grow complex, `next-intl` can be adopted later.

### ADR-4: standalone output over static export
**Decision:** Use `output: "standalone"` in next.config.ts, NOT `output: "export"`.
**Context:** Server actions (contact form) require a Node.js server. MDX dynamic imports work better with SSR. ISR may be needed for blog.
**Consequence:** Requires Node.js runtime on the server. Cannot deploy to pure static hosting. Enables all Next.js features including server actions.

### ADR-5: proxy.ts over middleware.ts
**Decision:** Use `proxy.ts` per project rules, not `middleware.ts`.
**Context:** Next.js 16 recommends proxy over legacy middleware. Project AGENTS.md mandates this.
**Consequence:** Uses the proxy file convention for locale detection, redirects, and rewrites. Same capabilities as middleware but following the newer API.

## Sources

- Next.js official docs: Routing Internationalization (https://nextjs.org/docs/app/building-your-application/routing/internationalization) -- HIGH confidence
- Next.js official docs: Configuring MDX (https://nextjs.org/docs/app/building-your-application/configuring/mdx) -- HIGH confidence
- Next.js official docs: Deploying / Self-Hosting (https://nextjs.org/docs/app/building-your-application/deploying) -- HIGH confidence
- Next.js official docs: output configuration (https://nextjs.org/docs/app/api-reference/config/next-config-js/output) -- HIGH confidence
- Existing codebase analysis: all 20+ source files reviewed for current patterns -- HIGH confidence
