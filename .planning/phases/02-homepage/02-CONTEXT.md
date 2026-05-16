# Phase 2: Dashboard Shell - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Port the dashboard layout shell from `backenddashboard/` — sidebar navigation, header, backdrop, and responsive behavior — into the existing `(portal)/` and `(admin)/` route group layouts. Two separate sidebar navigation configs (customer nav vs admin nav) sharing the same layout components. The shell is ready for feature pages to be dropped in starting Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Behavior & Style
- **D-01:** Full 3-state sidebar port from backenddashboard — expanded (290px), collapsed (90px), mobile hidden with slide-in drawer. Port the expand/collapse toggle, hover flyout, and submenu accordion behavior.
- **D-02:** Sidebar widths match backenddashboard: 290px expanded, 90px collapsed. Responsive breakpoint at 768px for mobile detection (matching SidebarContext).
- **D-03:** Skip the SidebarWidget (promotional "Upgrade to Pro" card). The sidebar ends after nav items. Can add custom content later per dashboard if needed.
- **D-04:** Submenu accordion for nav groups with expandable sub-items — animated height transition matching backenddashboard pattern.
- **D-05:** Hover flyout when collapsed on desktop — hovering the 90px collapsed sidebar expands it to full width temporarily.

### Header Layout & Features
- **D-06:** Core header features: hamburger toggle, mobile logo link, theme toggle (sun/moon), notification bell, and user dropdown. Skip the search bar (Cmd+K) — no content to search yet in Phase 2.
- **D-07:** User dropdown shows avatar + name + role badge. Dropdown options: Profile, Settings, Sign Out. All functional links.
- **D-08:** Notification bell is present in the header shell but non-functional in Phase 2 — just the icon, no dropdown. Phase 3+ adds notification functionality.

### Shared vs Separate Layout Config
- **D-09:** Shared layout components with separate nav configs. One SidebarContext, one AppSidebar, one AppHeader, one Backdrop — parameterized by nav items. Customer portal and admin dashboard pass different nav data to the same components.
- **D-10:** Customer portal nav items: Dashboard, Licenses, Billing, Downloads, Support, Account (6 items, no submenus needed in Phase 2).
- **D-11:** Admin dashboard nav items: Overview, Sales, Users, Invoices, Licenses, Settings (6 items, no submenus needed in Phase 2).

### Icon Approach
- **D-12:** Use lucide-react icons throughout the dashboard. Do NOT port the 55 SVG files from backenddashboard. Map each nav item and UI element to the closest lucide-react icon (e.g., LayoutDashboard, Key, CreditCard, Download, MessageSquare, User, Settings, BarChart, Users, FileText, Shield, Bell, Sun, Moon, Menu, X, LogOut, ChevronDown, ChevronLeft).

### Claude's Discretion
- Exact sidebar nav item icons (pick best lucide match)
- SidebarContext API shape and provider placement
- Submenu accordion animation implementation details
- Header notification bell placeholder behavior
- User avatar display (initials circle vs image)
- Mobile responsive breakpoints beyond the 768px sidebar threshold
- CSS class naming conventions for dashboard shell components
- How nav items link to routes (direct Link vs config-driven)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard Template (Port Source)
- `backenddashboard/src/context/SidebarContext.tsx` — Sidebar state management (expand/collapse, mobile, hover, submenu)
- `backenddashboard/src/layout/AppSidebar.tsx` — Sidebar component (290px/90px, slide-in, submenu accordion)
- `backenddashboard/src/layout/AppHeader.tsx` — Header component (toggle, search, theme, notifications, user dropdown)
- `backenddashboard/src/layout/Backdrop.tsx` — Mobile backdrop overlay
- `backenddashboard/src/app/(admin)/layout.tsx` — Admin layout composition pattern (Sidebar + Backdrop + Header + content)
- `backenddashboard/src/app/layout.tsx` — Root layout (provider wrapping pattern)

### Existing Source Files
- `src/app/(portal)/layout.tsx` — Current portal layout stub (fonts, ThemeProvider, dashboard.css import)
- `src/app/(admin)/layout.tsx` — Current admin layout stub (fonts, ThemeProvider, dashboard.css import)
- `src/styles/dashboard.css` — Dashboard design tokens and utility classes
- `src/components/layout/ThemeProvider.tsx` — Shared next-themes wrapper
- `src/lib/auth-client.ts` — Auth client (signOut needed for header logout)
- `src/components/auth/LogoutButton.tsx` — Existing logout component pattern reference

### Requirements & Planning
- `.planning/ROADMAP.md` — Phase 2 goal, requirement DASH-01, success criteria
- `.planning/REQUIREMENTS.md` — DASH-01 acceptance criteria
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions (carried forward)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ThemeProvider** (`src/components/layout/ThemeProvider.tsx`): Already working across both layouts — no theme work needed
- **dashboard.css** (`src/styles/dashboard.css`): Full light/dark design tokens, utility classes (`.glass`, `.btn`, `.btn-primary`, `.btn-outline`)
- **LogoutButton** (`src/components/auth/LogoutButton.tsx`): Pattern for sign-out — header user dropdown can reuse `signOut` from auth-client
- **cn() utility** (`src/lib/utils.ts`): clsx + tailwind-merge for conditional classes

### Established Patterns
- Server components by default, `"use client"` only when needed
- TailwindCSS v4 CSS-first config — tokens via `@theme inline` block
- Route groups for layout isolation — `(portal)/` and `(admin)/` already exist with stub layouts
- lucide-react for icons (already installed, used in marketing site Navbar)

### Integration Points
- `(portal)/layout.tsx` — Replace stub with full sidebar shell, pass customer nav config
- `(admin)/layout.tsx` — Replace stub with full sidebar shell, pass admin nav config
- `auth-client.ts` — Header user dropdown needs session info (useSession) and signOut
- Dashboard pages (`/dashboard`, `/admin/dashboard`) — Must render inside the new shell

</code_context>

<specifics>
## Specific Ideas

- Logo area in sidebar shows "ConversionFlow" text when expanded, just the icon/initial when collapsed
- Section headers in sidebar ("Menu", "Others") collapse to horizontal dots icon when sidebar is collapsed — same as backenddashboard
- Admin sidebar could have a distinct accent or badge to visually differentiate from customer portal
- Mobile hamburger button behavior: >= 1024px toggles expand/collapse, < 1024px toggles mobile drawer — same breakpoint split as backenddashboard

</specifics>

<deferred>
## Deferred Ideas

- Search bar with Cmd+K shortcut — deferred to when content/pages exist to search through
- SidebarWidget / promotional card — deferred, may add custom widget content per dashboard later
- Notification dropdown content — bell icon is present but non-functional until Phase 3
- Submenu items within nav groups — both customer and admin navs are flat (no submenus) in Phase 2. Can add submenus when feature pages are built.

</deferred>

---

*Phase: 02-homepage*
*Context gathered: 2026-05-16*
