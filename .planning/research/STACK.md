# Technology Stack

**Project:** WooBooster Marketing Website
**Researched:** 2026-05-11
**Overall confidence:** HIGH

## Recommended Stack

### Core Framework (Already Installed)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 16.2.6 | Full-stack React framework | App Router with Server Components, SSG for marketing pages, built-in SEO metadata API, `output: 'standalone'` for self-hosting. Already chosen and correct. | HIGH |
| React | 19.2.4 | UI rendering | Server Components reduce client JS bundle. Already installed. | HIGH |
| TypeScript | 5.x | Type safety | Strict mode enabled. Non-negotiable for maintainability. | HIGH |
| TailwindCSS | 4.x | Styling | CSS-first config via `@theme` block is the v4 approach. Already set up with design tokens. | HIGH |
| Framer Motion | 12.38.0 | Animation | Standard for React animation. Page transitions, scroll reveals, stagger effects, shared layout animations. Already installed. | HIGH |
| next-themes | 0.4.6 | Dark/light theme | Class strategy works with Tailwind. Pin exact version (0.x means semver breaks possible). | MEDIUM |
| Lucide React | 1.14.0 | Icons | Tree-shakeable, consistent design, lightweight. Already installed. | HIGH |
| clsx + tailwind-merge | 2.1.1 / 3.6.0 | Class name utilities | `cn()` utility for conditional class merging. Already installed. | HIGH |

### MDX Blog (NEW -- Must Install)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @next/mdx | 16.2.6 | MDX compilation in Next.js | Official Next.js MDX plugin. Same version as Next.js. Supports Server Components, dynamic imports via `generateStaticParams`, file-based routing for `.mdx` pages. Verified in official docs. | HIGH |
| @mdx-js/loader | >=0.15.0 | MDX webpack/turbopack loader | Required peer dependency of `@next/mdx`. | HIGH |
| @mdx-js/react | >=0.15.0 | MDX React components | Required peer dependency of `@next/mdx`. | HIGH |
| @types/mdx | latest | TypeScript types for MDX | Type safety for MDX module imports. | HIGH |
| gray-matter | latest | Frontmatter parsing | `@next/mdx` does not support frontmatter natively. Extract title, date, description, tags from blog post headers. | HIGH |
| remark-gfm | latest | GitHub Flavored Markdown | Tables, strikethrough, task lists, autolinks in MDX content. Standard plugin. | HIGH |
| @tailwindcss/typography | 0.5.19 | Prose styles for MDX content | Adds `prose` classes for typographic styling of rendered markdown. Verified: peer dependency supports Tailwind `>=4.0.0-beta.1`. | HIGH |

**Why @next/mdx over alternatives:**
- **Not next-mdx-remote**: `next-mdx-remote` v6.0.0 is designed for remote/fetched MDX (from CMS, database). Our content is local files in the repo. `@next/mdx` handles local files natively with zero overhead.
- **Not Contentlayer**: Contentlayer is unmaintained and archived. Dead project.
- **Not Velite**: Velite is a newer alternative but adds unnecessary abstraction for a small blog. `@next/mdx` with `gray-matter` is simpler and officially supported.

**MDX setup pattern (from official Next.js docs):**
```
src/
  app/
    blog/
      page.tsx              # Blog listing (reads all .mdx from content/blog)
      [slug]/page.tsx       # Individual post (dynamic import by slug)
  content/
    blog/
      getting-started.mdx   # Blog posts with frontmatter
      courier-sync-guide.mdx
  mdx-components.tsx        # Global MDX component overrides
```

### i18n / Internationalization (NEW -- Must Install)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next-intl | latest | App Router i18n | First-class App Router support with request-scoped configuration. Verified: official docs show `createNextIntlPlugin()` setup. Supports locale-based routing (`/en/...`, `/bn/...`) and cookie-based locale detection. Active maintenance. | HIGH |

**Why next-intl over alternatives:**
- **Not next-i18next**: Built for Pages Router. Has App Router compatibility via wrappers but is fundamentally a Pages Router library. Adds unnecessary complexity.
- **Not next-i18n-router**: Minimal library, less community support, fewer features.
- **Not paraglide-next**: Newer but smaller ecosystem. next-intl is the established standard.

