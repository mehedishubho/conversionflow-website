# Phase 9: Settings Foundation - Research

**Researched:** 2026-05-20
**Domain:** Next.js App Router nested layouts, admin settings navigation, UI component migration
**Confidence:** HIGH

## Summary

Phase 9 restructures the flat `/admin/settings` page (which currently stacks three form components vertically: PaymentSettingsForm, EmailProviderSettings, TrackingSettingsForm) into a sub-page navigation system with a SettingsShell layout component, category landing page, and dedicated sub-routes. The research confirms all decisions from CONTEXT.md are architecturally sound and directly implementable using the existing codebase patterns and Next.js 16 App Router nested layouts.

The existing codebase already uses the exact patterns needed: server component pages load data via server actions, client form components receive `initialData` props, and the admin layout wraps everything in `AdminShell` > `DashboardShell` > `AppSidebar`. Adding a secondary `layout.tsx` inside `/admin/settings/` creates a nested layout that wraps all settings sub-routes, which is the standard Next.js App Router mechanism for shared UI across route segments.

**Primary recommendation:** Build `SettingsShell` as a `"use client"` component rendered by a new `layout.tsx` at `/admin/settings/layout.tsx`. This layout wraps all settings pages (landing, payment, smtp, seo/*) and provides the secondary sidebar navigation. Use `usePathname` for active section detection, matching the pattern already used in `AppSidebar.tsx`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Left sidebar navigation within the settings page content area (SettingsShell client component)
- **D-02:** New `SettingsShell` component with sidebar nav list and children slot, takes `activeSection` prop
- **D-03:** Flat list of all 14 SEO sections in nav (no nesting/grouping)
- **D-04:** Separate Next.js route for each section (18 total routes under `/admin/settings/`)
- **D-05:** Single "Settings" entry in admin sidebar (unchanged)
- **D-06:** Always-visible secondary sidebar on ALL settings pages
- **D-07:** Two-level sidebar: Top level (Payment, SMTP, SEO) always visible; SEO sub-sections shown when SEO active/expanded
- **D-08:** Category cards landing page at `/admin/settings`
- **D-09:** Cards with status indicators (green/gray dot for configured/not-configured), icon, title, description, arrow link
- **D-10:** Per-section Save button with inline success/error message (current pattern preserved)
- **D-11:** Server component loads data, passes as `initialData` prop to client form component
- **D-12:** Each settings section is its own Next.js route with its own `page.tsx`
- **D-13:** Move existing forms to new routes, old flat page becomes landing page with cards

### Claude's Discretion
(None explicitly stated -- all decisions locked)

### Deferred Ideas (OUT OF SCOPE)
- Actual SEO settings forms (Phase 10)
- Tracking pixel forms (Phase 11)
- Schema/redirect forms (Phase 12)
- Analytics dashboard (Phase 13)
- Any database schema changes
- Server actions for new settings
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Admin can access a settings landing page at /admin/settings with category cards linking to Payment Gateway, SMTP/Email, and SEO Settings | SettingsShell layout wraps landing page; landing `page.tsx` renders 3 category cards with navigation links (D-08, D-09) |
| NAV-02 | Each settings category has its own sub-route (/admin/settings/payment, /admin/settings/smtp, /admin/settings/seo) | Next.js nested routes with `page.tsx` in each directory; existing forms migrated to their respective routes (D-04, D-13) |
| NAV-03 | SEO Settings has nested sub-routes for each SEO section (/admin/settings/seo/general, /admin/settings/seo/verification, etc.) | SEO layout shell at `/admin/settings/seo/layout.tsx` with flat nav; 14 placeholder `page.tsx` files (D-03, D-04) |
| NAV-04 | Existing Payment, Email, and Tracking forms are migrated from the flat settings page to their respective sub-routes without losing functionality | Forms moved as-is; server component pages call same server actions with same `initialData` prop pattern (D-13, D-11) |
| NAV-05 | Settings sub-navigation uses a consistent tabbed or sidebar layout across all categories | SettingsShell rendered by `/admin/settings/layout.tsx` wraps all sub-routes with secondary sidebar (D-01, D-06, D-07) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.6 | App Router nested layouts | Project framework -- supports nested `layout.tsx` natively [VERIFIED: package.json] |
| react | 19.2.4 | UI rendering | Project runtime [VERIFIED: package.json] |
| lucide-react | 1.14.0 | Icons for sidebar nav items + landing cards | Already used throughout dashboard [VERIFIED: package.json, AppSidebar.tsx, Navbar.tsx] |
| tailwindcss | 4.x | Styling via utility classes | Project standard -- CSS-first config in `dashboard.css` [VERIFIED: package.json, postcss.config.mjs] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional class names | Active nav item styling, conditional rendering |
| tailwind-merge | 3.6.0 | Class dedup via `cn()` | All className merging (imported from `@/lib/utils`) |

### Already Installed (No New Dependencies Needed)
Phase 9 requires zero new package installations. All UI components (ComponentCard, InputField, Button, Badge, Select) and infrastructure (sidebar context, theme, icons) already exist.

**Installation:**
```bash
# No new packages required for this phase
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/(admin)/admin/settings/
  layout.tsx                           # NEW: SettingsShell wrapper (server component)
  page.tsx                             # REPLACE: Landing page with 3 category cards
  payment/
    page.tsx                           # NEW: Wraps PaymentSettingsForm
  smtp/
    page.tsx                           # NEW: Wraps EmailProviderSettings
  seo/
    layout.tsx                         # NEW: SEO sub-shell (optional, if different nav needed)
    page.tsx                           # NEW: SEO landing/redirect to /seo/general
    general/page.tsx                   # NEW: Placeholder for Phase 10
    verification/page.tsx              # NEW: Placeholder for Phase 10
    sitemaps/page.tsx                  # NEW: Placeholder for Phase 10
    robots/page.tsx                    # NEW: Placeholder for Phase 10
    social/page.tsx                    # NEW: Placeholder for Phase 11
    meta-pixel/page.tsx                # NEW: Placeholder for Phase 11
    tiktok/page.tsx                    # NEW: Placeholder for Phase 11
    google/page.tsx                    # NEW: Placeholder for Phase 11
    schema/page.tsx                    # NEW: Placeholder for Phase 11
    redirects/page.tsx                 # NEW: Placeholder for Phase 12
    ai-seo/page.tsx                    # NEW: Placeholder for Phase 12
    image-seo/page.tsx                 # NEW: Placeholder for Phase 12
    performance/page.tsx               # NEW: Placeholder for Phase 12
    analytics/page.tsx                 # NEW: Placeholder for Phase 13

src/components/admin/
  SettingsShell.tsx                    # NEW: Secondary sidebar layout component
  SettingsNav.tsx                      # NEW: Navigation data + rendering (extracted from SettingsShell)
  PaymentSettingsForm.tsx              # EXISTING: No changes needed (stays in place)
  EmailProviderSettings.tsx            # EXISTING: No changes needed (stays in place)
  TrackingSettingsForm.tsx             # EXISTING: No changes needed (stays in place)
```

### Pattern 1: Nested Layout for Settings Shell
**What:** A `layout.tsx` at `/admin/settings/layout.tsx` renders the `SettingsShell` component, which provides the secondary sidebar navigation for all settings sub-routes.
**When to use:** This is the core pattern for Phase 9. The nested layout automatically wraps all `page.tsx` files within `/admin/settings/` and its children.
**How it works:** The layout hierarchy is:

```
(app)/(admin)/layout.tsx         --> AdminShell (sidebar + header)
  admin/settings/layout.tsx      --> SettingsShell (secondary sidebar)
    admin/settings/page.tsx      --> Landing cards
    admin/settings/payment/page.tsx --> Payment form
    admin/settings/smtp/page.tsx    --> Email form
    admin/settings/seo/layout.tsx   --> SEO sub-shell (optional wrapper)
      admin/settings/seo/*/page.tsx --> SEO section pages
```

**Example:**
```typescript
// src/app/(admin)/admin/settings/layout.tsx
import { SettingsShell } from "@/components/admin/SettingsShell";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsShell>{children}</SettingsShell>;
}
```

This is a server component (no `"use client"` needed) because it only passes children through. The `SettingsShell` component itself is the client component.

### Pattern 2: Server Component Page + Client Form
**What:** Each `page.tsx` is a server component that loads data via server actions and passes it as props to a client form component.
**When to use:** Every settings sub-route page. This is the existing proven pattern.
**Example:**
```typescript
// src/app/(admin)/admin/settings/payment/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";
import { getPaymentSettings } from "@/app/(admin)/actions/admin-settings";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const settings = await getPaymentSettings();

  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Settings" basePath="/admin/settings" />
      <PaymentSettingsForm initialData={{ /* same shape */ }} />
    </div>
  );
}
```

### Pattern 3: SettingsShell Client Component
**What:** A `"use client"` component that renders the secondary sidebar navigation and a content area for children.
**When to use:** On every `/admin/settings/**` route via the nested layout.
**Example:**
```typescript
// src/components/admin/SettingsShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CreditCard, Mail, Search, Settings, ChevronDown,
  Globe, Shield, FileText, Share2, Target, Music,
  BarChart3, Code, ArrowRightLeft, Bot, Image, Zap,
  LineChart
} from "lucide-react";

const TOP_LEVEL_NAV = [
  { label: "Overview", href: "/admin/settings", icon: Settings },
  { label: "Payment Gateway", href: "/admin/settings/payment", icon: CreditCard },
  { label: "SMTP / Email", href: "/admin/settings/smtp", icon: Mail },
  {
    label: "SEO Settings",
    href: "/admin/settings/seo",
    icon: Search,
    children: [
      { label: "General", href: "/admin/settings/seo/general", icon: Globe },
      { label: "Verification", href: "/admin/settings/seo/verification", icon: Shield },
      // ... all 14 SEO sections
    ],
  },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSeoExpanded = pathname.startsWith("/admin/settings/seo");

  return (
    <div className="flex gap-6">
      {/* Secondary Sidebar */}
      <aside className="w-60 shrink-0">
        <nav className="space-y-1">
          {TOP_LEVEL_NAV.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                  pathname === item.href
                    ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
              {/* Expanded SEO sub-items */}
              {item.children && isSeoExpanded && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
                        pathname === child.href
                          ? "text-brand-500 font-medium"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      <child.icon className="w-3.5 h-3.5" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      {/* Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
```

### Pattern 4: Landing Page with Category Cards
**What:** The `/admin/settings` page renders 3 category cards with status indicators.
**When to use:** As the new `page.tsx` at the settings root.
**Example:**
```typescript
// Card pattern using existing ComponentCard + Badge
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Link href="/admin/settings/payment">
    <ComponentCard title="Payment Gateway" desc="Configure payment methods, VAT, and SSL Commerce.">
      <div className="flex items-center justify-between">
        <span className={cn("h-2 w-2 rounded-full", isConfigured ? "bg-success-500" : "bg-gray-300")} />
        <span className="text-brand-500 text-sm font-medium">Configure &rarr;</span>
      </div>
    </ComponentCard>
  </Link>
  {/* SMTP and SEO cards follow same pattern */}
</div>
```

### Pattern 5: Placeholder SEO Sub-Pages
**What:** Minimal `page.tsx` files for SEO sub-routes that render a "Coming Soon" or placeholder message.
**When to use:** All 14 SEO sub-section routes in this phase.
**Example:**
```typescript
// src/app/(admin)/admin/settings/seo/general/page.tsx
import ComponentCard from "@/components/common/ComponentCard";

export default function SeoGeneralPage() {
  return (
    <ComponentCard title="General SEO Settings" desc="Configure website title, meta defaults, and canonical URL.">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        SEO settings will be available in Phase 10.
      </p>
    </ComponentCard>
  );
}
```

### Anti-Patterns to Avoid
- **DO NOT** create a `"use client"` layout.tsx -- keep it as a server component that passes children to the client SettingsShell
- **DO NOT** duplicate auth checks in every SEO sub-page if the admin `layout.tsx` already guards access (currently the root `(admin)/layout.tsx` does NOT do auth checks -- each page does its own, so SEO placeholders should NOT need auth checks since they display no data; but payment/smtp pages MUST keep their auth checks)
- **DO NOT** put SEO sub-nav logic in `AppSidebar.tsx` -- the secondary sidebar is entirely inside SettingsShell, keeping the admin nav clean per D-05
- **DO NOT** use `useState` for SEO expansion state when `usePathname` can derive it -- the pathname starting with `/admin/settings/seo` is sufficient to determine expansion (D-07)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Active route detection | Custom router state | `usePathname()` from `next/navigation` | Already used in AppSidebar.tsx; reliable and simple |
| Class name merging | String concatenation | `cn()` from `@/lib/utils` | Already established pattern (clsx + tailwind-merge) |
| Card UI wrapper | Custom card components | `ComponentCard` | Already exists with title/desc/children pattern |
| Status badges | Custom badge elements | `Badge` component | Already exists with success/error/warning variants |
| Breadcrumb navigation | Custom breadcrumb | `PageBreadcrumb` component | Already exists, used on every admin page |
| Icons | SVG imports or custom icons | `lucide-react` | Already installed and used throughout |
| Auth checking | Custom auth middleware | `auth.api.getSession()` + redirect | Existing pattern in every admin page |

**Key insight:** This phase requires zero new dependencies and zero new patterns. Everything builds on the existing codebase conventions.

## Common Pitfalls

### Pitfall 1: Nested Layout Children Not Rendering
**What goes wrong:** Creating a `layout.tsx` inside `/admin/settings/` that wraps children in a new `<html>` or `<body>` tag, causing a hydration error.
**Why it happens:** Next.js nested layouts share the root `<html>/<body>` from the parent. Only the root layout should have these tags.
**How to avoid:** The settings `layout.tsx` should return only the `SettingsShell` wrapper with `{children}` inside. No `<html>`, `<body>`, or `<head>` tags.
**Warning signs:** Console error: "There can be only one root layout."

### Pitfall 2: TrackingSettingsForm Data Splitting
**What goes wrong:** The current `TrackingSettingsForm` handles GA4, GTM, FB Pixel, and GSC verification -- these map to multiple SEO sub-sections (google, meta-pixel, verification). Simply moving the whole form to one route loses the sub-route organization.
**Why it happens:** The CONTEXT.md says "TrackingSettingsForm content absorbed into SEO tracking pages" -- this is ambiguous about where the form goes during Phase 9.
**How to avoid:** In Phase 9, keep `TrackingSettingsForm` temporarily at `/admin/settings/seo` root page (as a "Tracking & Analytics" section) OR move it to a dedicated tracking sub-route. The individual field splitting into Google/Meta/Verification routes happens in Phases 10-11. For Phase 9, the form stays intact but lives at a new URL.
**Warning signs:** If the tracking form disappears entirely during Phase 9, functionality is lost.

### Pitfall 3: Breadcrumb Path Breaking
**What goes wrong:** `PageBreadcrumb` currently shows "Home > Settings". After restructuring, Payment page should show "Settings > Payment Gateway" but the component takes a flat `basePath` prop.
**Why it happens:** The breadcrumb component is simple -- it shows "Home > {basePath link} > {pageTitle}" with a static `basePath`.
**How to avoid:** Use `basePath="/admin/settings"` for all sub-pages so the breadcrumb shows "Home > Settings > Payment Settings". The existing component handles this fine -- just pass the correct props.
**Warning signs:** Breadcrumb shows wrong parent path or dead link.

### Pitfall 4: Mobile Responsive Secondary Sidebar
**What goes wrong:** The secondary sidebar (SettingsShell) doesn't collapse on mobile, causing the content to be hidden or squished.
**Why it happens:** Forgetting to add responsive breakpoints for the sidebar/content layout.
**How to avoid:** Use `hidden lg:block` for the sidebar on mobile and a mobile-friendly alternative (e.g., a horizontal scrollable tab bar or a dropdown) for smaller screens. At minimum, stack vertically on mobile with `flex-col lg:flex-row`.
**Warning signs:** On mobile viewport, sidebar takes full width and content scrolls below.

### Pitfall 5: Route Group Layout Duplication
**What goes wrong:** Creating both `/admin/settings/layout.tsx` and `/admin/settings/seo/layout.tsx` that both render sidebar navigation, causing double sidebars on SEO pages.
**Why it happens:** The nested layout hierarchy means `/admin/settings/seo/layout.tsx` is rendered INSIDE `/admin/settings/layout.tsx`.
**How to avoid:** If SEO needs its own sub-shell, it should NOT render its own sidebar -- it should only add the SEO-specific nav items. The simplest approach: let SettingsShell handle ALL navigation (including SEO sub-items) and skip having a separate `/admin/settings/seo/layout.tsx` entirely. The SettingsShell uses `usePathname` to detect SEO routes and expand the sub-nav.
**Warning signs:** Two sidebars visible on `/admin/settings/seo/*` pages.

### Pitfall 6: SEO Sub-Routes Without Auth
**What goes wrong:** Placeholder SEO pages have no auth check, and later phases add real forms but forget to add auth.
**Why it happens:** Phase 9 placeholders don't display data, so developers skip auth.
**How to avoid:** Either add a simple auth check in the settings `layout.tsx` (recommended) or document that every SEO page must add auth in Phase 10+.
**Warning signs:** SEO pages accessible without login in production.

## Code Examples

### Existing Auth Pattern (from current settings page)
```typescript
// Source: src/app/(admin)/admin/settings/page.tsx [VERIFIED: codebase]
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/login");
const userRole = (session.user as Record<string, unknown>).role as string;
if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");
```

### Existing Form Data Loading Pattern
```typescript
// Source: src/app/(admin)/admin/settings/page.tsx [VERIFIED: codebase]
const settings = await getPaymentSettings();
// ... passed as initialData prop to client form component
<PaymentSettingsForm initialData={{
  paymentAccounts: settings.paymentAccounts.map((a) => ({ /* mapping */ })),
  vatRate: settings.vatRate,
  // ... etc
}} />
```

### Existing Client Form Save Pattern
```typescript
// Source: src/components/admin/EmailProviderSettings.tsx [VERIFIED: codebase]
const [isPending, startTransition] = useTransition();
const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

