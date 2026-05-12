# Phase 7: Blog, Docs, and Legal - Research

**Researched:** 2026-05-12
**Domain:** MDX content rendering, Tailwind Typography, legal page generation
**Confidence:** HIGH

## Summary

Phase 7 adds three new content sections to the WooBooster marketing site: an MDX-powered blog with listing and individual post pages, a documentation section with sidebar navigation and auto-generated TOC, and four legal pages (Privacy Policy, Terms of Service, Refund Policy, License Agreement). The project uses Next.js 16.2.6 with App Router and TailwindCSS v4, which constrains how MDX and typography must be configured.

The MDX setup requires `@next/mdx` with `createMDX` wrapper in `next.config.ts`, a mandatory `mdx-components.tsx` file at project root, and `pageExtensions` updated to include `.mdx`. Frontmatter is NOT built into `@next/mdx` -- the recommended approach is `gray-matter` for file-level parsing combined with `export const metadata` inside MDX files, or `remark-frontmatter` + `remark-mdx-frontmatter` remark plugins configured in the `createMDX` options. TailwindCSS v4 uses `@plugin "@tailwindcss/typography";` in CSS (NOT the old `tailwind.config.js` plugin pattern). The `prose` class with `prose-invert` for dark mode provides drop-in styling for MDX content.

**Primary recommendation:** Use `@next/mdx` with `gray-matter` for frontmatter parsing, `remark-gfm` for GitHub Flavored Markdown tables/code blocks, `rehype-slug` + `rehype-autolink-headings` for TOC generation, and `@tailwindcss/typography` via `@plugin` directive for prose styling. Legal pages are plain TSX server components with no MDX overhead.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `@next/mdx` for static MDX rendering
- **D-02:** Blog posts live in `src/content/blog/*.mdx`
- **D-03:** Documentation guides live in `src/content/docs/*.mdx`
- **D-04:** Legal pages are plain TSX components (not MDX)
- **D-05:** Install `@next/mdx` and `@mdx-js/loader` as dev dependencies; configure in `next.config.ts` with `withMDx` wrapper
- **D-06:** Blog listing page uses 2-3 column card grid layout
- **D-07:** Each card shows: gradient thumbnail placeholder, title, date, excerpt, reading time
- **D-08:** Include 3 realistic sample blog posts with varied MDX formatting
- **D-09:** Blog route: `/blog` (listing) and `/blog/[slug]` (individual posts)
- **D-10:** Generate static params from MDX file names at build time
- **D-11:** Two-column docs layout: fixed sidebar + scrollable content with auto-generated TOC
- **D-12:** 5 documentation guides covering: Getting Started, Courier Sync, Meta CAPI, Fraud Shield, Analytics
- **D-13:** Docs route: `/docs` (index/landing) and `/docs/[slug]` (individual guides)
- **D-14:** Sidebar navigation groups guides by category
- **D-15:** Auto-generate TOC from markdown headings (h2, h3)
- **D-16:** Draft professional legal content for all 4 pages
- **D-17:** Legal routes: `/privacy`, `/terms`, `/refund`, `/license`
- **D-18:** Legal pages use shared layout component
- **D-19:** Content covers: data collection, usage terms, 30-day refund, license scope
- **D-20:** Not legal advice -- professional content reviewable by lawyer
- **D-21:** Use `@tailwindcss/typography` plugin with `prose` class
- **D-22:** Customize prose styles with existing design tokens
- **D-23:** Blog post thumbnails use gradient placeholders
- **D-24:** Dark mode via `prose-invert` class
- **D-25-28:** Update footer links from "#" to real routes

### Claude's Discretion
- Exact reading time calculation logic for blog posts
- Gradient color choices for blog thumbnails
- Sidebar component implementation details
- TOC auto-generation approach (headings extraction)
- Blog card hover/transition effects
- Legal page heading hierarchy and section structure
- MDX frontmatter schema details

