# Phase 5: Data Layer - Research

**Researched:** 2026-05-11
**Domain:** Content extraction to TypeScript data files + Docker deployment configuration
**Confidence:** HIGH

## Summary

Phase 5 is a pure refactoring phase that extracts hardcoded content from 10 source files into 7 structured TypeScript data files in a new `src/data/` directory. Every page component and section component that currently contains inline arrays, objects, or string literals of business content will be refactored to import that data from dedicated data files. Additionally, the project will be configured for self-hosted Docker deployment via Next.js standalone output.

The extraction is mechanical: read the inline content, create a typed data file with co-located interfaces, update the consuming component to import from `@/data/filename`. No visual or behavioral changes. The deployment config is equally straightforward: add `output: 'standalone'` to `next.config.ts`, install `sharp`, and create a Dockerfile.

**Primary recommendation:** Extract data file-by-file in dependency order (navigation first since Navbar is used everywhere), then update `next.config.ts` and create Dockerfile. Verify after each file that the dev server renders identically.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Each data file uses TypeScript interfaces co-located with the data -- types defined in the same file as the data they describe. No separate types directory.
- **D-02:** Each file exports a single primary named export (e.g., `export const pricingTiers: PricingTier[] = [...]`) plus its interface. No barrel file.
- **D-03:** Data files contain only pure data (arrays, objects, primitives). No helper functions -- any transformation logic lives in components or utils.
- **D-04:** Pricing data uses dual-currency structure per tier -- each tier has both USD and BDT fields. The currency toggle (Phase 6) reads the appropriate field.
- **D-05:** Components import data directly from individual files: `import { pricingTiers } from '@/data/pricing'`. No barrel/index.ts file, no data hooks layer.
- **D-06:** Self-hosted deployment target is Docker. Create a `Dockerfile` using Next.js standalone output.
- **D-07:** Configure `output: 'standalone'` in `next.config.ts`. This produces `.next/standalone/` with minimal `server.js`.
- **D-08:** Install `sharp` for server-side image optimization (required for self-hosted, built-in on Vercel).

### Claude's Discretion
- Exact TypeScript interface field names and types for each data category
- Whether to add JSDoc comments to interfaces
- Dockerfile base image and layer caching strategy
- Whether to add `.dockerignore`

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | All pricing tiers extracted to src/data/pricing.ts | Inline `pricingTiers` array found in `src/app/pricing/page.tsx` lines 14-75. Dual-currency structure already present. |
| DATA-02 | All changelog entries extracted to src/data/changelog.ts | Inline `changelogEntries` array found in `src/app/changelog/page.tsx` lines 13-51. `tagLabels` map at lines 53-57. |
| DATA-03 | All testimonials extracted to src/data/testimonials.ts | Inline testimonial cards in `src/components/sections/Testimonials.tsx` lines 10-54. |
| DATA-04 | All feature/module data extracted to src/data/features.ts | Inline module data in `src/components/sections/FeaturesBento.tsx` lines 13-91 and `src/app/features/page.tsx` lines 43-258. |
| DATA-05 | FAQ items extracted to src/data/faq.ts | Inline `faqItems` array found in `src/components/sections/FAQAccordion.tsx` lines 5-31. |
| DATA-06 | Support info extracted to src/data/support.ts | Inline support cards and contact info in `src/app/support/page.tsx` lines 36-69. |
| DATA-07 | Navigation links extracted to src/data/navigation.ts | Inline `navLinks` array in `src/components/layout/Navbar.tsx` lines 11-17. Also `productLinks`, `companyLinks`, `legalLinks` in `src/components/layout/Footer.tsx` lines 3-22. |
| CHLOG-03 | Changelog data sourced from TypeScript data file, not hardcoded | Covered by DATA-02 extraction. |
| FOUND-07 | Self-hosted deployment configured -- output: 'standalone' in next.config.ts | `next.config.ts` currently empty (lines 3-5). Needs `output: 'standalone'` added. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.6 | Framework with standalone output | `output: 'standalone'` produces minimal deployment bundle [VERIFIED: npm registry] |
| TypeScript | 5.x | Type system for data interfaces | Strict mode, co-located interfaces with data [VERIFIED: tsconfig.json] |
| sharp | 0.34.5 (latest) | Server-side image optimization | Required for `next/image` on self-hosted (built-in on Vercel) [VERIFIED: npm registry] |

