---
phase: 16-licensing-core
plan: 04
subsystem: portal, admin, ui
tags: [server-actions, portal, admin, activation-history, domain-deactivation, verification-token, idor-protection]

# Dependency graph
requires:
  - phase: 16-licensing-core/16-03
    provides: performDeactivation() shared service, GetActivationHistoryHandler, GetActiveDomainsHandler, VerificationTokenIssuer
  - phase: 16-licensing-core/16-02
    provides: ActivationRepository, LicenseRepository with atomic decrement
  - phase: 16-licensing-core/16-01
    provides: Activation entity with suspiciousFlags field
provides:
  - deactivateDomain portal server action with IDOR protection and performDeactivation() delegation
  - issueVerificationToken portal server action for domain activation flow
  - ActivateDomainForm client component with 3-method verification instructions
  - Extended portal license detail page with per-domain Deactivate button
  - getActivationHistory admin server action with requireAdmin guard
  - getLicenseForAdmin admin server action
  - Admin activation history page at /admin/licenses/[id]/activations with color-coded suspicious flag badges
  - Activations link added to LicensesTable
affects: [17-billing, 18-subscriptions, 19-portal-analytics]

# Tech tracking
tech-stack:
  added: []
patterns:
  - "Portal server actions with requireCustomer() guard blocking admin roles"
  - "Inline server action forms for portal deactivation (form action with use server closure)"
  - "Admin activation history with suspiciousFlags color-coded badges using cn() conditional classes"

key-files:
  created:
    - src/app/(portal)/actions/portal-licenses.ts
    - src/components/portal/ActivateDomainForm.tsx
    - src/app/(admin)/admin/licenses/[id]/activations/page.tsx
  modified:
    - src/app/(portal)/dashboard/licenses/[id]/page.tsx
    - src/app/(admin)/actions/admin-licenses.ts
    - src/components/admin/LicensesTable.tsx

key-decisions:
  - "Used inline form action with 'use server' closure for per-domain deactivation to keep portal page as server component"
  - "ActivateDomainForm is a client component since it needs useState for domain input, token display, and method selection"
  - "Admin actions added to existing admin-licenses.ts file alongside existing revoke/activate/suspend actions"

patterns-established:
  - "Portal server actions use requireCustomer() that blocks admin roles from portal operations"
  - "Deactivation forms use revalidatePath() for immediate UI refresh after server action"
  - "Admin activation history page follows ComponentCard + raw table pattern for dense tabular data"

requirements-completed: [ACT-07, ACT-08]

# Metrics
duration: 4min
completed: 2026-06-02
---

# Phase 16 Plan 04: Portal Domain Management and Admin Activation History Summary

**Portal deactivation buttons per domain with instant performDeactivation() delegation, verification token issuance form with DNS/file/meta instructions, and admin activation history page with color-coded suspicious flag badges**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-02T17:44:34Z
- **Completed:** 2026-06-02T17:48:16Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Portal license detail page now shows "Deactivate" button next to each active domain with instant deactivation (D-29: no admin approval)
- ActivateDomainForm provides complete domain activation flow: domain input, verification method selector (DNS TXT, file upload, meta tag), token issuance, copy-to-clipboard, and method-specific instructions
- Admin activation history page displays chronological table with 6 columns: timestamp, domain, action, IP, verification method, suspicious flags
- Suspicious flags rendered as color-coded badges: orange for burst_ips_24h, red for vpn_tor_exit/plan_limit_breach
- IDOR protection on all portal actions verifies license.userId matches session user

## Task Commits

Each task was committed atomically:

1. **Task 1: Create portal server actions and extend customer portal license detail page** - `b77251f` (feat)
2. **Task 2: Create admin activation history page and extend admin license actions** - `97c18ba` (feat)

## Files Created/Modified
- `src/app/(portal)/actions/portal-licenses.ts` - deactivateDomain and issueVerificationToken server actions with IDOR protection
- `src/components/portal/ActivateDomainForm.tsx` - Client component for domain activation flow with verification method selector and token display
- `src/app/(portal)/dashboard/licenses/[id]/page.tsx` - Extended with Deactivate button per domain, ActivateDomainForm integration, revalidation
- `src/app/(admin)/actions/admin-licenses.ts` - Added getActivationHistory and getLicenseForAdmin server actions with requireAdmin guard
- `src/app/(admin)/admin/licenses/[id]/activations/page.tsx` - Admin activation history page with chronological table and suspicious flag badges
- `src/components/admin/LicensesTable.tsx` - Added Activations link button to each license row

## Decisions Made
- Used inline form action with `"use server"` closure for per-domain deactivation to keep the portal page as a server component rather than converting it to a client component
- ActivateDomainForm is a separate client component because it needs useState for domain input, token display state, verification method selection, and copy-to-clipboard
- Added admin actions (getActivationHistory, getLicenseForAdmin) to the existing admin-licenses.ts file alongside existing revoke/activate/suspend actions for logical grouping
- Used revalidatePath() after deactivation to refresh the server component page data immediately

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in src/app/(admin)/actions/analytics-dashboard.ts (59 errors) remain out of scope

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Portal domain management UI complete for Phase 17 (checkout integration)
- Admin activation history page ready for Phase 19 (analytics enhancements with geo-IP enrichment)
- performDeactivation() shared service proven in both API route (Plan 03) and portal action (Plan 04) paths

---
*Phase: 16-licensing-core*
*Completed: 2026-06-02*

## Self-Check: PASSED

All 6 files verified present. Both task commits (b77251f, 97c18ba) verified in git log. TypeScript compiles without errors in all portal, admin, and component modules (pre-existing analytics-dashboard.ts errors remain out of scope).