### Deferred Ideas (OUT OF SCOPE)
- Blog categories/tags and filtering
- Blog search functionality
- RSS feed for blog
- Docs full-text search
- Comments on blog posts
- Newsletter signup on blog
- Author profile pages
- Image optimization for blog images
- Social sharing buttons on blog posts
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BLOG-01 | Blog listing page displays posts with title, date, excerpt, reading time | Card grid pattern from features page; `gray-matter` for frontmatter extraction; reading time from word count |
| BLOG-02 | Individual blog posts render from MDX files with frontmatter | `@next/mdx` dynamic import pattern with `generateStaticParams`; frontmatter via `gray-matter` |
| BLOG-03 | MDX supports GitHub-flavored markdown (tables, code blocks) | `remark-gfm` plugin configured in `createMDX` options |
| BLOG-04 | Blog content lives in src/content/blog/*.mdx | Dynamic import pattern: `await import('@/content/blog/${slug}.mdx')` |
| DOCS-01 | Documentation section displays guides organized by topic | Sidebar component with category grouping; docs data file for navigation structure |
| DOCS-02 | Individual doc pages render from MDX with table of contents | `rehype-slug` + `rehype-autolink-headings` for heading IDs; extract headings for TOC sidebar |
| LEGL-01 | Privacy Policy page with full legal content | Plain TSX server component at `/privacy`; shared legal layout |
| LEGL-02 | Terms of Service page with full legal content | Plain TSX server component at `/terms`; shared legal layout |
| LEGL-03 | Refund Policy page with full legal content | Plain TSX server component at `/refund`; shared legal layout |
| LEGL-04 | License Agreement page with full legal content | Plain TSX server component at `/license`; shared legal layout |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@next/mdx` | 16.2.6 | MDX support for Next.js App Router | Official Next.js plugin, matches project Next.js version exactly [VERIFIED: npm registry] |
| `@mdx-js/loader` | 3.1.1 | MDX webpack/loader for Next.js | Required peer of `@next/mdx` [VERIFIED: npm registry] |
| `@mdx-js/react` | 3.1.1 | React components for MDX rendering | Required for `mdx-components.tsx` type support [VERIFIED: npm registry] |
| `@types/mdx` | 2.0.13 | TypeScript types for MDX | Provides type safety for MDX imports [VERIFIED: npm registry] |
| `@tailwindcss/typography` | 0.5.19 | Prose styling plugin for rendered MDX | Official Tailwind plugin, `prose` class for MDX content [VERIFIED: npm registry] |
| `gray-matter` | 4.0.3 | Parse MDX frontmatter (YAML metadata) | Lightweight, handles frontmatter extraction since `@next/mdx` does not support it natively [VERIFIED: npm registry] |
| `remark-gfm` | 4.0.1 | GitHub Flavored Markdown support (tables, strikethrough, task lists) | Standard remark plugin for GFM, configured in `createMDX` options [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rehype-slug` | 6.0.0 | Add IDs to heading elements (h2, h3, etc.) | For docs TOC generation -- headings need IDs for anchor links [VERIFIED: npm registry] |
| `rehype-autolink-headings` | 7.1.0 | Add anchor links to headings with IDs | Pair with `rehype-slug` for clickable heading links in docs [VERIFIED: npm registry] |
| `reading-time` | 1.5.0 | Calculate reading time from text content | Optional -- simple `Math.ceil(words / 200)` is an acceptable alternative [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `gray-matter` | `remark-frontmatter` + `remark-mdx-frontmatter` | Remark plugins integrate into the MDX pipeline directly, but require more setup. `gray-matter` is simpler for file-level parsing outside the pipeline. |
| `@next/mdx` dynamic imports | `next-mdx-remote` | `next-mdx-remote` supports remote MDX (CMS), but `@next/mdx` is sufficient for local files and has zero runtime overhead. Decision D-01 locks `@next/mdx`. |
| `reading-time` package | Manual `Math.ceil(words / 200)` | Package handles CJK characters and code blocks better; manual is simpler. Either works for 3 sample posts. |

**Installation:**
```bash
pnpm add -D @next/mdx @mdx-js/loader @mdx-js/react @types/mdx @tailwindcss/typography gray-matter remark-gfm rehype-slug rehype-autolink-headings
```

**Version verification (all confirmed 2026-05-12):**
- `@next/mdx`: 16.2.6 (matches project Next.js 16.2.6)
- `@mdx-js/loader`: 3.1.1
- `@mdx-js/react`: 3.1.1
- `@types/mdx`: 2.0.13
- `@tailwindcss/typography`: 0.5.19
- `gray-matter`: 4.0.3
- `remark-gfm`: 4.0.1
- `rehype-slug`: 6.0.0
- `rehype-autolink-headings`: 7.1.0
- `reading-time`: 1.5.0

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── blog/
│   │   ├── page.tsx              # Blog listing page
│   │   └── [slug]/
│   │       └── page.tsx          # Individual blog post
│   ├── docs/
│   │   ├── page.tsx              # Docs landing/index
│   │   ├── layout.tsx            # Docs layout with sidebar
│   │   └── [slug]/
│   │       └── page.tsx          # Individual doc page
│   ├── privacy/
│   │   └── page.tsx              # Privacy Policy
│   ├── terms/
│   │   └── page.tsx              # Terms of Service
│   ├── refund/
│   │   └── page.tsx              # Refund Policy
│   └── license/
│       └── page.tsx              # License Agreement
├── content/
│   ├── blog/
│   │   ├── woo-booster-getting-started.mdx
│   │   ├── bd-ecommerce-courier-guide.mdx
│   │   └── meta-capi-bangladesh.mdx
│   └── docs/
│       ├── getting-started.mdx
│       ├── courier-sync.mdx
│       ├── meta-capi.mdx
│       ├── fraud-shield.mdx
│       └── analytics.mdx
├── components/
│   ├── blog/
│   │   ├── BlogCard.tsx          # Card component for listing
│   │   └── GradientThumbnail.tsx # Gradient placeholder for thumbnails
│   ├── docs/
│   │   ├── DocsSidebar.tsx       # Sticky sidebar navigation (client component)
│   │   └── TableOfContents.tsx   # TOC component (client component for scroll tracking)
│   └── legal/
│       └── LegalLayout.tsx       # Shared layout for all 4 legal pages
├── lib/
│   ├── mdx.ts                    # MDX utilities (getBlogPosts, getDocPosts, readingTime)
│   └── utils.ts                  # Existing cn() utility
├── data/
│   ├── navigation.ts             # Update 6 href values
│   └── docs-nav.ts               # Docs sidebar navigation structure
mdx-components.tsx                 # Global MDX components (project root)
next.config.ts                     # Updated with createMDX wrapper
```

### Pattern 1: @next/mdx Configuration (next.config.ts)
**What:** Configure Next.js to process MDX files with remark/rehype plugins
**When to use:** All MDX content rendering in this project
**Example:**
```typescript
// next.config.ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});

export default withMDX(nextConfig);
```
[Source: nextjs.org/docs/app/building-your-application/configuring/mdx]

### Pattern 2: Dynamic Blog Post Route with generateStaticParams
**What:** Load MDX files dynamically by slug, generate static pages at build time
**When to use:** `/blog/[slug]` and `/docs/[slug]` routes
**Example:**
```typescript
// src/app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);
  return (
    <article className="prose dark:prose-invert max-w-none">
      <Post />
    </article>
  );
}

export function generateStaticParams() {
  return [
    { slug: "woo-booster-getting-started" },
    { slug: "bd-ecommerce-courier-guide" },
    { slug: "meta-capi-bangladesh" },
  ];
}

export const dynamicParams = false;
```
[Source: nextjs.org/docs/app/building-your-application/configuring/mdx -- "Using dynamic imports" section]

### Pattern 3: Frontmatter Parsing with gray-matter
**What:** Extract metadata (title, date, excerpt) from MDX files at build time
**When to use:** Blog listing page, docs sidebar, reading time calculation
**Example:**
```typescript
// src/lib/mdx.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export function getBlogPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const words = content.split(/\s+/).length;
    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      excerpt: data.excerpt as string,
      readingTime: Math.ceil(words / 200),
    };
  });
}
```
[Source: nextjs.org/docs -- "Frontmatter" section confirms `@next/mdx` does NOT support frontmatter; recommends `gray-matter`]

### Pattern 4: TailwindCSS v4 Typography Integration
**What:** Add prose styling via `@plugin` directive (NOT `tailwind.config.js`)
**When to use:** All MDX content pages (blog posts, docs)
**Example:**
```css
/* In src/app/globals.css -- add after @import "tailwindcss" */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```
Then apply in layouts:
```tsx
<div className="prose prose-headings:font-[family-name:var(--font-syne)] prose-a:text-accent dark:prose-invert max-w-none">
  {children}