### No New Dependencies Required
This phase only adds `sharp` (one package) and creates TypeScript data files. No new libraries needed for data extraction -- this is pure TypeScript with built-in type syntax.

**Installation:**
```bash
pnpm add sharp
```

**Note on pnpm-workspace.yaml:** The file currently lists `sharp` in `ignoredBuiltDependencies`. After `pnpm add sharp`, this entry may need to be removed so the binary is actually built during install. Verify after install that `sharp` resolves correctly. [ASSUMED -- needs verification during execution]

## Architecture Patterns

### Recommended Project Structure
```
src/
  data/                  # NEW -- pure data files
    pricing.ts           # PricingTier interface + pricingTiers export
    changelog.ts         # ChangelogEntry interface + changelogEntries export
    testimonials.ts      # Testimonial interface + testimonials export
    features.ts          # FeatureModule interface + features export
    faq.ts               # FAQItem interface + faqItems export
    support.ts           # SupportChannel interface + supportChannels export
    navigation.ts        # NavLink interface + navLinks, footerLinks exports
  components/
    layout/
      Navbar.tsx         # Updated: imports navLinks from @/data/navigation
      Footer.tsx         # Updated: imports footer links from @/data/navigation
    sections/
      FAQAccordion.tsx   # Updated: imports faqItems from @/data/faq
      FeaturesBento.tsx  # Updated: imports features from @/data/features
      Testimonials.tsx   # Updated: imports testimonials from @/data/testimonials
  app/
    pricing/page.tsx     # Updated: imports pricingTiers from @/data/pricing
    changelog/page.tsx   # Updated: imports changelogEntries from @/data/changelog
    support/page.tsx     # Updated: imports supportChannels from @/data/support
    features/page.tsx    # Updated: imports module data from @/data/features
```

### Pattern 1: Co-located Interface + Data Export
**What:** Each data file defines its TypeScript interface immediately above the data it describes.
**When to use:** Every data file in `src/data/`.
**Example:**
```typescript
// src/data/pricing.ts

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  plan: string;
  priceUSD: string;
  priceBDT: string;
  period: string;
  desc: string;
  popular: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonStyle: "btn-primary" | "btn-outline";
}

export const pricingTiers: PricingTier[] = [
  {
    plan: "Starter",
    priceUSD: "$29",
    priceBDT: "3,499",
    // ...
  },
];
```

### Pattern 2: Direct Named Import
**What:** Components import the specific named export they need.
**When to use:** All consuming components.
**Example:**
```typescript
// Before (inline):
const pricingTiers = [ ... ];

// After (extracted):
import { pricingTiers } from "@/data/pricing";
```

### Pattern 3: Dual-currency pricing structure (D-04)
**What:** Each pricing tier has separate USD and BDT fields, not a single price with conversion.
**When to use:** Only pricing.ts.
**Rationale:** Phase 6 currency toggle reads the appropriate field directly -- no runtime conversion math, no exchange rate tables.

### Anti-Patterns to Avoid
- **Barrel files (index.ts):** CONTEXT.md D-02 explicitly forbids. No `src/data/index.ts`.
- **Helper functions in data files:** CONTEXT.md D-03 forbids. Transformation logic stays in components.
- **Separate types directory:** CONTEXT.md D-01 forbids. Interfaces co-located with data.
- **Default exports from data files:** Use named exports per established project convention.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization on self-hosted | Custom sharp wrapper or ImageMagick | `sharp` package + `next/image` | Next.js uses sharp automatically when installed; manual wrapping is unnecessary complexity |
| Docker base image | Custom Linux image from scratch | Official Node.js Alpine image | Smaller attack surface, faster builds, proven security patches |
| Build output optimization | Custom webpack/turbopack config | `output: 'standalone'` | Next.js built-in feature produces minimal server bundle |

## Runtime State Inventory

> This is a refactoring phase, not a rename/migration. Runtime state inventory is N/A.