const handleSave = () => {
  setMessage(null);
  startTransition(async () => {
    try {
      await saveEmailProviderSettings({ /* data */ });
      setMessage({ type: "success", text: "Email settings saved." });
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    }
  });
};
```

### Active Route Detection Pattern (from AppSidebar)
```typescript
// Source: src/components/dashboard/AppSidebar.tsx [VERIFIED: codebase]
const pathname = usePathname();
const isActive = useCallback((path: string) => path === pathname, [pathname]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat settings page with all forms | Nested route structure with dedicated pages | Phase 9 | Better organization, code splitting, deep linking |
| Single page for all settings | Category landing page + sub-routes | Phase 9 | Matches enterprise SaaS patterns (Shopify, Vercel) |
| No sub-navigation | Secondary sidebar via nested layout | Phase 9 | Persistent navigation across settings sections |

**Not deprecated -- established patterns continued:**
- Server component + client form component pattern (D-11) is the standard Next.js approach
- Key-value settings table pattern works well for this phase
- `useTransition` + `isPending` + inline message pattern is the established form UX

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Auth check can be moved to `/admin/settings/layout.tsx` server component to avoid repetition in every sub-page | Architecture Patterns | If layout-level auth doesn't work as expected, each page needs its own check (like current pattern) |
| A2 | TrackingSettingsForm should remain intact and be placed at a temporary route during Phase 9 (e.g., `/admin/settings/seo` root or `/admin/settings/tracking`) | Pitfall 2 | If CONTEXT.md D-13 means "absorb into individual routes now", that's Phase 10-11 work bleeding into Phase 9 |
| A3 | No separate `/admin/settings/seo/layout.tsx` is needed -- SettingsShell handles all nav including SEO sub-items via pathname detection | Architecture Patterns | If SEO needs its own layout wrapper (e.g., different breadcrumb behavior), a separate layout would be needed |
| A4 | The `PageBreadcrumb` component's `basePath` prop is sufficient for sub-page breadcrumbs without modification | Pitfall 3 | If breadcrumb needs multi-level depth (Settings > SEO > General), the component may need enhancement |

**If this table is empty:** All claims in this research were verified or cited -- no user confirmation needed.

## Open Questions

1. **TrackingSettingsForm Placement**
   - What we know: CONTEXT.md says "TrackingSettingsForm content absorbed into SEO tracking pages" (D-13)
   - What's unclear: Should this happen in Phase 9 (breaking the form apart) or Phase 10-11 (when actual SEO forms are built)?
   - Recommendation: Keep TrackingSettingsForm intact at `/admin/settings/seo` page in Phase 9. Split into individual SEO sub-sections in Phases 10-11 when those forms are actually built. This avoids losing functionality while respecting the phased approach.

2. **Auth Guard Location**
   - What we know: Every admin page currently has its own auth check (4 lines duplicated)
   - What's unclear: Should `/admin/settings/layout.tsx` centralize the auth check?
   - Recommendation: YES -- add auth check to the settings layout.tsx server component. This eliminates duplication across 18+ pages and ensures no page is accidentally left unprotected. The root `(admin)/layout.tsx` does NOT have auth (it only provides the AdminShell UI), so adding it at the settings level is the right granularity.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies -- this phase is purely code/config changes using existing project dependencies)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Settings landing page renders with 3 category cards | Manual | N/A | N/A |