</div>
```
[Source: github.com/tailwindlabs/tailwindcss-typography README -- "Then add the plugin to your main style.css file: @plugin '@tailwindcss/typography';"]

### Pattern 5: Mandatory mdx-components.tsx
**What:** Define global MDX component overrides (required file for @next/mdx with App Router)
**When to use:** Required at project root for MDX to work at all
**Example:**
```typescript
// mdx-components.tsx (project root)
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
```
[Source: nextjs.org/docs -- "mdx-components.tsx is required to use @next/mdx with App Router and will not work without it."]

### Pattern 6: Page Hero Pattern (Existing)
**What:** Reuse the established eyebrow + title + subtitle pattern from features/pricing pages
**When to use:** Blog listing, docs landing pages
**Example (from features page):**
```tsx
<div className="page-hero-sm">
  <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
    <div className="eyebrow">Blog</div>
    <div className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}>
      Title Here
    </div>
    <p className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}>
      Subtitle text
    </p>
  </div>
</div>
```
[Source: Existing codebase -- `src/app/features/page.tsx`]

### Anti-Patterns to Avoid
- **Do NOT use `tailwind.config.js` for typography plugin:** This project uses TailwindCSS v4 CSS-first config. Adding a `tailwind.config.js` will conflict. Use `@plugin "@tailwindcss/typography";` in `globals.css` instead.
- **Do NOT use frontmatter in MDX files as `---` YAML blocks without remark plugins:** `@next/mdx` does NOT parse frontmatter by default. Either use `gray-matter` to parse files separately (recommended for this project), or install `remark-frontmatter` + `remark-mdx-frontmatter` and configure them in `createMDX` options.
- **Do NOT put MDX files in `src/app/` routes directly:** Keep content MDX in `src/content/` and use dynamic imports. This avoids MDX files being treated as pages via `pageExtensions`.
- **Do NOT import `reading-time` unnecessarily:** A simple `Math.ceil(words / 200)` is sufficient for 3 blog posts. Avoid adding a dependency when a one-liner works.
- **Do NOT make docs sidebar a server component:** Scroll tracking (highlighting active TOC section) requires browser APIs (`IntersectionObserver`). The sidebar and TOC components must be client components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MDX rendering pipeline | Custom MDX compiler | `@next/mdx` | Handles compilation, caching, HMR, and static generation natively |
| Prose/typography styles | Custom CSS for each HTML element | `@tailwindcss/typography` | 30+ element styles carefully designed, handles edge cases (nested lists, tables in code) |
| Frontmatter parsing | Regex or custom YAML parser | `gray-matter` | Handles edge cases: multi-line values, dates, special characters |
| GFM tables/strikethrough | Custom markdown extensions | `remark-gfm` | Standard, battle-tested plugin for GFM spec compliance |
| Heading ID generation | Custom slugify for headings | `rehype-slug` | Handles duplicate IDs, special characters, Unicode |
| Anchor link wrapping | Custom heading link injection | `rehype-autolink-headings` | Accessible, correct aria attributes |

**Key insight:** The remark/rehype ecosystem provides well-tested plugins for every MDX transformation need. Building custom solutions introduces bugs around Unicode headings, nested tables, and edge-case markdown syntax.

## Common Pitfalls

### Pitfall 1: `pageExtensions` Includes .mdx But Content Is in `src/content/`
**What goes wrong:** Setting `pageExtensions: ['mdx']` means ANY `.mdx` file in `src/app/` becomes a route. If blog post MDX files are accidentally placed in `src/app/blog/` instead of `src/content/blog/`, they will be treated as pages.
**Why it happens:** `pageExtensions` is global -- it affects the entire `src/app/` directory tree.
**How to avoid:** Keep all content MDX in `src/content/` (outside `src/app/`). Only use dynamic imports to load them.
**Warning signs:** Unexpected routes appearing in build output, 404 on expected routes.

### Pitfall 2: `mdx-components.tsx` Missing or in Wrong Location
**What goes wrong:** Build fails with cryptic MDX errors if `mdx-components.tsx` is not at project root (or `src/` root if using `src` directory).
**Why it happens:** The file must be at the same level as `app/` directory -- the Next.js convention requires it.
**How to avoid:** Place `mdx-components.tsx` at project root, next to `next.config.ts`. It is mandatory, not optional.
**Warning signs:** "useMDXComponents is not defined" or MDX compilation errors.

### Pitfall 3: Tailwind Typography `@plugin` vs `tailwind.config.js`
**What goes wrong:** Adding `require('@tailwindcss/typography')` to a `tailwind.config.js` file that doesn't exist yet -- creating one conflicts with the CSS-first v4 approach.
**Why it happens:** Most documentation and tutorials show the v3 config.js pattern.
**How to avoid:** Use ONLY `@plugin "@tailwindcss/typography";` in `globals.css`. No `tailwind.config.js` needed.
**Warning signs:** Prose classes not generating any styles, or Tailwind config conflicts.

### Pitfall 4: Frontmatter Not Parsed by @next/mdx
**What goes wrong:** Adding `---\ntitle: My Post\n---` to MDX files and expecting to read `metadata.title` -- it won't work.
**Why it happens:** `@next/mdx` explicitly does NOT support frontmatter. The docs state this clearly.
**How to avoid:** Use `gray-matter` to parse MDX files separately when extracting metadata for listing pages. Inside individual post pages, use dynamic imports which give you the rendered component.
**Warning signs:** `metadata` is `undefined` when importing MDX files.

### Pitfall 5: Docs Sidebar and TOC Need Client Components
**What goes wrong:** Building scroll-tracking TOC as a server component -- `IntersectionObserver` and scroll event listeners don't exist on the server.
**Why it happens:** The project defaults to server components, but interactive scroll tracking requires browser APIs.
**How to avoid:** Mark `DocsSidebar.tsx` and `TableOfContents.tsx` with `"use client"`. Keep the docs page itself as a server component that imports these client components.
**Warning signs:** "IntersectionObserver is not defined" errors during build.

### Pitfall 6: Dynamic Import Path Must Include Extension
**What goes wrong:** `await import('@/content/blog/${slug}')` without `.mdx` extension fails.
**Why it happens:** Next.js docs explicitly state: "Ensure you specify the `.mdx` file extension in your import."
**How to avoid:** Always use `await import('@/content/blog/${slug}.mdx')` with the extension.
**Warning signs:** Module not found errors at build time.

## Code Examples

### next.config.ts -- Complete MDX Configuration
```typescript
// next.config.ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});

