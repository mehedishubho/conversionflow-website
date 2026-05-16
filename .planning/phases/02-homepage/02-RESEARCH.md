# Phase 2: Dashboard Shell - Research

**Researched:** 2026-05-16
**Domain:** Next.js App Router layout architecture, React Context patterns, sidebar/header component porting
**Confidence:** HIGH

## Summary

This phase ports the dashboard layout shell from `backenddashboard/` into the existing `(portal)/` and `(admin)/` route group layouts. The backenddashboard provides a complete reference implementation with SidebarContext (expand/collapse/mobile/hover state), AppSidebar (290px/90px responsive), AppHeader (toggle, search, theme, notifications, user dropdown), and Backdrop (mobile overlay). The project already has `SidebarContext.tsx` ported to `src/context/`, `dashboard.css` with design tokens, working `next-themes`, `cn()` utility, and lucide-react installed. The key challenge is adapting the single-layout backenddashboard into a shared-component architecture with two different nav configs (customer portal vs admin), while cleaning up the dual theme system and replacing SVG icons with lucide-react.

**Primary recommendation:** Create a shared `DashboardShell` client component that accepts a `navItems` config prop and wraps SidebarProvider + AppSidebar + AppHeader + Backdrop. Each route group layout passes its specific nav config. The SidebarContext already exists in the project and is structurally identical to the backenddashboard version -- reuse it directly. Delete the old custom `ThemeContext` and migrate `ThemeToggleButton` to `next-themes`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Full 3-state sidebar port from backenddashboard -- expanded (290px), collapsed (90px), mobile hidden with slide-in drawer. Port the expand/collapse toggle, hover flyout, and submenu accordion behavior.
- **D-02:** Sidebar widths match backenddashboard: 290px expanded, 90px collapsed. Responsive breakpoint at 768px for mobile detection.
- **D-03:** Skip the SidebarWidget (promotional "Upgrade to Pro" card). Sidebar ends after nav items.
- **D-04:** Submenu accordion for nav groups with expandable sub-items -- animated height transition matching backenddashboard.
- **D-05:** Hover flyout when collapsed on desktop -- hovering the 90px collapsed sidebar expands to full width temporarily.
- **D-06:** Core header features: hamburger toggle, mobile logo link, theme toggle (sun/moon), notification bell, user dropdown. Skip search bar (Cmd+K).
- **D-07:** User dropdown shows avatar + name + role badge. Dropdown options: Profile, Settings, Sign Out. All functional links.
- **D-08:** Notification bell present but non-functional in Phase 2 -- just the icon, no dropdown.
- **D-09:** Shared layout components with separate nav configs. One SidebarContext, one AppSidebar, one AppHeader, one Backdrop -- parameterized by nav items.
- **D-10:** Customer portal nav items: Dashboard, Licenses, Billing, Downloads, Support, Account (6 items, no submenus in Phase 2).
- **D-11:** Admin dashboard nav items: Overview, Sales, Users, Invoices, Licenses, Settings (6 items, no submenus in Phase 2).
- **D-12:** Use lucide-react icons throughout. Do NOT port the 55 SVG files from backenddashboard.

### Claude's Discretion
- Exact sidebar nav item icons (pick best lucide match)
- SidebarContext API shape and provider placement
- Submenu accordion animation implementation details
- Header notification bell placeholder behavior
- User avatar display (initials circle vs image)
- Mobile responsive breakpoints beyond the 768px sidebar threshold
- CSS class naming conventions for dashboard shell components
- How nav items link to routes (direct Link vs config-driven)

