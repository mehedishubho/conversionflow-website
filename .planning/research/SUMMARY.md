# Research Summary: WooBooster Website

**Synthesized:** 2026-05-11
**Confidence:** HIGH

## Executive Summary

WooBooster is a marketing website for a WooCommerce plugin targeting Bangladeshi store owners, ported from a 1247-line HTML design reference into a Next.js 16 application. The recommended approach is a phased build starting with foundation fixes, then homepage, content pages, and polish. The core stack is correct. Key risks are Framer Motion overuse on low-end Android devices, TailwindCSS v4 token registration inconsistencies, Bengali font support gaps, and self-hosted deployment configuration.

## Stack Recommendations

| Area | Recommendation | Confidence |
|------|---------------|------------|
| Framework | Next.js 16 App Router (already installed) | HIGH |
| Styling | TailwindCSS v4 CSS-first (already installed) | HIGH |
| Animation | Framer Motion with CSS-first convention | HIGH |
| MDX Blog | @next/mdx + gray-matter + remark-gfm + @tailwindcss/typography | HIGH |
| i18n | next-intl with [lang] route segment | HIGH |
| Email | Resend via server actions | HIGH |
| Analytics | Self-hosted Plausible | MEDIUM |
| SEO | Built-in Next.js (sitemap.ts, robots.ts, Metadata API) | HIGH |
| Deployment | output: 'standalone' in next.config.ts + sharp | HIGH |
| Icons | Lucide React (already installed) | HIGH |

## Key Findings

### Stack
- Core stack (Next.js 16, React 19, TailwindCSS 4, Framer Motion) is already correct — no dependency changes needed
- MDX blog requires @next/mdx official plugin (not next-mdx-remote), plus gray-matter for frontmatter
- i18n should use next-intl (not next-i18next) for first-class App Router support
- Self-hosting requires `output: 'standalone'` in next.config.ts plus sharp for image optimization
- SEO needs no additional packages — Next.js 16 has built-in sitemap, robots, and metadata
- Contact form email should use Resend (modern, clean SDK, works with server actions)
- Analytics should use self-hosted Plausible (privacy-first, lightweight, no cookies)

### Features
- HTML design reference is unusually comprehensive — nearly every table-stakes feature is already specified
- BD-specific branding (bKash/Nagad badges, Bengali testimonials, BDT pricing, BD courier chips) is the biggest differentiator
- Pricing page follows correct one-time payment pattern with 3 tiers and "Most Popular" anchoring
- USD/BDT currency toggle is a key differentiator for serving both local and international audiences
- Mobile is the primary viewport for BD traffic (70%+) — equal priority is the right call

### Architecture
- Server/Client Component boundaries are already well-established in existing code
- Data extraction to `src/data/*.ts` is the most impactful immediate improvement
- Shared PageHero component would eliminate duplication across 4 pages
- i18n via [lang] dynamic route segment is the official pattern but is a structural breaking change
- MDX blog requires next.config.ts modifications and mdx-components.tsx registration
- Server actions for contact form are the right pattern — progressive enhancement, works without JS

### Pitfalls
- **Critical: Syne font weight 900 used in CSS but only 600/700/800 loaded** — synthetic bold renders incorrectly
- **Critical: TailwindCSS v4 @theme block doesn't register all CSS variables** — inconsistent token references
- **Critical: Self-hosted deployment config is missing** — next.config.ts is empty
- **Critical: Bengali font support entirely absent** — Syne and DM Sans don't include Bengali character ranges
- **High: Framer Motion overuse risk** — CSS should handle one-time entrances, FM only for interactive elements
- **High: Dark theme flash on self-hosted** — next-themes injection script may not inline in standalone output
- **High: MDX blog is not a drop-in feature** — requires dedicated config and content loading strategy

## Roadmap Implications

### Suggested Build Order (4 phases)

1. **Foundation** — Fix broken build (Footer, utils, CSS classes), configure standalone output, fix font weights, establish data layer and token conventions
2. **Homepage** — Port all 8 sections from HTML, establish server/client component patterns, build reusable components
3. **Content Pages** — Features, Pricing (with USD/BDT toggle), Changelog, Support (with functional contact form), Blog, Docs, Legal
4. **Polish** — i18n infrastructure (English + Bengali), SEO metadata, Lighthouse optimization, analytics, deployment config

### Phase Dependencies
- Foundation must complete before any page work (build is currently broken)
- Homepage establishes all shared components used by content pages
- Data extraction must happen before i18n (translating data files > translating inline JSX)
- i18n route restructuring should happen as a focused migration, not mid-content page development
- MDX blog setup modifies next.config.ts — should be a standalone task within content pages phase

### Open Questions
- Blog language: English only initially, or bilingual from day one?
- Custom cursor: hard requirement or nice-to-have? (High performance cost for cosmetic feature)
- Self-hosting target: Docker, bare metal VPS, or PM2?
- External checkout URL for "Buy Now" buttons
- Video section: keep "coming soon" placeholder or embed real video before launch?
- Legal page content: drafted by lawyer or standard WooCommerce plugin templates?

## Confidence Assessment

| Area | Level | Notes |
|------|-------|-------|
| Core framework choices | HIGH | Already installed and verified |
| Component architecture | HIGH | Based on codebase analysis |
| Feature requirements | HIGH | HTML design reference is comprehensive |
| BD market fit | MEDIUM | Based on design reference + project context |
| Self-hosted deployment | HIGH | Official Next.js docs verified |
| i18n approach | HIGH | next-intl docs verified |
| Animation performance | MEDIUM | Depends on target device capabilities |
| Payment integration | MEDIUM | Routing specifics TBD |

---
*Research synthesized: 2026-05-11*
