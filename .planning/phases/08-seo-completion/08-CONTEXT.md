# Phase 8: SEO Completion - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 completes technical SEO and lightweight analytics for the public WooBooster marketing site. The phase delivers native Next.js sitemap and robots routes, cookie-free analytics loading, and enough verification that Google Search Console can discover the sitemap. It does not add new marketing pages, search UI, A/B testing, or i18n routing.

</domain>

<decisions>
## Implementation Decisions

### Sitemap and Robots
- **D-01:** Use native Next.js App Router metadata routes: `src/app/sitemap.ts` and `src/app/robots.ts`. Do not add `next-sitemap`.
- **D-02:** Sitemap should include all current public routes: home, features, pricing, changelog, support, blog listing, all blog posts, docs landing, all doc pages, and all legal pages.
- **D-03:** Use `https://woobooster.com` as the canonical production origin, matching the existing `metadataBase` in `src/app/layout.tsx`.
- **D-04:** `robots.txt` should allow normal search engine crawling and point to `https://woobooster.com/sitemap.xml`.
- **D-05:** Exclude internal/generated/runtime paths from robots where relevant, such as Next internals and API-like paths if present later. No admin routes currently exist.

### Analytics
- **D-06:** Use self-hosted Plausible Analytics as the Phase 8 analytics provider.
- **D-07:** Analytics must be cookie-free and privacy-friendly; do not add a cookie consent banner for Phase 8.
- **D-08:** Load analytics globally from the root layout with Next.js `Script`, using an after-interactive strategy or equivalent non-blocking load.
- **D-09:** Keep analytics configuration environment-friendly: allow script domain/API host to be configured by env var if needed, but default the tracked domain to `woobooster.com`.
- **D-10:** Analytics should track normal page views only. Do not add event tracking, funnels, A/B testing, or conversion instrumentation in this phase.

### Verification
- **D-11:** Verify `/sitemap.xml` and `/robots.txt` are accessible after build/dev server start.
- **D-12:** Verify sitemap includes Phase 7 blog/docs/legal routes as well as core marketing pages.
- **D-13:** Verify analytics script markup appears in the root document without requiring cookies.
- **D-14:** `pnpm build` remains the primary automated gate. Full `pnpm lint` has known unrelated noise from generated `.claude/worktrees/**/.next` output and a pre-existing Navbar lint issue; planner should use scoped lint for Phase 8 changed files unless lint config is explicitly cleaned up in a separate task.

### the agent's Discretion
- Exact `changeFrequency` and `priority` values per route type.
- Whether sitemap route data is hand-authored or composed from small route arrays/helpers.
- Exact environment variable names for analytics host/script source, as long as defaults are sensible and documented in code or plan.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 8 goal, requirements, and success criteria.
- `.planning/REQUIREMENTS.md` - SEO-03, SEO-04, and SEO-05 requirements.
- `.planning/PROJECT.md` - Self-hosting, pnpm-only, privacy-conscious marketing-site constraints.

### Prior SEO Decisions
- `.planning/phases/04-polish/04-CONTEXT.md` - Existing metadata decisions, canonical domain, Metadata API pattern, favicon and OG conventions.
- `.planning/phases/04-polish/04-01-SUMMARY.md` - Confirms root/page metadata was added in Phase 4.

### Phase 7 Public Routes
- `.planning/phases/07-blog-docs-and-legal/07-VERIFICATION.md` - Verified public blog/docs/legal routes that must be represented in sitemap.
- `.planning/phases/07-blog-docs-and-legal/07-01-SUMMARY.md` - MDX metadata helpers and content files.
- `.planning/phases/07-blog-docs-and-legal/07-02-SUMMARY.md` - Blog route structure.
- `.planning/phases/07-blog-docs-and-legal/07-03-SUMMARY.md` - Docs route structure.
- `.planning/phases/07-blog-docs-and-legal/07-04-SUMMARY.md` - Legal route structure and footer links.

### Existing Source Files
- `src/app/layout.tsx` - Root metadata, canonical `metadataBase`, and the correct integration point for global analytics script.
- `src/lib/mdx.ts` - Source of blog and docs slugs for sitemap generation.
- `src/data/docs-nav.ts` - Docs route inventory.
- `src/data/navigation.ts` - Public footer/top-level route inventory.
- `next.config.ts` - Existing standalone and MDX configuration; do not disturb unless required.

### Research
- `.planning/research/STACK.md` - Recommends native Next.js sitemap/robots and self-hosted Plausible; explicitly rejects `next-sitemap`.
- `.planning/research/PITFALLS.md` - Pitfall 20 covers missing `robots.txt` and `sitemap.xml`.
- `.planning/research/FEATURES.md` - Notes cookie consent banner is unnecessary when using no-cookie analytics and not targeting EU-specific tracking.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/mdx.ts` exposes `getBlogPosts()` and `getDocPosts()`, which can generate dynamic sitemap entries for MDX blog/docs content.
- `src/data/docs-nav.ts` defines the expected docs categories and slugs.
- `src/data/navigation.ts` contains public marketing/footer routes and already points blog/docs/legal links to real pages.

### Established Patterns
- App Router server files are used by default.
- Page-level metadata already exists for core pages, blog, docs, and legal routes.
- Root `metadataBase` is already `https://woobooster.com`.
- The project uses pnpm only and Next.js 16 native platform features where available.

### Integration Points
- `src/app/sitemap.ts` should generate `/sitemap.xml`.
- `src/app/robots.ts` should generate `/robots.txt`.
- `src/app/layout.tsx` should load the Plausible script globally via `next/script`.
- Verification should start a local server or use Next build output to confirm the generated metadata routes.

</code_context>

<specifics>
## Specific Ideas

- Recommended choices accepted: self-hosted Plausible, `woobooster.com`, and all public routes.
- Keep the implementation boring and durable: native Next.js metadata routes, no extra SEO packages, no analytics overreach.
- Plausible should be self-hosting-friendly. If a custom analytics host is needed, make that configurable without blocking local builds.

</specifics>

<deferred>
## Deferred Ideas

- Event tracking for pricing clicks, WhatsApp clicks, contact form submissions, and checkout conversions belongs in a later analytics/conversion phase.
- A/B testing infrastructure remains out of scope for v1.
- Cookie consent UX is deferred unless the analytics strategy changes or legal targeting requires it.
- i18n-aware sitemap entries should wait for Phase 9 because `[lang]` route migration is still future work.

</deferred>

---

*Phase: 08-seo-completion*
*Context gathered: 2026-05-12*