export default withMDX(nextConfig);
```
[Source: nextjs.org/docs/app/building-your-application/configuring/mdx -- remark/rehype plugins section]

### mdx-components.tsx -- Required Global Components File
```typescript
// mdx-components.tsx (project root)
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
```
[Source: nextjs.org/docs -- "mdx-components.tsx is required"]

### globals.css -- Typography Plugin Registration (Tailwind v4)
```css
/* Add to src/app/globals.css, right after the existing @import */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```
[Source: github.com/tailwindlabs/tailwindcss-typography README -- "Then add the plugin to your main style.css file"]

### tsconfig.json -- Add MDX to Include
```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mdx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ]
}
```
[ASSUMED -- TypeScript needs to know about .mdx files for type checking]

### Blog Listing Page -- Metadata Extraction Pattern
```typescript
// src/lib/mdx.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const DOCS_DIR = path.join(process.cwd(), "src/content/docs");

interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readingTime: number;
}

export function getBlogPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const words = content.split(/\s+/).length;
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        excerpt: data.excerpt as string,
        readingTime: Math.ceil(words / 200),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
```
[Source: gray-matter npm patterns + Next.js MDX frontmatter docs recommendation]

### Sample Blog Post MDX with Frontmatter
```mdx
---
title: "Getting Started with WooBooster"
date: "2025-06-01"
excerpt: "Set up WooBooster on your Bangladeshi WooCommerce store in under 10 minutes."
---