No stored data, live service config, OS-registered state, secrets, or build artifacts are affected. All changes are source code only.

## Common Pitfalls

### Pitfall 1: pnpm-workspace.yaml blocks sharp binary
**What goes wrong:** `sharp` is listed in `ignoredBuiltDependencies` in `pnpm-workspace.yaml`. After `pnpm add sharp`, the native binary won't be built, causing `next/image` optimization to fail at runtime.
**Why it happens:** The workspace config was set up before sharp was needed and ignores its build step.
**How to avoid:** Remove `sharp` from the `ignoredBuiltDependencies` array before or after installing. Verify with `node -e "require('sharp')"` after install.
**Warning signs:** Build succeeds but `next/image` returns unoptimized images, or runtime errors mentioning sharp.

### Pitfall 2: tagLabels extraction from changelog
**What goes wrong:** The `tagLabels` object in `src/app/changelog/page.tsx` (lines 53-57) maps change types to display labels and CSS classes. This is presentation logic, not pure data.
**Why it happens:** It looks like data but is actually a rendering concern (maps `type: "new"` to `className: "ct-new"`).
**How to avoid:** Keep `tagLabels` in the changelog component or move to a utility. Do NOT put it in the data file per D-03 (no helper maps with className logic in data files). The data file should only have the raw `type` field as a string union.

### Pitfall 3: FeaturesBento vs Features page data overlap
**What goes wrong:** Feature module data exists in two places: `FeaturesBento.tsx` (homepage summary cards) and `features/page.tsx` (detailed module rows). They describe the same 6 modules but with different detail levels.
**Why it happens:** Homepage shows summaries; features page shows full details with visual components.
**How to avoid:** Create a single `features.ts` data file that contains the complete module data. Components pick the fields they need. Alternatively, model it so the features page data includes the bento summary fields as a subset.
**Warning signs:** Duplicate data definitions that drift out of sync.

### Pitfall 4: Footer link data scope
**What goes wrong:** The Footer has 3 link arrays (`productLinks`, `companyLinks`, `legalLinks`) that are similar in shape to Navbar's `navLinks` but are not navigation in the same sense. If they are put into `navigation.ts`, the file becomes a catch-all.
**Why it happens:** DATA-07 says "Navigation links extracted to src/data/navigation.ts" but the footer links are also navigation data.
**How to avoid:** Put all link data (navbar + footer) into `navigation.ts` with separate named exports: `navLinks`, `footerProductLinks`, `footerCompanyLinks`, `footerLegalLinks`. This is within scope of DATA-07 and keeps all link data together for i18n extraction (Phase 9).
**Warning signs:** Footer links remaining inline after data extraction is "complete."

### Pitfall 5: TrustBar stats and dashboard mockup data
**What goes wrong:** `TrustBar.tsx` has an inline `stats` array and `HeroSection.tsx` has a dashboard mockup with inline order data. These look extractable but are decorative/illustrative data, not content that needs i18n translation.
**Why it happens:** The phase scope says "all hardcoded content" but not all inline data is "content" -- some is UI chrome.
**How to avoid:** Only extract the 7 data files specified in CONTEXT.md. TrustBar stats and dashboard mockup data are UI presentation data, not business content. Leave them inline. The FAQ, testimonials, and feature modules are the content that needs extraction for i18n readiness.

### Pitfall 6: `as const` assertions lost during extraction
**What goes wrong:** The pricing page uses `as const` for `buttonStyle` field, and changelog uses `as const` for change types. When extracting to data files, these type assertions may be lost or cause TypeScript errors if the interface doesn't use literal union types.
**Why it happens:** Copy-paste from inline context where TypeScript infers literal types to a separate file where interfaces expect wider types.
**How to avoid:** Use literal union types in interfaces (e.g., `buttonStyle: "btn-primary" | "btn-outline"`, `type: "new" | "imp" | "fix"`) instead of relying on `as const`.
**Warning signs:** TypeScript errors after extraction about type incompatibility.