### Deferred Ideas (OUT OF SCOPE)
- Search bar with Cmd+K shortcut -- deferred to when content/pages exist
- SidebarWidget / promotional card -- deferred
- Notification dropdown content -- bell icon present but non-functional until Phase 3
- Submenu items within nav groups -- both navs are flat (no submenus) in Phase 2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Port dashboard layout from backenddashboard/ (AppSidebar, AppHeader, Backdrop, SidebarContext) | Full source code analysis of all 4 backenddashboard components + SidebarContext pattern documented in Architecture Patterns section |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lucide-react | 1.14.0 (installed) | All dashboard icons | Already installed, used in marketing site Navbar, user decision D-12 [VERIFIED: pnpm list] |
| next-themes | 0.4.6 (installed) | Theme switching in dashboard header | Unified theme system per DASH-03, already wrapping both layouts [VERIFIED: src/app/(portal)/layout.tsx] |
| framer-motion | 12.38.0 (installed) | Sidebar submenu animations, transitions | Already installed for marketing site [VERIFIED: package.json] |
| clsx | 2.1.1 (installed) | Conditional class merging | Part of cn() utility [VERIFIED: package.json] |
| tailwind-merge | 3.6.0 (installed) | Tailwind class dedup | Part of cn() utility [VERIFIED: package.json] |
| better-auth (client) | 1.6.11 (installed) | useSession for user dropdown, signOut for logout | Already configured in auth-client.ts [VERIFIED: src/lib/auth-client.ts] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next | 16.2.6 (installed) | App Router layouts, route groups | Core framework [VERIFIED: package.json] |
| react | 19.2.4 (installed) | Component rendering | Core framework [VERIFIED: package.json] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom theme toggle | next-themes useTheme | next-themes is already integrated and required per DASH-03 -- no alternative |
| Ported SVG icons | lucide-react | lucide-react is locked by D-12 -- smaller bundle, tree-shakeable |

**Installation:**
No new packages needed -- all dependencies already installed.

**Version verification:**
```
lucide-react: 1.14.0 installed (latest: 1.16.0) [VERIFIED: pnpm list]
next-themes: 0.4.6 installed [VERIFIED: package.json]
better-auth: 1.6.11 installed [VERIFIED: package.json]
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    dashboard/
      DashboardShell.tsx     # Shared layout wrapper (client component)
      AppSidebar.tsx         # Sidebar with nav config prop
      AppHeader.tsx          # Header with theme toggle, user dropdown
      Backdrop.tsx           # Mobile overlay
      UserDropdown.tsx       # Header user dropdown (uses useSession)
  context/
    SidebarContext.tsx        # Already exists -- reuse as-is
  data/
    dashboard-nav.ts         # Nav item configs (customer + admin)
  app/
    (portal)/
      layout.tsx             # Server layout -> renders DashboardShell with customer nav
    (admin)/
      layout.tsx             # Server layout -> renders DashboardShell with admin nav
```

### Pattern 1: DashboardShell Wrapper Component
**What:** A single client component that composes SidebarProvider + AppSidebar + AppHeader + Backdrop + children, accepting nav config as a prop.
**When to use:** Both (portal)/ and (admin)/ route group layouts.
**Why:** The backenddashboard's (admin)/layout.tsx is already a client component that composes these pieces. By extracting the composition into a shared component with a nav config prop, both layouts can use it without duplicating provider/sidebar/header wiring.

```typescript
// src/components/dashboard/DashboardShell.tsx
"use client";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";
import type { NavItem } from "@/data/dashboard-nav";

export function DashboardShell({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
}) {
  return (
    <SidebarProvider>
      <DashboardLayout navItems={navItems}>{children}</DashboardLayout>
    </SidebarProvider>
  );
}

function DashboardLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar navItems={navItems} />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```
**Source:** Pattern derived from `backenddashboard/src/app/(admin)/layout.tsx` lines 9-39 [VERIFIED: code read]

### Pattern 2: Nav Config Data File
**What:** TypeScript data file with typed nav items and icon references.
**When to use:** Define nav items for customer portal and admin dashboard.

```typescript
// src/data/dashboard-nav.ts
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Key, CreditCard, Download,
  MessageSquare, UserCog, BarChart3, Users,
  FileText, Settings,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon: LucideIcon;
  path: string;
  subItems?: { name: string; path: string }[];
};

export const customerNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Licenses", icon: Key, path: "/dashboard/licenses" },
  { name: "Billing", icon: CreditCard, path: "/dashboard/billing" },
  { name: "Downloads", icon: Download, path: "/dashboard/downloads" },
  { name: "Support", icon: MessageSquare, path: "/dashboard/support" },
  { name: "Account", icon: UserCog, path: "/dashboard/account" },
];

export const adminNavItems: NavItem[] = [
  { name: "Overview", icon: BarChart3, path: "/admin/dashboard" },
  { name: "Sales", icon: CreditCard, path: "/admin/sales" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Invoices", icon: FileText, path: "/admin/invoices" },
  { name: "Licenses", icon: Key, path: "/admin/licenses" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];
```
**Source:** Pattern adapted from `backenddashboard/src/layout/AppSidebar.tsx` NavItem type [VERIFIED: code read]

