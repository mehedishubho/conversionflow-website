# Phase 5: Data Layer - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract all hardcoded content from existing page components and sections into structured TypeScript data files in `src/data/`. Configure self-hosted deployment via Docker with Next.js standalone output. This is a pure refactoring phase — no visual changes, no new features. The data extraction unblocks i18n (Phase 9) and makes content maintainable.

</domain>

<decisions>
## Implementation Decisions

### Data Structure
- **D-01:** Each data file uses TypeScript interfaces co-located with the data — types defined in the same file as the data they describe. No separate types directory.
- **D-02:** Each file exports a single primary named export (e.g., `export const pricingTiers: PricingTier[] = [...]`) plus its interface. No barrel file.
- **D-03:** Data files contain only pure data (arrays, objects, primitives). No helper functions — any transformation logic lives in components or utils.
- **D-04:** Pricing data uses dual-currency structure per tier — each tier has both USD and BDT fields. The currency toggle (Phase 6) reads the appropriate field.

### Import Pattern
- **D-05:** Components import data directly from individual files: `import { pricingTiers } from '@/data/pricing'`. No barrel/index.ts file, no data hooks layer.

### Deployment Config
- **D-06:** Self-hosted deployment target is Docker. Create a `Dockerfile` using Next.js standalone output.
- **D-07:** Configure `output: 'standalone'` in `next.config.ts`. This produces `.next/standalone/` with minimal `server.js`.
- **D-08:** Install `sharp` for server-side image optimization (required for self-hosted, built-in on Vercel).

### Agent's Discretion
- Exact TypeScript interface field names and types for each data category
- Whether to add JSDoc comments to interfaces
- Dockerfile base image and layer caching strategy
- Whether to add `.dockerignore`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` — Contains all content that needs extracting: pricing tiers (lines 828-879), changelog entries (lines 916-949), testimonials (lines 665-668), features/modules (lines 529-566), FAQ (lines 894-899), support info (lines 966-969), navigation links (lines 431-437)

### Existing Source Files
- `src/components/layout/Navbar.tsx` — Contains inline `navLinks` array (lines 11-17) that needs extraction to `src/data/navigation.ts`
- `src/app/page.tsx` — Homepage with inline section content
- `src/app/pricing/page.tsx` — Pricing tiers and FAQ data inline
- `src/app/changelog/page.tsx` — Changelog entries inline
- `src/app/support/page.tsx` — Support cards and contact info inline
- `src/app/features/page.tsx` — Feature/module data inline
- `src/components/sections/` — Section components with inline content
- `next.config.ts` — Currently empty, needs `output: 'standalone'`

### Project Configuration
- `.planning/PROJECT.md` — Constraints: pnpm only, self-hosted deployment
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-07, FOUND-07 acceptance criteria
- `.planning/ROADMAP.md` — Phase 5 success criteria
- `.planning/research/STACK.md` — Self-hosting deployment recommendations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `cn()` utility at `src/lib/utils.ts` — Can be used in components that consume data-driven conditional classes
- Design token system in `globals.css` — All data-driven components already use these tokens
- Section components in `src/components/sections/` — Already built, just need data extraction from their inline content

### Established Patterns
- Server components by default — data files feed server components, no client-side data fetching needed
- Named exports for reusable items — data files should follow this pattern
- `@/*` path alias maps to `./src/*` — data files at `src/data/` import as `@/data/filename`

### Integration Points
- `src/data/` — New directory, 7 files to create (pricing.ts, changelog.ts, testimonials.ts, features.ts, faq.ts, support.ts, navigation.ts)
- `src/components/layout/Navbar.tsx` — Must update to import navLinks from `@/data/navigation`
- All page components — Must update to import their respective data files
- `next.config.ts` — Must add `output: 'standalone'`
- `package.json` — Must add `sharp` dependency

</code_context>

<specifics>
## Specific Ideas

- Data extraction should be mechanical — read the inline content, create the data file, update the import. No redesign.
- After extraction, pages must render identically — this is verifiable by running the dev server before and after.
- The Dockerfile should use multi-stage build for minimal image size.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-data-layer*
*Context gathered: 2026-05-11*