### Pitfall 7: Dockerfile COPY paths for standalone output
**What goes wrong:** Next.js standalone output requires copying `public/` and `.next/static/` into specific locations within `.next/standalone/`. Missing or wrong paths cause 404s for static assets.
**Why it happens:** The standalone `server.js` does not serve static files from the project root -- it expects them relative to its own location.
**How to avoid:** Follow the exact COPY commands from Next.js official docs:
```dockerfile
COPY --from=builder /app/public .next/standalone/public
COPY --from=builder /app/.next/static .next/standalone/.next/static
```
**Warning signs:** App loads but CSS/JS/images return 404 in Docker.

## Code Examples

### navigation.ts -- Navbar links + Footer links
```typescript
// src/data/navigation.ts

interface NavLink {
  name: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Support", href: "/support" },
];

export const footerProductLinks: NavLink[] = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Documentation", href: "#" },
];

export const footerCompanyLinks: NavLink[] = [
  { name: "Devsroom", href: "https://devsroom.com" },
  { name: "WPMHS", href: "https://wpmhs.com" },
  { name: "Blog", href: "#" },
  { name: "Support", href: "/support" },
];

export const footerLegalLinks: NavLink[] = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "Refund Policy", href: "#" },
  { name: "License Agreement", href: "#" },
];
```

### pricing.ts -- Dual-currency structure
```typescript
// src/data/pricing.ts

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  plan: string;
  priceUSD: string;
  priceBDT: string;
  period: string;
  desc: string;
  popular: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonStyle: "btn-primary" | "btn-outline";
}

export const pricingTiers: PricingTier[] = [
  {
    plan: "Starter",
    priceUSD: "$29",
    priceBDT: "3,499",
    period: "/one-time",
    desc: "For a single WooCommerce store",
    popular: false,
    features: [
      { text: "1 WordPress Site", included: true },
      { text: "All 6 Modules", included: true },
      // ... rest of features
    ],
    buttonText: "Get Starter",
    buttonStyle: "btn-outline",
  },
  // ... Professional, Agency tiers
];
```

### changelog.ts -- Change type as string union
```typescript
// src/data/changelog.ts

type ChangeType = "new" | "imp" | "fix";

interface ChangelogChange {
  type: ChangeType;
  text: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  name: string;
  isLatest: boolean;
  changes: ChangelogChange[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v0.0.14",
    date: "Released -- May 2025",
    name: "Analytics Suite Release",
    isLatest: true,
    changes: [
      { type: "new", text: "Full analytics dashboard with revenue trends..." },
      // ...
    ],
  },
  // ... more entries
];
```
**Note:** The `tagLabels` object (mapping types to CSS classes and display labels) stays in the changelog component -- it is presentation logic, not data.

### faq.ts -- Simple QA pairs
```typescript
// src/data/faq.ts

interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Is this a one-time payment or subscription?",
    answer: "One-time payment. No monthly or annual fees. ...",
  },
  // ...
];
```

### testimonials.ts -- Review data
```typescript
// src/data/testimonials.ts

interface Testimonial {
  stars: string;
  quote: string;
  initials: string;
  name: string;
  store: string;
  avatarColor: "bg-accent" | "bg-green" | "bg-orange";
}

export const testimonials: Testimonial[] = [
  {
    stars: "★★★★★",
    quote: "আমাদের প্রতিদিন ৩০০+ অর্ডার আসে...",
    initials: "RA",
    name: "Rahim Ahmed",
    store: "StyleBD.com · Dhaka",
    avatarColor: "bg-accent",
  },
  // ...
];
```

### support.ts -- Contact channels
```typescript
// src/data/support.ts

interface SupportChannel {
  icon: string;
  title: string;
  description: string;
  action: string;
  href: string;
  actionType: "email" | "link";
}

export const supportChannels: SupportChannel[] = [
  {
    icon: "📧",
    title: "Email Support",
    description: "Send us a detailed message and we'll respond within 24 hours...",
    action: "mhs@wpmhs.com",
    href: "mailto:mhs@wpmhs.com",
    actionType: "email",
  },
  // ... WhatsApp, Documentation
];
```

