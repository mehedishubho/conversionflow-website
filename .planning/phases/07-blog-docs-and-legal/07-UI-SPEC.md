---
phase: 7
slug: blog-docs-and-legal
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-12
---

# Phase 7 — UI Design Contract

> Visual and interaction contract for the blog, documentation, and legal sections. All new UI -- no HTML design reference exists for these sections. Must match existing card, hero, and page patterns established in Phases 2-4.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | none | Project uses TailwindCSS v4 CSS-first config, not shadcn |
| Preset | not applicable | No `components.json`; design tokens in `globals.css` |
| Component library | none | Custom components with `globals.css` utility classes |
| Icon library | Lucide React 1.14.0 | Already installed |
| Font heading | Syne (weights 600, 700, 800) | `globals.css` `--font-syne` |
| Font body | DM Sans (weights 300-700) | `globals.css` `--font-dm-sans` |
| Font mono | JetBrains Mono (weights 400, 600) | `globals.css` `--font-mono` |
| Prose styling | @tailwindcss/typography via `@plugin` directive | CONTEXT.md D-21, D-22, D-24 |

---

## Spacing Scale

Declared values (multiples of 4, matching existing `globals.css` patterns):

| Token | Value | Usage | Source |
|-------|-------|-------|--------|
| xs | 4px | Inline gaps, tag padding | Existing `.tag`, `.ck` |
| sm | 8px | Compact gaps, form spacing | Existing `.form-grid` gap |
| md | 16px | Default element spacing | Existing `.bento` gap, `.support-grid` gap |
| lg | 24px | Section padding, card padding | Existing `.bc` padding, `.tcard` padding |
| xl | 32px | Layout gaps, card padding | Existing `.clog-item` padding, `.support-card` padding |
| 2xl | 48px | Major section breaks | Existing `.footer-grid` gap |
| 3xl | 64px | Page-level spacing | Existing `footer` padding-top |

Exceptions:
- Blog card reading time pill: `3px 9px` padding (matches `.tag` pattern at 10.5px font)
- Legal page max-width: `800px` (narrower than standard `1160px` container for readability)
- Docs sidebar width: `240px` fixed column (established in RESEARCH.md architecture)
- Page hero top padding: `130px` (matches `.page-hero-sm` existing value)

---

## Typography

Matching existing `globals.css` type scale. Adding `@tailwindcss/typography` prose classes for MDX content.

| Role | Size | Weight | Line Height | Font | Source |
|------|------|--------|-------------|------|--------|
| Body (prose) | 15.5px | 400 | 1.75 | DM Sans | Existing `.sec-sub` + prose defaults |
| Label | 11px | 800 | 1.0 | Syne | Existing `.eyebrow` |
| Card title | 16px | 800 | 1.0 | Syne | Existing `.bc-title` |
| Section heading | clamp(26px, 3.2vw, 44px) | 900 | 1.1 | Syne | Existing `.sec-title` |
| Page hero heading | clamp(32px, 4vw, 52px) | 900 | 1.1 | Syne | Existing features page hero |
| Prose h2 | 24px | 800 | 1.2 | Syne | Prose customization |
| Prose h3 | 20px | 700 | 1.3 | Syne | Prose customization |
| Prose code | 14px | 600 | 1.5 | JetBrains Mono | Prose + mono font |
| Legal body | 14px | 400 | 1.8 | DM Sans | Legal pages use prose at slightly smaller size |
| Muted/meta | 12px | 600 | 1.0 | DM Sans | Existing `.clog-date`, `.tstat-l` |

Prose customization (applied via `globals.css` after `@plugin` directive):

```css
/* Prose overrides to match design tokens */
.prose {
  --tw-prose-body: var(--text2);
  --tw-prose-headings: var(--foreground);
  --tw-prose-links: var(--accent);
  --tw-prose-code: var(--foreground);
  --tw-prose-pre-bg: var(--bg2);
  --tw-prose-pre-border: var(--border);
  --tw-prose-th-borders: var(--border);
  --tw-prose-td-borders: var(--border);
  font-family: var(--font-dm-sans);
}
.prose h2, .prose h3, .prose h4 {
  font-family: var(--font-syne);
}
.prose :where(code):not(:where([class~="not-prose"], [class~="not-prose"] *)) {
  font-family: var(--font-mono);
  font-weight: 600;
}
```

---

## Color

Using existing design tokens from `globals.css`. No new colors needed.

