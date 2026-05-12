# Phase 8: SEO Completion - Research

**Researched:** 2026-05-12
**Domain:** Next.js metadata routes, robots.txt, cookie-free analytics
**Confidence:** HIGH

## Summary

Phase 8 should use native Next.js App Router metadata route files instead of adding an SEO package. The official Next.js file conventions support `app/sitemap.ts` and `app/robots.ts`, both typed via `MetadataRoute`, and the project already has a canonical `metadataBase` of `https://woobooster.com`.

Analytics should be integrated with `next/script` from the root layout. Plausible's standard script is cookie-free, and its self-hosted deployment model allows the script URL to point at a project-controlled analytics host. The implementation should default the tracked domain to `woobooster.com` while allowing the script source and data domain to be overridden by public environment variables for production hosting.

Primary recommendation: create `src/app/sitemap.ts`, `src/app/robots.ts`, and add a single Plausible script in `src/app/layout.tsx`. Do not install `next-sitemap` or any analytics package.

## Official References

- Next.js sitemap metadata route: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js robots metadata route: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- Next.js Script component: https://nextjs.org/docs/app/api-reference/components/script
- Plausible script setup: https://plausible.io/docs/plausible-script
- Plausible self-hosting: https://plausible.io/docs/self-hosting

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-03 | `sitemap.xml` is accessible and lists all public pages | Use `src/app/sitemap.ts` returning `MetadataRoute.Sitemap`; compose static routes plus MDX blog/docs slugs from `src/lib/mdx.ts`. |
| SEO-04 | `robots.txt` is accessible and allows crawling | Use `src/app/robots.ts` returning `MetadataRoute.Robots`; allow `/`, disallow generated/internal paths, point to sitemap URL. |
| SEO-05 | Analytics tracks page views without cookies | Load Plausible script globally with `next/script`, `strategy="afterInteractive"`, `defer`, and `data-domain="woobooster.com"`. |

## Implementation Notes

### Sitemap

Use `MetadataRoute.Sitemap` and build entries from:

- static marketing routes: `/`, `/features`, `/pricing`, `/changelog`, `/support`
- Phase 7 listing routes: `/blog`, `/docs`
- Phase 7 dynamic MDX routes: `/blog/[slug]`, `/docs/[slug]`
- Phase 7 legal routes: `/privacy`, `/terms`, `/refund`, `/license`

Use `getBlogPosts()` and `getDocPosts()` from `src/lib/mdx.ts` so the sitemap stays in sync with content files. Assign conservative `changeFrequency` and `priority` values:

- homepage: weekly, 1.0
- sales pages: monthly, 0.8 to 0.9
- blog/docs listings: weekly, 0.7
- individual blog/docs: monthly, 0.6
- legal pages: yearly, 0.3

### Robots

Use `MetadataRoute.Robots` with:

- `rules.userAgent = "*"`
- `rules.allow = "/"`
- `rules.disallow = ["/_next/", "/api/"]`
- `sitemap = "https://woobooster.com/sitemap.xml"`
- `host = "https://woobooster.com"`

The `/api/` rule is future-safe; no public API routes exist today.

### Analytics

Add `Script` to `src/app/layout.tsx` inside `<body>` so it applies to every route. Recommended constants:

```typescript
const plausibleDomain =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "woobooster.com";

const plausibleScriptSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ??
  "https://plausible.woobooster.com/js/script.js";
```

The self-hosted default is production-friendly for WooBooster. Deployments without a configured Plausible host can override `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC`; local builds still pass even if the remote script is unreachable.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Sitemap misses Phase 7 dynamic routes | Read slugs from `getBlogPosts()` and `getDocPosts()` instead of duplicating them manually. |
| Canonical domain drifts from root metadata | Use the same `https://woobooster.com` value as `metadataBase`. |
| Analytics blocks rendering | Use `next/script` with `strategy="afterInteractive"` and `defer`. |
| Analytics introduces cookies or consent burden | Use Plausible's standard no-cookie script and do not add event tracking in this phase. |
| Full lint reports unrelated noise | Use `pnpm build` as the hard gate and scoped ESLint for changed Phase 8 files, per phase context. |

## Out Of Scope

- Conversion/event tracking for buttons and forms
- Search Console verification meta tag
- `next-sitemap`
- RSS feeds
- i18n alternate sitemap entries
- Cookie consent UI