**next-intl setup pattern (from official docs):**
```
src/
  i18n/
    request.ts             # createRequestConfiguration
    routing.ts             # locale routing config
  messages/
    en.json                # English translations
    bn.json                # Bengali translations
  app/
    [locale]/
      layout.tsx           # Locale-aware layout
      page.tsx             # Locale-aware pages
```

**Architecture decision:** Use path-based locale routing (`/en/pricing`, `/bn/pricing`). English is primary/default. Bengali is secondary. This matches how both audiences naturally discover the site. Cookie-based fallback for returning visitors.

### Form Handling / Email (NEW -- Must Install)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Resend | 6.12.3 | Transactional email API | Modern email API. Clean Node.js SDK (verified: v6.12.3, requires Node >=20). Use for contact form submission emails. Server action calls Resend directly. No webhook setup needed. | HIGH |
| react-email | latest | Email templates | Build transactional email templates as React components. Pairs with Resend. | MEDIUM |

**Why Resend over alternatives:**
- **Not Nodemailer + SMTP**: Requires SMTP server configuration, harder to self-host reliably.
- **Not SendGrid**: Legacy API, heavier SDK, overkill for a contact form.
- **Not third-party form services (Formspree, Getform)**: Adds external dependency, monthly limits, less control.

**Pattern:** Server action receives form data, validates, sends via Resend API. No API routes needed.

```typescript
// src/app/actions/contact.ts
"use server"
import { Resend } from 'resend';
// Server action sends email directly
```

### SEO (Built into Next.js -- No Install Needed)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js Metadata API | built-in | Per-page metadata | `generateMetadata` export in each page. Open Graph, Twitter cards, title, description. Native to App Router. | HIGH |
| sitemap.ts | built-in | Dynamic sitemap generation | `src/app/sitemap.ts` using `generateSitemaps` function. Creates `sitemap.xml` at build time. | HIGH |
| robots.ts | built-in | Robots.txt generation | `src/app/robots.ts` export. Creates `robots.txt` allowing/disallowing crawlers. | HIGH |
| opengraph-image | built-in | OG image generation | `opengraph-image.tsx` in route directories. Generates social preview images using JSX. | HIGH |
| next-sitemap | NOT RECOMMENDED | -- | Unnecessary. Next.js 16 has built-in sitemap/robots support. Do not add this. | HIGH |

### Analytics (NEW -- Must Install)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Plausible Analytics | self-hosted | Privacy-first analytics | No cookies, no GDPR consent needed, lightweight script (<1KB). Self-hosted option available via Docker. Matches self-hosting requirement. | HIGH |

**Why Plausible over alternatives:**
- **Not Google Analytics**: Heavy script, privacy concerns, GDPR complications. Unnecessary for a marketing site.
- **Not Vercel Analytics**: Tied to Vercel platform. Project deploys self-hosted.
- **Not Umami**: Good alternative but Plausible has larger community and more documentation.
- **Not PostHog**: Overkill. Product analytics for a marketing site is wrong scope.

**Implementation:** Self-host Plausible on same VPS as the site. Add tracking script to root layout. Use `<Script>` component from Next.js for optimal loading.

### Self-Hosted Deployment (Infrastructure)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Docker | latest | Containerization | `output: 'standalone'` in `next.config.ts` produces minimal deployment. Wrap in Docker container. | HIGH |
| Node.js | >=20 | Runtime | Standalone output runs with Node.js. Resend requires Node >=20. | HIGH |
| Caddy or Nginx | latest | Reverse proxy | SSL termination, static asset serving, gzip compression. Caddy has automatic HTTPS. | HIGH |