| Role | Light Value | Dark Value | Usage | Source |
|------|-------------|------------|-------|--------|
| Dominant (60%) | `--background` #F2F4FD | #050C1F | Page backgrounds | Existing |
| Secondary (30%) | `--surface` #ffffff | #0D1630 | Cards, sidebar, panels | Existing |
| Accent (10%) | `--accent` #0047FF | #4D8AFF | See reserved list below | Existing |
| Success | `--green` #00BF7A | #00D48A | Live chips, status indicators, check marks | Existing |
| Warning | `--orange` #FF8800 | #FFA733 | Change tags (fixes) | Existing |
| Text primary | `--foreground` #080E2E | #EDF0FF | Headings, important text | Existing |
| Text secondary | `--text2` #3B4480 | #9BAAD8 | Body text, descriptions | Existing |
| Text muted | `--muted` #7C87BB | #4E5A84 | Meta info, dates, labels | Existing |

Accent reserved for:
- Link hover states (footer links, blog card hover)
- Active sidebar item indicator in docs
- Prose link color
- Blog card border on hover
- CTA buttons (`.btn-primary`)
- Eyebrow labels
- TOC active heading indicator
- Card hover border accent (matching `.bc:hover` pattern)

Destructive: `--red` #F53B5C / #FF4D70 -- not applicable in this phase (no destructive actions).