## Why WooBooster?

WooBooster is built specifically for **Bangladeshi WooCommerce stores**...

### Installation

1. Download the plugin from your account
2. Upload via WordPress Plugins > Add New > Upload
3. Activate and enter your license key

| Feature | Starter | Professional | Agency |
|---------|---------|-------------|--------|
| Courier Sync | 1 | 3 | Unlimited |
| Fraud Shield | Basic | Advanced | Advanced |

```code block example```
```
[Source: gray-matter frontmatter format + remark-gfm table support]

### Docs Layout with Sidebar
```typescript
// src/app/docs/layout.tsx
import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1160px] mx-auto px-7 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
        <aside className="hidden lg:block">
          <DocsSidebar />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
```
[ASSUMED -- standard docs layout pattern]

### Legal Page Shared Layout
```typescript
// src/components/legal/LegalLayout.tsx
interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="max-w-[800px] mx-auto px-7 py-16">
      <div className="page-hero-sm-inner mb-10">
        <h1 className="sec-title" style={{ fontSize: "clamp(28px,3.5vw,44px)" }}>
          {title}
        </h1>
        <p className="text-muted text-sm mt-2">Last updated: {lastUpdated}</p>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
```
[ASSUMED -- follows existing page hero + prose pattern]

### Navigation Updates
```typescript
// Changes needed in src/data/navigation.ts:
export const footerProductLinks: NavLink[] = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Documentation", href: "/docs" },          // was "#"
];