**next.config.ts change required:**
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // Required for self-hosted Docker deployment
};
```

**Deployment pattern (verified from Next.js official docs):**
1. `pnpm build` produces `.next/standalone/` with minimal `server.js`
2. Copy `public/` and `.next/static/` into standalone output
3. Docker container runs `node server.js`
4. Reverse proxy handles SSL and serves static assets via CDN

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| sharp | latest | Image optimization | `next/image` uses it for optimized image processing on self-hosted (not needed on Vercel). Required for self-hosted deployment. | HIGH |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| MDX | @next/mdx | next-mdx-remote | For remote/fetched content. Our content is local files. |
| MDX | @next/mdx | Contentlayer | Unmaintained, archived project. Dead. |
| MDX | @next/mdx | Velite | Adds abstraction layer we don't need. @next/mdx is simpler for a small blog. |
| i18n | next-intl | next-i18next | Pages Router library. Clunky App Router adapter. |
| i18n | next-intl | paraglide-next | Smaller ecosystem, less mature. |
| Email | Resend | Nodemailer + SMTP | Requires SMTP server, harder to maintain. |
| Email | Resend | SendGrid | Heavier SDK, overkill for contact forms. |
| Analytics | Plausible | Google Analytics | Privacy issues, heavy script, GDPR complications. |
| Analytics | Plausible | Vercel Analytics | Tied to Vercel platform. We self-host. |
| SEO | Built-in Metadata API | next-sitemap | Next.js 16 has native sitemap/robots support. Redundant. |
| Deployment | Docker + standalone | Vercel | Project constraint: self-hosted. |
| State | None (useState) | Redux/Zustand | Overkill for a static marketing site. |
| CMS | Data files + MDX | Sanity/Contentful | Out of scope. Developer-managed content. |

## Installation

```bash
# MDX Blog
pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter remark-gfm @tailwindcss/typography

# i18n
pnpm add next-intl

# Email (contact forms)
pnpm add resend

# Image optimization (self-hosted)
pnpm add sharp

# Analytics (Plausible is self-hosted, just add script tag)
# No npm install needed -- add <script> tag to layout
```

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| next-sitemap | Next.js 16 has built-in sitemap support via `src/app/sitemap.ts` |
| next-i18next | Pages Router library, clunky with App Router |
| next-mdx-remote | Designed for remote/fetched MDX; our content is local |
| Contentlayer | Unmaintained, archived |
| Google Analytics | Privacy issues, heavy, GDPR complications for BD+global audience |
| Vercel Analytics | Tied to Vercel; we self-host |
| Redux/Zustand/Jotai | No client-side state complexity warrants this |
| Styled-components/Emotion | CSS-in-JS is declining; Tailwind is the standard |
| GSAP | Framer Motion covers our animation needs; GSAP adds weight and licensing complexity |
| Shadcn/ui | Adds component dependency for a site with custom design tokens. Build custom. |
| Radix UI | Overkill for a marketing site. Use native HTML + Tailwind. |
| middleware.ts | Project rule: use proxy.ts instead |

## Configuration Changes Required

### next.config.ts
```typescript
import createMDX from '@next/mdx';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
```

### New Files Required
- `mdx-components.tsx` (root level) -- Required by @next/mdx for App Router
- `src/app/sitemap.ts` -- Dynamic sitemap generation
- `src/app/robots.ts` -- Robots.txt
- `src/i18n/request.ts` -- next-intl request configuration
- `src/messages/en.json` -- English translations
- `src/messages/bn.json` -- Bengali translations

## Confidence Assessment

| Area | Confidence | Source | Notes |
|------|------------|--------|-------|
| Core Framework | HIGH | Already installed and verified | Next.js 16, React 19, TypeScript, TailwindCSS 4 |
| MDX Blog | HIGH | Next.js official docs + npm registry | @next/mdx@16.2.6 verified, official docs read in full |
| i18n (next-intl) | HIGH | next-intl official docs + npm registry | App Router setup verified in official docs |
| Email (Resend) | HIGH | npm registry | v6.12.3 verified, clean Node.js SDK |
| SEO (built-in) | HIGH | Next.js official docs | Metadata API, sitemap.ts, robots.ts all native |
| Analytics (Plausible) | MEDIUM | Training data | Well-established but version not verified via registry |
| Self-hosting | HIGH | Next.js official docs | `output: 'standalone'` documented and verified |
| @tailwindcss/typography | HIGH | npm registry | v0.5.19, peer dep supports Tailwind >=4.0.0-beta.1 |

## Sources

- Next.js MDX docs: https://nextjs.org/docs/app/building-your-application/configuring/mdx (read in full)
- next-intl App Router docs: https://next-intl.dev/docs/getting-started/app-router (read in full)
- Next.js output/standalone docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/output (read in full)
- npm registry: @next/mdx@16.2.6, next-mdx-remote@6.0.0, resend@6.12.3, @tailwindcss/typography@0.5.19
- Project source: package.json, globals.css, next.config.ts, PROJECT.md

---
*Research completed: 2026-05-11. Versions verified against npm registry and official documentation.*
