# Phase 2: Dashboard Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 02-Dashboard Shell
**Areas discussed:** Sidebar behavior & style, Header layout & features, Shared vs separate layout config, Icon approach

---

## Sidebar Behavior & Style

| Option | Description | Selected |
|--------|-------------|----------|
| Full port | 3-state sidebar: expanded (290px), collapsed (90px), mobile drawer with hover flyout and submenu accordion | ✓ |
| Simplified (always-expanded) | Always-expanded sidebar on desktop, mobile drawer only. No collapse/hover/flyout | |
| Minimal (desktop + mobile only) | Only mobile responsive. No collapse/hover behavior | |

**User's choice:** Full port
**Notes:** Closest to backenddashboard reference. Keeps the sophisticated expand/collapse behavior.

### SidebarWidget

| Option | Description | Selected |
|--------|-------------|----------|
| Skip widget | No promotional card. Sidebar ends after nav items | ✓ |
| Keep the widget | Port the "Upgrade to Pro" promotional card | |
| Custom widget content | Port structure but replace with ConversionFlow-specific content | |

**User's choice:** Skip widget
**Notes:** Can add custom content later per dashboard.

### Sidebar Widths

| Option | Description | Selected |
|--------|-------------|----------|
| Same widths (290/90) | Match backenddashboard exactly | ✓ |
| Narrower (260/80) | More content space, less room for nav labels | |

**User's choice:** Same widths
**Notes:** Standard widths work well for the 6 nav items in each sidebar config.

---

## Header Layout & Features

| Option | Description | Selected |
|--------|-------------|----------|
| Core features | Hamburger toggle, mobile logo, theme toggle, notification bell, user dropdown. Skip search bar | ✓ |
| Full port (with search) | Everything including Cmd+K search bar | |
| Minimal (toggle + logo only) | Just hamburger toggle, logo, theme toggle | |

**User's choice:** Core features
**Notes:** Search bar deferred — no content to search yet. Notification bell present but non-functional.

### User Dropdown

| Option | Description | Selected |
|--------|-------------|----------|
| Avatar + name + dropdown | Avatar circle, user name, role badge, dropdown with Profile/Settings/Sign Out | ✓ |
| Avatar only + dropdown | Just avatar circle with initials, dropdown with same options | |

**User's choice:** Avatar + name + dropdown
**Notes:** Shows full user info for better UX.

---

## Shared vs Separate Layout Config

| Option | Description | Selected |
|--------|-------------|----------|
| Shared components, separate nav | One SidebarContext, one AppSidebar, one AppHeader, one Backdrop. Different nav data for customer vs admin | ✓ |
| Fully separate layouts | Customer and admin have completely separate components | |

**User's choice:** Shared components, separate nav
**Notes:** Reduces duplication. Both sidebars share the same behavior, only nav items differ.

---

## Icon Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Lucide-react | Replace backenddashboard SVGs with lucide-react. Already installed, tree-shakeable | ✓ |
| Port SVGs (@svgr/webpack) | Port all 55 SVG files from backenddashboard | |
| Inline SVGs | Use inline SVG directly in components | |

**User's choice:** Lucide-react
**Notes:** Consistent with marketing site. No need for @svgr/webpack build complexity.

---

## Claude's Discretion

- Exact sidebar nav item icon mapping to lucide-react
- SidebarContext API shape and provider placement
- Submenu accordion animation implementation details
- Header notification bell placeholder behavior
- User avatar display (initials circle vs image)
- Mobile responsive breakpoints
- CSS class naming conventions
- How nav items link to routes (direct Link vs config-driven)

## Deferred Ideas

- Search bar with Cmd+K shortcut — deferred until content exists to search
- SidebarWidget / promotional card — deferred, may add custom widget later
- Notification dropdown content — bell icon only until Phase 3
- Submenu items within nav groups — both navs are flat in Phase 2