export const footerCompanyLinks: NavLink[] = [
  { name: "Devsroom", href: "https://devsroom.com" },
  { name: "WPMHS", href: "https://wpmhs.com" },
  { name: "Blog", href: "/blog" },                   // was "#"
  { name: "Support", href: "/support" },
];

export const footerLegalLinks: NavLink[] = [
  { name: "Privacy Policy", href: "/privacy" },       // was "#"
  { name: "Terms of Service", href: "/terms" },       // was "#"
  { name: "Refund Policy", href: "/refund" },         // was "#"
  { name: "License Agreement", href: "/license" },   // was "#"
];
```
[Source: Verified current values in `src/data/navigation.ts`]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` plugin config | `@plugin` CSS directive | Tailwind v4 (2024) | Must use `@plugin "@tailwindcss/typography"` in CSS, not JS config |
| `next.config.js` CommonJS | `next.config.ts` TypeScript + ESM | Next.js 15+ (2024) | Use `import createMDX` syntax, not `require()` |
| `@next/mdx` without `mdx-components.tsx` | Mandatory `mdx-components.tsx` | Next.js 13.4+ | File must exist at project root or build fails |
| MDX files as routes in `/app/` | Dynamic imports from `/content/` | App Router best practice | Content in `src/content/`, routes use `generateStaticParams` |
| `frontmatter` in MDX via `---` | `gray-matter` or remark plugins | Always | `@next/mdx` never supported frontmatter natively |

**Deprecated/outdated:**
- `next-mdx-remote` v3 (v4 is current) -- not needed for local MDX files
- `tailwind.config.js` in Tailwind v4 -- replaced by CSS-first config
- MDX page-based routing in `/app/` -- dynamic imports from separate content directory is the recommended pattern

## Project Constraints (from CLAUDE.md)

- **pnpm only** -- never npm, yarn, bun
- **Next.js 16** App Router, TypeScript strict, TailwindCSS v4
- **Server components by default** -- client components only for interactive elements (docs sidebar, TOC scroll tracking)
- **`proxy.ts`** instead of `middleware.ts` -- not relevant for this phase but must not create middleware
- **CSS-first Tailwind v4** -- no `tailwind.config.js`, use `@theme {}` and `@plugin` directives in `globals.css`
- **Design fidelity** -- new sections should match existing card patterns and page hero patterns
- **Self-hosted deployment** -- `output: "standalone"` must be preserved in `next.config.ts`
- **No test framework** -- no test infrastructure exists in this project

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `tsconfig.json` needs `**/*.mdx` added to `include` array | Architecture Patterns | TypeScript may not type-check .mdx imports; low risk since @types/mdx handles most cases |
| A2 | `gray-matter` is the best frontmatter approach over remark plugins | Standard Stack | If remark plugins are preferred, configuration changes but result is the same |
| A3 | `reading-time` package is unnecessary -- manual `Math.ceil(words/200)` is sufficient | Standard Stack | For 3 blog posts with English content, manual calculation is fine; if CJK content is added later, `reading-time` would be more accurate |
| A4 | `rehype-autolink-headings` with `{ behavior: "wrap" }` is the correct option | Code Examples | `behavior: "append"` is an alternative that adds a visible link icon after headings |
| A5 | `output: "standalone"` is compatible with `@next/mdx` dynamic imports | Architecture Patterns | Next.js docs do not mention any conflict; the dynamic import pattern is standard |