**Gradient thumbnails for blog cards** (Claude's discretion from CONTEXT.md):
- Use 3 distinct gradient pairs derived from accent + accent-glow tokens
- Card 1: `linear-gradient(135deg, var(--accent-light) 0%, var(--accent-glow) 100%)`
- Card 2: `linear-gradient(135deg, var(--green-lt) 0%, var(--accent-light) 100%)`
- Card 3: `linear-gradient(135deg, var(--orange-lt) 0%, var(--green-lt) 100%)`
- Aspect ratio: 16/9 matching `.video-thumb` pattern

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Blog listing eyebrow | Blog |
| Blog listing title | Latest from WooBooster |
| Blog listing subtitle | Insights, guides, and updates for Bangladeshi WooCommerce store owners. |
| Blog CTA (card) | Read more (text link, not button) |
| Docs eyebrow | Documentation |
| Docs title | WooBooster Docs |
| Docs subtitle | Everything you need to set up, configure, and master WooBooster. |
| Docs sidebar heading | Guides |
| Docs sidebar categories | Getting Started, Modules |
| Privacy title | Privacy Policy |
| Terms title | Terms of Service |
| Refund title | Refund Policy |
| License title | License Agreement |
| Legal "last updated" label | Last updated: {date} |
| Empty blog state heading | Coming Soon |
| Empty blog state body | We are working on helpful articles about WooCommerce automation for Bangladeshi stores. Check back soon. |
| Error state (post not found) | Post Not Found -- This blog post does not exist or has been removed. Browse all posts. |
| Error state (doc not found) | Page Not Found -- This documentation page does not exist. Browse all docs. |
| Destructive confirmation | None in this phase |

Blog post frontmatter schema:
```typescript
interface BlogFrontmatter {
  title: string;       // e.g. "Getting Started with WooBooster"
  date: string;        // ISO format: "2025-06-01"
  excerpt: string;     // 1-2 sentence summary
}
```

Docs frontmatter schema:
```typescript
interface DocFrontmatter {
  title: string;       // e.g. "Getting Started"
  category: string;    // "Getting Started" | "Modules"
  order: number;       // Sort order within category
}
```

---

## Component Inventory

### New Components

| Component | Path | Type | Pattern Source |
|-----------|------|------|---------------|
| BlogCard | `src/components/blog/BlogCard.tsx` | Server component | Adapted from `.bc` bento card |
| GradientThumbnail | `src/components/blog/GradientThumbnail.tsx` | Server component | New -- gradient placeholder |
| DocsSidebar | `src/components/docs/DocsSidebar.tsx` | Client component | New -- sticky sidebar nav |
| TableOfContents | `src/components/docs/TableOfContents.tsx` | Client component | New -- scroll-tracking TOC |
| LegalLayout | `src/components/legal/LegalLayout.tsx` | Server component | Adapted from page-hero-sm + prose |

### New Utility Module

| Module | Path | Purpose |
|--------|------|---------|
| mdx | `src/lib/mdx.ts` | `getBlogPosts()`, `getDocPosts()`, reading time calculation |

### New Data File

| File | Path | Purpose |
|------|------|---------|
| docs-nav | `src/data/docs-nav.ts` | Sidebar navigation structure (5 docs, 2 categories) |

### New Routes

| Route | File | Pattern |
|-------|------|---------|
| `/blog` | `src/app/blog/page.tsx` | Page hero + 3-column card grid |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | Page hero with meta + prose content |
| `/docs` | `src/app/docs/page.tsx` | Redirect to first doc or landing |
| `/docs/[slug]` | `src/app/docs/[slug]/page.tsx` | Sidebar + prose content + TOC |
| `/docs/layout.tsx` | `src/app/docs/layout.tsx` | Two-column layout (sidebar + content) |
| `/privacy` | `src/app/privacy/page.tsx` | LegalLayout wrapper |
| `/terms` | `src/app/terms/page.tsx` | LegalLayout wrapper |
| `/refund` | `src/app/refund/page.tsx` | LegalLayout wrapper |
| `/license` | `src/app/license/page.tsx` | LegalLayout wrapper |

### Content Files

| File | Content |
|------|---------|
| `src/content/blog/woo-booster-getting-started.mdx` | Setup guide with lists, table, code block |
| `src/content/blog/bd-ecommerce-courier-guide.mdx` | Courier comparison with tables |
| `src/content/blog/meta-capi-bangladesh.mdx` | CAPI setup with code examples |
| `src/content/docs/getting-started.mdx` | Installation and activation guide |
| `src/content/docs/courier-sync.mdx` | Courier Sync module documentation |
| `src/content/docs/meta-capi.mdx` | Meta CAPI configuration docs |
| `src/content/docs/fraud-shield.mdx` | Fraud Shield settings docs |
| `src/content/docs/analytics.mdx` | Analytics dashboard docs |

### Configuration Changes

| File | Change |
|------|--------|
| `next.config.ts` | Wrap with `createMDX()`, add remark/rehype plugins, add `pageExtensions` |
| `globals.css` | Add `@plugin "@tailwindcss/typography"` + prose customizations |
| `tsconfig.json` | Add `**/*.mdx` to include array |
| `mdx-components.tsx` | Create at project root (mandatory for @next/mdx) |
| `src/data/navigation.ts` | Update 6 href values from "#" to real routes |

---

## Layout Specifications

### Blog Listing Page (`/blog`)

```
+--------------------------------------------------+
|  Page Hero (page-hero-sm)                         |
|  [eyebrow: Blog]                                  |
|  [title: Latest from WooBooster]                  |
|  [subtitle: Insights, guides...]                  |
+--------------------------------------------------+
|  Section (sec)                                    |
|  +----------+ +----------+ +----------+           |
|  | BlogCard | | BlogCard | | BlogCard |           |
|  | thumb    | | thumb    | | thumb    |           |
|  | title    | | title    | | title    |           |
|  | date     | | date     | | date     |           |
|  | excerpt  | | excerpt  | | excerpt  |           |
|  | readtime | | readtime | | readtime |           |
|  +----------+ +----------+ +----------+           |
|  grid-cols-1 md:grid-cols-2 lg:grid-cols-3        |
+--------------------------------------------------+
```

Card dimensions (matching `.bc` bento card pattern):
- Border: `1px solid var(--border)`, `border-radius: 14px`
- Padding: `28px 24px` (matches `.bc`)
- Thumbnail: `border-radius: 10px`, aspect-ratio `16/9`, gradient background
- Hover: `border-color: var(--accent)`, `box-shadow: var(--shadow-lg)`, `transform: translateY(-3px)`
- Transition: `0.25s` matching `.bc` pattern

### Blog Post Page (`/blog/[slug]`)

```
+--------------------------------------------------+
|  Post Hero (narrower page-hero-sm)                |
|  [title from frontmatter]                         |
|  [date + reading time + "Back to Blog" link]      |
+--------------------------------------------------+
|  Article content                                  |
|  max-width: 760px, centered                       |
|  prose dark:prose-invert max-w-none               |
|  (MDX rendered with typography styles)            |
+--------------------------------------------------+
```

- Hero: Uses `.page-hero-sm` with reduced padding
- Content wrapper: `max-w-[760px] mx-auto px-7 py-16`
- Prose class: `prose prose-headings:font-[family-name:var(--font-syne)] prose-a:text-accent dark:prose-invert max-w-none`
- Back link: `text-[13px] font-semibold text-muted hover:text-accent transition-colors` with left arrow

### Documentation Page (`/docs/[slug]`)

```
+--------------------------------------------------+
|  Page Hero (page-hero-sm)                         |
|  [eyebrow: Documentation]                         |
|  [title: WooBooster Docs]                         |
|  [subtitle: Everything you need...]               |
+--------------------------------------------------+
|  Layout (grid, 240px sidebar + 1fr content)       |
|  +--------+ +-------------------------------+     |
|  | Sidebar| | Content Area                  |     |
|  | (sticky)| |  [h1 doc title]              |     |
|  | Getting| |  [prose content]              |     |
|  | Started| |                               |     |
|  | - item | |                               |     |
|  | Modules| |                               |     |
|  | - item | |                               |     |
|  | - item | |                               |     |
|  | - item | |                               |     |
|  +--------+ +-------------------------------+     |
|  hidden on mobile, visible on lg:                 |
+--------------------------------------------------+
```

Sidebar specs:
- Container: `position: sticky`, `top: 100px` (below navbar)
- Width: `240px` fixed column in grid
- Max-height: `calc(100vh - 120px)` with `overflow-y: auto`
- Background: transparent (inherits from page background)
- Category headings: `font-syne`, `11px`, `font-weight: 800`, `text-transform: uppercase`, `letter-spacing: 1.3px`, `color: var(--muted)` (matches footer column headings)
- Nav items: `13.5px`, `font-weight: 600`, `color: var(--text2)`, `padding: 6px 0`
- Active item: `color: var(--accent)`, left border `2px solid var(--accent)`, `padding-left: 12px`
- Hover: `color: var(--accent)` with `transition-colors 0.2s`
- Mobile: hidden below `lg` breakpoint; content takes full width

Table of Contents (right side of content or integrated):
- Placed inside content area as a right-side floating element on `xl` screens
- Heading items: `13px`, `color: var(--muted)`, `font-weight: 600`
- Active heading: `color: var(--accent)`, `font-weight: 700`
- Indent h3 items: `padding-left: 16px`
- Uses `IntersectionObserver` for scroll tracking
- Component is `"use client"` (browser API required)

### Legal Pages (`/privacy`, `/terms`, `/refund`, `/license`)

```
+--------------------------------------------------+
|  LegalLayout                                      |
|  max-w-[800px] mx-auto px-7 py-16                |
|  [h1 title, sec-title size]                       |
|  [Last updated: date, muted text-sm]              |
|  +----------------------------------------------+ |
|  | prose dark:prose-invert max-w-none            | |
|  | (legal content as children)                   | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
```

- Title: `.sec-title` at `clamp(28px, 3.5vw, 44px)` (slightly smaller than page hero)
- Last updated: `text-sm text-muted mt-2`
- Content sections use `<h2>` headings with prose styling
- No page-hero-sm background (legal pages are plain -- no gradient)
- Sections separated by `<h2>` headings with adequate `margin-top` via prose defaults

---

## Interaction States

### Blog Card
- Default: `border: 1px solid var(--border)`, no shadow
- Hover: `border-color: var(--accent)`, `box-shadow: var(--shadow-lg)`, `transform: translateY(-3px)`
- Focus-visible: `outline: 2px solid var(--accent)`, `outline-offset: 2px`
- Transition: `all 0.25s` (matches `.bc` pattern)
- Entire card is wrapped in `<Link>`

### Docs Sidebar Item
- Default: `color: var(--text2)`, no indicator
- Hover: `color: var(--accent)`, `transition-colors 0.2s`
- Active: `color: var(--accent)`, `border-left: 2px solid var(--accent)`, `padding-left: 12px`

### Table of Contents Item
- Default: `color: var(--muted)`, `font-weight: 600`
- Active (in viewport): `color: var(--accent)`, `font-weight: 700`
- Hover: `color: var(--text2)`, `transition-colors 0.15s`

### Prose Links
- Default: `color: var(--accent)`, `text-decoration: underline`, `text-underline-offset: 2px`
- Hover: `text-decoration-thickness: 2px` (or default underline)

---

## Responsive Breakpoints

Matching existing `globals.css` media queries:

| Breakpoint | Blog Listing | Docs Layout | Legal Pages |
|------------|-------------|-------------|-------------|
| Desktop (960px+) | 3-column grid | 2-column (sidebar + content) | Single column, max-width 800px |
| Tablet (641-960px) | 2-column grid | Single column, sidebar hidden | Single column |
| Mobile (640px and below) | 1-column grid | Single column, sidebar hidden | Single column, smaller padding |

Docs sidebar mobile behavior:
- Hidden below `lg` breakpoint via `hidden lg:block`
- No hamburger/drawer for sidebar on mobile (content pages are still usable via sequential scrolling)
- Mobile docs page shows content full-width

---

## Dark Mode

All new pages must support dark mode via existing `next-themes` class strategy.

| Element | Light | Dark | Mechanism |
|---------|-------|------|-----------|
| Prose content | default prose colors | `prose-invert` | `dark:prose-invert` class on wrapper |
| Blog cards | `var(--surface)` bg, `var(--border)` border | Same tokens auto-adapt | CSS custom properties |
| Docs sidebar | `var(--text2)` items | Same tokens auto-adapt | CSS custom properties |
| Gradient thumbnails | Gradient from light tokens | Same gradients (they reference CSS vars) | Use CSS vars in gradients |
| Legal pages | `var(--background)` bg | Same token auto-adapts | CSS custom properties |
| Page heroes | `var(--hero-g)` gradient | Same token auto-adapts | CSS custom properties |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| Third-party registries | none | not applicable |

This phase uses no shadcn components. All UI is built from existing CSS utility classes in `globals.css`, Tailwind utility classes, and `@tailwindcss/typography` prose classes.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