### features.ts -- Module data for bento + detail
```typescript
// src/data/features.ts

interface FeatureTag {
  label: string;
}

interface FeatureModule {
  icon: string;
  title: string;
  description: string;
  tags: FeatureTag[];
  // Extended detail fields for features page
  eyebrow?: string;
  detailDescription?: string;
  checks?: string[];
  // Tracking panel data (Module 02)
  trackingPlatforms?: { name: string; status: string }[];
  // Fraud box data (Module 03)
  fraudOrders?: { id: string; phone: string; status: string; statusClass: string; action: string }[];
  fraudStats?: { blocked: number; protected: string };
}

export const featureModules: FeatureModule[] = [
  {
    icon: "🚚",
    title: "Automated Courier Sync",
    description: "Automatically polls Steadfast, Pathao, and RedX...",
    tags: [
      { label: "Steadfast" }, { label: "Pathao" }, { label: "RedX" },
      { label: "Auto Poll" }, { label: "Status Mapping" },
    ],
    eyebrow: "Module 01",
    detailDescription: "WooBooster polls Steadfast, Pathao, and RedX every hour...",
    checks: [
      "Background polling -- no manual action needed",
      "Real-time status: Delivered / Returned / Cancelled",
      // ...
    ],
  },
  // ... 5 more modules
];
```
**Note:** This is the most complex data file. The interface needs to accommodate both the homepage bento (icon, title, description, tags) and the features page detail rows (eyebrow, extended description, checks, tracking platforms, fraud data). Components consume the fields they need.

### next.config.ts -- Standalone output
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```
**Note:** Do NOT add MDX-related config yet. Phase 7 adds `@next/mdx` and `pageExtensions`. Phase 5 only adds `output: "standalone"`. [CITED: CONTEXT.md D-07]

### Dockerfile -- Multi-stage build
```dockerfile
# Dockerfile
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```
**Note:** Uses `corepack enable pnpm` to use pnpm via corepack. Uses Node 24 Alpine to match the development Node version (v24.15.0). The standalone output `server.js` auto-detects PORT and HOSTNAME env vars. [ASSUMED: Node 24 Alpine base image -- verify Node 24 Alpine exists at execution time]

### .dockerignore
```
Dockerfile
.dockerignore
node_modules
.next
.git
.gitignore
.planning
README.md
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom Dockerfile with full node_modules | Next.js standalone output + multi-stage Docker | Next.js 12+ | 10x smaller Docker images |
| `middleware.ts` for Next.js routing | `proxy.ts` (project convention) | Project rule | Already established in Phase 1 |

**Note:** No deprecated patterns in this phase. The approach is well-established.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `sharp` listed in `ignoredBuiltDependencies` in pnpm-workspace.yaml needs removal after `pnpm add sharp` | Common Pitfalls | Sharp binary not built, image optimization fails |
| A2 | Node 24 Alpine Docker image exists | Code Examples | Dockerfile build fails; fall back to Node 22 or 20 Alpine |
| A3 | TrustBar stats and dashboard mockup data should remain inline (not extracted) | Common Pitfalls | Over-extraction creates unnecessary data files for UI chrome |
| A4 | Features page module data and FeaturesBento data should share a single `features.ts` file | Architecture Patterns | If separate files are preferred, planner needs to adjust |

**Action needed:** A1 and A2 should be verified during execution. A3 and A4 are design choices that the planner should confirm.

## Open Questions

1. **Should features.ts contain ALL module data (bento + detail rows) or just bento summaries?**
   - What we know: Homepage `FeaturesBento.tsx` has 6 module summaries. Features page `features/page.tsx` has 3 detailed module rows (Courier Sync, Meta CAPI, Fraud Shield).
   - What's unclear: Whether the features page data for the 3 detailed modules should live in `features.ts` or stay inline since only 3 of 6 modules have detail rows.
   - Recommendation: Put all 6 modules in `features.ts` with optional extended fields. This keeps a single source of truth and makes adding detail rows for remaining modules trivial.

2. **Should the changelog `tagLabels` map be refactored into the component or a utility?**
   - What we know: `tagLabels` maps `type` strings to display labels and CSS classes. It's presentation logic, not data.
   - What's unclear: Whether to keep it in the changelog page component or extract to a utility function.
   - Recommendation: Keep it in the changelog component. It's only used there and is tightly coupled to CSS class names.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build runtime | Yes | 24.15.0 | -- |