### Pattern 3: Route Group Layout Integration
**What:** Server component layouts for (portal)/ and (admin)/ that import DashboardShell.
**When to use:** Each route group layout wraps children with the dashboard shell.

```typescript
// src/app/(portal)/layout.tsx (server component)
import { DM_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { customerNavItems } from "@/data/dashboard-nav";
import "@/styles/dashboard.css";

// ... font declarations ...

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <DashboardShell navItems={customerNavItems}>
            {children}
          </DashboardShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
```
**Source:** Existing layout pattern at `src/app/(portal)/layout.tsx` + backenddashboard composition pattern [VERIFIED: code read]

### Pattern 4: Better Auth useSession in Client Components
**What:** Use `useSession` from auth-client.ts for user dropdown data.
**When to use:** AppHeader's user dropdown needs current user name, email, avatar.

```typescript
// In UserDropdown.tsx (client component)
"use client";
import { useSession, signOut } from "@/lib/auth-client";

export function UserDropdown() {
  const { data: session } = useSession();
  // session?.user?.name, session?.user?.email, session?.user?.image
  // ...
}
```
**Source:** `src/lib/auth-client.ts` exports useSession; Better Auth docs confirm `useSession` returns `{ data: { user, session } }` [VERIFIED: better-auth.com/docs/concepts/session-management]

### Anti-Patterns to Avoid
- **Rendering SidebarContext consumer outside provider:** The AppHeader and Backdrop both call `useSidebar()`. They MUST render inside `<SidebarProvider>`. The DashboardShell pattern ensures this by wrapping everything in the provider.
- **Using old ThemeContext:** The existing `ThemeToggleButton.tsx` imports from `@/context/ThemeContext` (custom context). This MUST be replaced with `next-themes` useTheme. Delete `src/context/ThemeContext.tsx` and update `ThemeToggleButton` and `ThemeTogglerTwo`.
- **Duplicating layout wiring:** Do NOT copy the sidebar/header/backdrop composition into both (portal)/layout.tsx and (admin)/layout.tsx. Use the shared DashboardShell component.
- **Porting SVG icons:** Do NOT copy the 55 SVG files from backenddashboard/src/icons/. Use lucide-react exclusively per D-12.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sidebar state management | Custom expand/collapse/mobile state | SidebarContext (already in src/context/) | Already ported, works identically to backenddashboard |
| Theme toggling | Custom ThemeContext with localStorage | next-themes useTheme | Unified system, SSR-safe, prevents flash |
| Click-outside detection for dropdowns | Custom event listener | Existing Dropdown component (src/components/ui/dropdown/Dropdown.tsx) | Already ported from backenddashboard, handles outside clicks |
| Class name merging | String concatenation | cn() from @/lib/utils | Already available, handles Tailwind dedup |

**Key insight:** The project already has most supporting infrastructure in place -- SidebarContext, Dropdown, cn(), ThemeProvider (next-themes), dashboard.css tokens. The work is primarily assembling these into the dashboard shell pattern from backenddashboard, not building from scratch.

## Common Pitfalls

### Pitfall 1: Dual Theme System Conflict
**What goes wrong:** The project has TWO theme systems -- custom `ThemeContext` (src/context/ThemeContext.tsx) used by ThemeToggleButton/ThemeTogglerTwo, and `next-themes` used by Navbar. If the dashboard header uses the old ThemeContext, it will conflict with the next-themes ThemeProvider in the layout.
**Why it happens:** The backenddashboard template had its own ThemeContext that was ported to src/context/ before the DASH-03 decision to unify on next-themes.
**How to avoid:** Delete `src/context/ThemeContext.tsx`. Rewrite `ThemeToggleButton.tsx` to use `useTheme` from `next-themes`. Update `ThemeTogglerTwo.tsx` similarly. This is a prerequisite before the header will work.
**Warning signs:** Theme toggle in dashboard doesn't sync with theme state; console errors about missing ThemeProvider.