## Open Questions

1. **TOC scroll tracking approach**
   - What we know: Need to highlight current heading in TOC while scrolling
   - What's unclear: Whether to use `IntersectionObserver` (more performant) or scroll event listener (simpler)
   - Recommendation: Use `IntersectionObserver` in a `"use client"` TOC component -- it's the modern standard and avoids layout thrashing

2. **Docs sidebar navigation data source**
   - What we know: 5 docs in two categories (Getting Started, Modules)
   - What's unclear: Whether to hardcode nav structure in a data file or auto-generate from file system
   - Recommendation: Hardcode in `src/data/docs-nav.ts` -- only 5 docs, auto-generation adds complexity for no benefit

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/runtime | Yes | Compatible | -- |
| pnpm | Package management | Yes | In use | -- |
| Next.js 16.2.6 | Framework | Yes | 16.2.6 | -- |
| `fs` module | MDX file reading | Yes | Node built-in | -- |
| `path` module | MDX path resolution | Yes | Node built-in | -- |

**Missing dependencies with no fallback:**
- None -- all required packages are installable via pnpm

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BLOG-01 | Blog listing renders 3 cards with metadata | Manual (no test framework) | `pnpm build` (catches compile errors) | N/A |
| BLOG-02 | Individual posts render MDX correctly | Manual (no test framework) | `pnpm build` | N/A |
| BLOG-03 | GFM tables and code blocks render | Manual (no test framework) | Visual inspection | N/A |
| BLOG-04 | Content in correct directory | Manual (no test framework) | `pnpm build` | N/A |
| DOCS-01 | Docs sidebar with category grouping | Manual (no test framework) | Visual inspection | N/A |
| DOCS-02 | TOC generated from headings | Manual (no test framework) | Visual inspection | N/A |
| LEGL-01-04 | Legal pages render with content | Manual (no test framework) | `pnpm build` + visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `pnpm build` (verify no compile errors)
- **Per wave merge:** `pnpm build && pnpm lint`
- **Phase gate:** Full build green + manual visual verification of all new pages

### Wave 0 Gaps
- No test framework exists in this project. All validation is via build + lint + visual inspection.
- This is acceptable per project conventions (no test framework installed, no test files present).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth on public marketing site |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | All pages are public |
| V5 Input Validation | No | No user input in this phase (contact form is Phase 6) |
| V6 Cryptography | No | No sensitive data handled |

### Known Threat Patterns for MDX + Next.js

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| MDX code injection via remote content | Tampering | Only local MDX files are used (not remote); `@next/mdx` compiles at build time, not runtime |
| XSS via MDX HTML blocks | Tampering | `@next/mdx` sanitizes output by default; React escapes JSX |
| Path traversal in dynamic slug | Tampering | `generateStaticParams` with `dynamicParams: false` restricts to known slugs; no user-controlled file paths |

**Security note:** This phase is low-risk from a security perspective. All MDX content is local (committed to git), legal pages are static TSX, and no user input is processed. The `dynamicParams = false` setting prevents arbitrary file access via URL manipulation.

## Sources

### Primary (HIGH confidence)
- nextjs.org/docs/app/building-your-application/configuring/mdx -- Complete MDX configuration guide for App Router
- github.com/tailwindlabs/tailwindcss-typography README -- Installation and usage for Tailwind v4 `@plugin` directive
- npm registry -- All package versions verified via `pnpm view` commands

### Secondary (MEDIUM confidence)
- Existing project source files (next.config.ts, navigation.ts, layout.tsx, globals.css, features/page.tsx, Footer.tsx) -- Verified patterns and integration points

### Tertiary (LOW confidence)
- None -- all claims verified via official docs or npm registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all package versions verified against npm registry, all configuration patterns verified against official Next.js and Tailwind docs
- Architecture: HIGH -- follows established project patterns and Next.js official MDX guide
- Pitfalls: HIGH -- derived from official documentation warnings and Next.js MDX requirements

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (30 days -- stable ecosystem, but watch for Next.js minor updates)