| pnpm | Package management | Yes | 10.33.2 | -- |
| Docker | Deployment config | Yes | 29.4.2 | -- |
| sharp | Image optimization | No (not installed) | -- | `pnpm add sharp` in this phase |
| Next.js standalone | Deployment | Yes (built-in) | 16.2.6 | -- |

**Missing dependencies with no fallback:**
- `sharp` -- must be installed via `pnpm add sharp` during this phase

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | `pnpm build` (type checking + build verification) |
| Full suite command | `pnpm build` |

### Phase Requirements -- Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | Pricing data importable from @/data/pricing | build check | `pnpm build` | No -- Wave 0 |
| DATA-02 | Changelog data importable from @/data/changelog | build check | `pnpm build` | No -- Wave 0 |
| DATA-03 | Testimonials data importable from @/data/testimonials | build check | `pnpm build` | No -- Wave 0 |
| DATA-04 | Features data importable from @/data/features | build check | `pnpm build` | No -- Wave 0 |
| DATA-05 | FAQ data importable from @/data/faq | build check | `pnpm build` | No -- Wave 0 |
| DATA-06 | Support data importable from @/data/support | build check | `pnpm build` | No -- Wave 0 |
| DATA-07 | Navigation data importable from @/data/navigation | build check | `pnpm build` | No -- Wave 0 |
| CHLOG-03 | Changelog page reads from data file, not inline | build check + visual | `pnpm build` then dev server | No -- Wave 0 |
| FOUND-07 | Standalone output configured in next.config.ts | build check | `pnpm build` (verify .next/standalone exists) | No -- Wave 0 |

**Validation strategy for this phase:** Since there is no test framework, validation relies on:
1. `pnpm build` passes (TypeScript type checking confirms interfaces match usage)
2. `pnpm dev` renders all pages identically before and after extraction
3. Docker build succeeds (optional -- Dockerfile correctness)

### Sampling Rate
- **Per task commit:** `pnpm build`
- **Per wave merge:** `pnpm build`
- **Phase gate:** `pnpm build` green, dev server visual verification

### Wave 0 Gaps
- No test framework gaps to fill -- this phase uses build-time type checking as its primary validation

## Security Domain

> Minimal security surface for this phase (data extraction + Docker config).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | No | Data files are static, no user input |
| V6 Cryptography | No | No cryptographic operations |
| V14 Configuration | Yes | Docker configuration follows least-privilege (non-root user) |
| V1 Architecture | Minimal | Data separation is a good practice for maintainability |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Container runs as root | Privilege escalation | Dockerfile creates `nextjs` user (UID 1001) and runs as non-root |
| Large attack surface in Docker image | Information disclosure | Multi-stage build, Alpine base, only standalone output copied |
| Build secrets in Docker image | Information disclosure | `.dockerignore` excludes `.git`, `.env`, `.planning` |

## Sources

### Primary (HIGH confidence)
- Source code analysis: All 10 component/page files read in full for inline data identification
- `next.config.ts` -- Current empty config verified (lines 1-7)
- `package.json` -- Current dependencies verified, no sharp installed
- `pnpm-workspace.yaml` -- `ignoredBuiltDependencies` includes sharp (potential issue)
- npm registry: sharp@0.34.5 (latest), next@16.2.6 (current)
- STACK.md research (2026-05-11) -- Self-hosting deployment recommendations, verified against Next.js official docs

### Secondary (MEDIUM confidence)
- [ASSUMED] Dockerfile pattern based on Next.js official standalone docs documentation (web reader rate-limited, could not re-verify in this session)
- [ASSUMED] Node 24 Alpine Docker base image availability

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Only adding sharp, which is well-documented for self-hosted Next.js
- Architecture: HIGH -- Mechanical extraction pattern, all inline data located and catalogued
- Pitfalls: HIGH -- Identified 7 specific pitfalls from actual code inspection
- Docker config: MEDIUM -- Pattern from documentation but unable to re-verify this session

**Research date:** 2026-05-11
**Valid until:** 2026-06-11 (stable -- no fast-moving dependencies)
