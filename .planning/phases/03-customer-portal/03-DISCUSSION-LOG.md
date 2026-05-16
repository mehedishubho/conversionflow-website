# Phase 3: Customer Portal - Discussion Log

**Date:** 2026-05-16
**Areas Discussed:** 8 (2 rounds)
**Decisions Made:** 22

## Round 1: Core Portal Pages

### Area 1: Data Flow Strategy
**Q:** Real DB queries or mock data?
**A:** Real DB queries — server components with Drizzle, show empty states when no data
**Options Presented:** Real DB queries (Recommended) | Mock/placeholder data

### Area 2: Dashboard Overview Design
**Q1:** Dashboard overview layout?
**A:** Cards + Table (metric cards at top, recent activity table below)
**Options:** Cards + Table (Recommended) | Full table view | Widget grid

**Q2:** Metric card style?
**A:** Metric cards with icons (EcommerceMetrics-style from backenddashboard)
**Options:** Metric cards with icons (Recommended) | Stat counters only | Chart widgets

**Q3:** Empty state behavior?
**A:** Show zeros + welcome message for new users
**Options:** Show zeros + welcome (Recommended) | Empty state illustration | Redirect to onboarding

### Area 3: License Management UX
**Q1:** License list presentation?
**A:** Table with row actions (view details, copy key)
**Options:** Table with row actions (Recommended) | Card grid | List with expand

**Q2:** License key display?
**A:** Masked with copy button (partial key visible, click to copy full)
**Options:** Masked + copy button (Recommended) | Full key always visible | Hidden until click

**Q3:** License detail view?
**A:** Slide-in panel or modal
**Options:** Slide-in panel/modal (Recommended) | Full detail page | Expandable row

**Q4:** Activation domain display?
**A:** Domain list + current/max activation count
**Options:** Domain list + count (Recommended) | Status indicators only | Domain cards

### Area 4: Page Layout Approach
**Q1:** Component strategy?
**A:** Port TailAdmin components (EcommerceMetrics, ComponentCard, PageBreadCrumb, Table, Badge, Modal)
**Options:** Port TailAdmin components (Recommended) | Build from scratch | Use third-party UI lib

**Q2:** Navigation breadcrumbs?
**A:** Breadcrumbs with TailAdmin PageBreadCrumb pattern
**Options:** TailAdmin pattern (Recommended) | Simple text path | No breadcrumbs

**Q3:** Billing/invoice layout?
**A:** Invoice table with status badges
**Options:** Invoice table + badges (Recommended) | Card-based invoice list | Accordion sections

## Round 2: Secondary Portal Pages

### Area 5: Support Tickets UX
**Q1:** Ticket list presentation?
**A:** Table with status badges (open/in_progress/resolved/closed) and priority
**Options:** Table with badges (Recommended) | Kanban board | Card list

**Q2:** Ticket conversation view?
**A:** Chat-style thread layout (messages in conversation bubbles)
**Options:** Chat-style thread (Recommended) | Flat comment list | Email-thread style

**Q3:** Create ticket flow?
**A:** Modal form (subject, priority, description, file attachment)
**Options:** Modal form (Recommended) | Separate create page | Inline expand form

**Q4:** File attachment handling?
**A:** File upload with server filesystem storage, metadata in JSONB
**Options:** Server storage (Recommended) | Third-party storage | Database blob storage

### Area 6: Downloads Page Design
**Q1:** Downloads layout?
**A:** Featured latest version card + version history table below
**Options:** Featured latest + history (Recommended) | Grid of all versions | Single download button

**Q2:** Changelog display?
**A:** Expandable changelog per version entry (click to expand/collapse)
**Options:** Expandable changelog (Recommended) | Full changelog below | Modal changelog

### Area 7: Notifications Behavior
**Q1:** Notification display?
**A:** Dropdown with real data from notifications table
**Options:** Dropdown with real data (Recommended) | Separate notifications page | Both dropdown + page

**Q2:** Notification types to support?
**A:** All 4 types: license events, billing events, support events, system events
**Options:** All 4 types selected (license, billing, support, system)

**Q3:** Read/unread behavior?
**A:** Click to read + navigate to entity, mark all as read button
**Options:** Click to read + mark all (Recommended) | Mark all only | Separate read/unread tabs

### Area 8: Account Settings Page
**Q1:** Account page layout?
**A:** All sections on one page (Profile, Password, Preferences stacked vertically)
**Options:** Sections on one page (Recommended) | Tab-based sections | Multi-page sections

**Q2:** Editable fields?
**A:** Name + phone + password editable. Email read-only. Notification toggles per type.
**Options:** Name + phone + password (Recommended) | Full profile edit | Minimal (password only)

---

*22 decisions captured. Context file: 03-CONTEXT.md*