### Pitfall 2: Layout Nesting Creates Duplicate html/body
**What goes wrong:** Both (portal)/layout.tsx and (admin)/layout.tsx currently render `<html>` and `<body>` tags. If the root layout also renders these, Next.js 16 will error. Currently these route group layouts ARE the root layouts for their respective route groups (no parent layout shares them), so they each need their own html/body. This is correct -- no conflict.
**Why it happens:** In Next.js App Router, route groups with their own layout.tsx that has `<html>` become separate layout trees. This is the intended behavior for dashboard isolation from the marketing site.
**How to avoid:** Keep the html/body in both route group layouts. Do NOT add html/body to DashboardShell (it's a child component, not a layout).
**Warning signs:** Hydration errors about mismatched html tags.

### Pitfall 3: Client Component Boundary at Layout Level
**What goes wrong:** The layout.tsx files in (portal)/ and (admin)/ are currently server components (no "use client"). Adding DashboardShell (a client component) as a child is fine -- server components can render client components. But if we make the layout itself a client component, we lose metadata export and server-side rendering benefits.
**Why it happens:** The backenddashboard's (admin)/layout.tsx is a client component because it directly uses useSidebar(). In our design, we extract the client logic into DashboardShell, keeping the layout as a server component.
**How to avoid:** Keep layout.tsx as server components. Move all client logic (useSidebar, state) into DashboardShell.tsx (marked "use client").
**Warning signs:** `metadata` export causes error when layout has "use client" directive.

### Pitfall 4: useSession May Return null Initially
**What goes wrong:** The user dropdown renders before the session data is fetched from the server. If the component doesn't handle the loading state, it crashes trying to read `session.user.name`.
**Why it happens:** Better Auth's useSession is reactive -- it fetches on mount. There's a brief period where `data` is null.
**How to avoid:** Use optional chaining (`session?.user?.name`) and provide a loading/fallback state in UserDropdown (e.g., show "Loading..." or a skeleton).
**Warning signs:** TypeError: Cannot read properties of null (reading 'user').

### Pitfall 5: Sidebar z-index Layering
**What goes wrong:** The sidebar, backdrop, and header need correct z-index stacking. Sidebar at z-50, backdrop at z-40, header at z-99999 (matching backenddashboard pattern). If these conflict, mobile sidebar slides under the header or backdrop appears over the sidebar.
**Why it happens:** The backenddashboard uses specific z-index values: sidebar z-50, header z-99999, backdrop z-40. These must be preserved.
**How to avoid:** Copy the exact z-index values from backenddashboard components. Use Tailwind z-50, z-40, and z-[99999] classes.
**Warning signs:** Mobile sidebar hidden behind header; clicking backdrop doesn't work.

### Pitfall 6: Mobile Breakpoint Split (768px vs 1024px)
**What goes wrong:** The SidebarContext uses 768px for mobile detection (line 39: `window.innerWidth < 768`), but the header toggle uses 1024px to decide expand/collapse vs mobile drawer (line 16: `window.innerWidth >= 1024`). This means between 768-1023px, the sidebar is hidden but the toggle does expand/collapse instead of mobile drawer.
**Why it happens:** The backenddashboard has this exact same split -- 768px in context, 1024px in header. The 768px breakpoint controls the sidebar width state; the 1024px breakpoint controls the toggle behavior. Between 768-1023px, the sidebar is collapsed (90px) and the toggle expands/collapses it.
**How to avoid:** Preserve both breakpoints exactly as in backenddashboard. The 768px in SidebarContext forces isExpanded to false on tablets. The 1024px in header makes tablets use expand/collapse, not mobile drawer.
**Warning signs:** Tablet behavior seems inconsistent -- sidebar appears collapsed but toggle doesn't open mobile drawer.

## Code Examples

### AppSidebar Structure (adapted from backenddashboard)
```typescript
// Source: backenddashboard/src/layout/AppSidebar.tsx (adapted)
// Key pattern: conditional rendering based on isExpanded || isHovered || isMobileOpen

"use client";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { NavItem } from "@/data/dashboard-nav";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar({ navItems }: { navItems: NavItem[] }) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={cn(
        "fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-surface border-r border-border text-foreground h-screen transition-all duration-300 ease-in-out z-50",
        showText ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo area */}
      <div className={cn("py-8 flex", !showText ? "lg:justify-center" : "justify-start")}>
        <Link href="/">
          {showText ? (
            <span className="font-syne font-800 text-lg">ConversionFlow</span>
          ) : (
            <span className="font-syne font-800 text-xl">CF</span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={cn(
                "mb-4 text-xs uppercase flex leading-[20px] text-muted",
                !showText ? "lg:justify-center" : "justify-start"
              )}>
                {showText ? "Menu" : <MoreHorizontal className="w-5 h-5" />}
              </h2>
              <ul className="flex flex-col gap-4">
                {navItems.map((nav) => (
                  <li key={nav.name}>
                    <Link
                      href={nav.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        pathname === nav.path
                          ? "bg-accent-light text-accent"
                          : "text-text2 hover:bg-accent-light hover:text-foreground"
                      )}
                    >
                      <nav.icon className="w-5 h-5 flex-shrink-0" />
                      {showText && <span className="text-sm font-medium">{nav.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
```
**Source:** Adapted from `backenddashboard/src/layout/AppSidebar.tsx` [VERIFIED: code read]

### Backdrop Component (direct port)
```typescript
// Source: backenddashboard/src/layout/Backdrop.tsx (identical pattern)
"use client";
import { useSidebar } from "@/context/SidebarContext";

export function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
}
```
**Source:** Direct port from `backenddashboard/src/layout/Backdrop.tsx` [VERIFIED: code read]

### ThemeToggleButton Updated for next-themes
```typescript
// Source: Pattern from src/components/layout/Navbar.tsx (already using next-themes)
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center text-text2 bg-surface border border-border rounded-full h-11 w-11 hover:bg-accent-light transition-colors"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```
**Source:** Pattern matches `src/components/layout/Navbar.tsx` lines 91-97 [VERIFIED: code read]

### Header Toggle Breakpoint Logic
```typescript
// Source: backenddashboard/src/layout/AppHeader.tsx lines 15-20
const handleToggle = () => {
  if (window.innerWidth >= 1024) {
    toggleSidebar();      // Desktop: expand/collapse
  } else {
    toggleMobileSidebar(); // Mobile/tablet: slide-in drawer
  }
};
```
**Source:** Exact pattern from `backenddashboard/src/layout/AppHeader.tsx` [VERIFIED: code read]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom ThemeContext (localStorage) | next-themes (class-based) | Phase 1 (DASH-03) | Unified theme across marketing + dashboard |
| 55 SVG icon files | lucide-react tree-shakeable imports | Phase 2 (D-12) | Smaller bundle, consistent icon style |
| Single layout with hardcoded nav | Shared shell with nav config prop | Phase 2 | One component set serves both portal and admin |

**Deprecated/outdated:**
- `src/context/ThemeContext.tsx`: Must be deleted. Superseded by next-themes. Still imported by ThemeToggleButton.tsx and ThemeTogglerTwo.tsx -- both need updating.
- `backenddashboard/src/icons/`: 55 SVG files -- do NOT port. Use lucide-react.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Better Auth `useSession` returns `{ data: { user: { name, email, image }, session } }` in client components | Pattern 4 | User dropdown shows no data -- would need to check auth client configuration |
| A2 | The custom `role` field on user is accessible via `session.user.role` (added via Better Auth additionalFields) | Pattern 4 | Role badge in user dropdown won't display |
| A3 | The `src/context/SidebarContext.tsx` is identical to the backenddashboard version and ready for reuse | Architecture | Would need adjustments to context API |
| A4 | No other components besides ThemeToggleButton and ThemeTogglerTwo import from the old ThemeContext | Pitfall 1 | Other components would break after deletion |

## Open Questions

1. **Should ThemeTogglerTwo.tsx also be updated?**
   - What we know: It imports from old ThemeContext. It exists at `src/components/common/ThemeTogglerTwo.tsx`.
   - What's unclear: Whether any dashboard components use it or if it's only used in backenddashboard example pages.
   - Recommendation: Grep for imports of ThemeTogglerTwo. If only used in backenddashboard example components, update it alongside ThemeToggleButton but it won't be actively used in Phase 2.

2. **User avatar -- initials circle or image?**
   - What we know: Better Auth users have an `image` field. The backenddashboard UserDropdown uses an Image component with a hardcoded photo.
   - What's unclear: Whether real users will have profile images set up.
   - Recommendation: Use initials circle as fallback (from user.name), show image if available. This is at Claude's discretion per CONTEXT.md.

## Environment Availability

Step 2.6: SKIPPED (no new external dependencies -- all packages already installed, no services to check)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Dashboard layout renders sidebar + header + backdrop | Manual | Visual verification | N/A |
| DASH-01 | Sidebar expands/collapses with toggle | Manual | Click toggle, verify 290px/90px widths | N/A |
| DASH-01 | Mobile sidebar slides in/out | Manual | Resize to <768px, toggle hamburger | N/A |
| DASH-01 | Hover flyout on collapsed sidebar | Manual | Collapse sidebar, hover, verify flyout | N/A |
| DASH-01 | Theme toggle switches dark/light | Manual | Click sun/moon in header | N/A |
| DASH-01 | User dropdown shows session data | Manual | Login, verify avatar/name in dropdown | N/A |
| DASH-01 | Customer nav items render correctly | Manual | Navigate to /dashboard, verify 6 items | N/A |
| DASH-01 | Admin nav items render correctly | Manual | Navigate to /admin/dashboard, verify 6 items | N/A |

### Sampling Rate
- **Per task commit:** Visual verification (no test framework)
- **Per wave merge:** Manual full check
- **Phase gate:** `pnpm build` succeeds without errors

### Wave 0 Gaps
- [ ] Test framework installation -- not in scope for Phase 2 (manual verification only)
- No automated tests exist for any previous phases -- consistent with project pattern

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session check (already enforced by page-level server components) |
| V3 Session Management | yes | Better Auth cookie-based sessions, signOut for logout |
| V4 Access Control | yes | Route groups enforce role-based access (portal vs admin) at page level |
| V5 Input Validation | no | No user input in this phase |
| V6 Cryptography | no | No cryptographic operations in this phase |

### Known Threat Patterns for Dashboard Shell

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Session hijack via XSS in user dropdown | Tampering | React auto-escapes JSX; no dangerouslySetInnerHTML |
| CSRF on signOut | Tampering | Better Auth handles CSRF protection natively |
| Nav item path injection | Tampering | Nav items defined in data file, not user-configurable |

## Sources

### Primary (HIGH confidence)
- `backenddashboard/src/context/SidebarContext.tsx` -- full code read, state management pattern
- `backenddashboard/src/layout/AppSidebar.tsx` -- full code read, sidebar component structure
- `backenddashboard/src/layout/AppHeader.tsx` -- full code read, header component structure
- `backenddashboard/src/layout/Backdrop.tsx` -- full code read, mobile overlay pattern
- `backenddashboard/src/app/(admin)/layout.tsx` -- full code read, layout composition pattern
- `src/context/SidebarContext.tsx` -- full code read, already ported and identical to backenddashboard
- `src/context/ThemeContext.tsx` -- full code read, needs deletion
- `src/styles/dashboard.css` -- full code read, design tokens
- `src/lib/auth-client.ts` -- full code read, useSession/signOut exports
- `src/components/auth/LogoutButton.tsx` -- full code read, signOut pattern reference
- `src/app/(portal)/layout.tsx` -- full code read, current stub
- `src/app/(admin)/layout.tsx` -- full code read, current stub
- `src/components/ui/dropdown/Dropdown.tsx` -- full code read, dropdown component
- `src/components/ui/dropdown/DropdownItem.tsx` -- full code read, dropdown item component
- `src/components/common/ThemeToggleButton.tsx` -- full code read, uses OLD ThemeContext
- `package.json` -- verified all dependency versions

### Secondary (MEDIUM confidence)
- [better-auth.com/docs/concepts/session-management] -- useSession API pattern confirmed

### Tertiary (LOW confidence)
- None -- all findings verified from code or docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified
- Architecture: HIGH -- pattern derived directly from existing backenddashboard code + existing project structure
- Pitfalls: HIGH -- discovered dual theme system issue from code analysis, breakpoint split from code analysis

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stable patterns, no fast-moving dependencies)