| NAV-02 | Payment/SMTP/SEO sub-routes accessible and render forms | Manual | N/A | N/A |
| NAV-03 | SEO sub-routes render placeholder pages for all 14 sections | Manual | N/A | N/A |
| NAV-04 | Existing forms migrated without losing save functionality | Manual | N/A | N/A |
| NAV-05 | Secondary sidebar consistent across all settings pages | Manual | N/A | N/A |

### Sampling Rate
- **Per task commit:** Visual verification in dev server
- **Per wave merge:** Full route accessibility check
- **Phase gate:** All 5 NAV requirements verified manually

### Wave 0 Gaps
- No test framework is installed in this project. All validation for Phase 9 is manual visual verification.
- This is acceptable per project convention (no test framework was ever set up for this Next.js app).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `auth.api.getSession()` on every admin page (or settings layout.tsx) |
| V3 Session Management | yes | Better Auth session handling (existing) |
| V4 Access Control | yes | Role check: admin or super_admin only |
| V5 Input Validation | yes | Form-level validation in client components (existing pattern) |
| V6 Cryptography | no | No cryptographic operations in this phase |

### Known Threat Patterns for Settings Navigation

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized access to settings | Spoofing/Tampering | Auth + role check in layout.tsx server component |
| Direct URL access to SEO routes | Information Disclosure | Auth guard in settings layout covers all nested routes |
| CSRF on settings save | Tampering | Server actions with `useTransition` pattern (existing) |

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/app/(admin)/admin/settings/page.tsx` -- current flat settings page structure
- Codebase analysis: `src/components/admin/PaymentSettingsForm.tsx` -- existing form component pattern
- Codebase analysis: `src/components/admin/EmailProviderSettings.tsx` -- existing form component pattern
- Codebase analysis: `src/components/admin/TrackingSettingsForm.tsx` -- existing tracking form
- Codebase analysis: `src/components/dashboard/DashboardShell.tsx` -- layout shell pattern
- Codebase analysis: `src/components/dashboard/AdminShell.tsx` -- admin wrapper pattern
- Codebase analysis: `src/components/dashboard/AppSidebar.tsx` -- sidebar nav with usePathname pattern
- Codebase analysis: `src/data/dashboard-nav.ts` -- adminNavItems array structure
- Codebase analysis: `src/app/(admin)/layout.tsx` -- root admin layout (no auth, only AdminShell)
- Codebase analysis: `src/lib/db/schema.ts` -- settings table (key-value pattern)
- Codebase analysis: `src/styles/dashboard.css` -- all CSS utilities and theme tokens
- Next.js official docs: Nested layouts via `children` prop in `layout.tsx` [CITED: https://nextjs.org/docs/app/getting-started/layouts-and-pages]

### Secondary (MEDIUM confidence)
- Next.js official learn course: Creating nested layouts for dashboard sections [CITED: https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages]

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in package.json
- Architecture: HIGH - patterns derived from existing codebase (AppSidebar, DashboardShell, page.tsx files)
- Pitfalls: HIGH - based on Next.js documented behavior and existing codebase analysis
- Security: HIGH - existing auth pattern proven across all admin pages

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (stable -- Next.js 16 and React 19 are current)
