---
status: diagnosed
trigger: "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'. {header: ..., accessor: function accessor}"
created: 2026-05-18T00:00:00Z
updated: 2026-05-18T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED - accessor functions in csvColumns are passed from server component to CSVExportButton (client component)
test: Traced full data flow from page.tsx -> CSVExportButton props -> CSVColumn type
expecting: Functions cross server/client boundary
next_action: Report diagnosis

## Symptoms

expected: Admin licenses and activity pages render without errors
actual: "Functions cannot be passed directly to Client Components" error on /admin/licenses and /admin/activity
errors: "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'. {header: ..., accessor: function accessor}"
reproduction: Navigate to /admin/licenses or /admin/activity pages
started: Phase 05 implementation

## Eliminated

## Evidence

- timestamp: 2026-05-18T00:01:00
  checked: src/app/(admin)/admin/licenses/page.tsx - Server component (no "use client")
  found: Lines 21-28 define csvColumns with arrow function accessors. Line 65-69 passes csvColumns as prop to CSVExportButton (client component).
  implication: Accessor functions are defined in a server component and passed as props to a client component - React cannot serialize functions across this boundary.

- timestamp: 2026-05-18T00:01:00
  checked: src/app/(admin)/admin/activity/page.tsx
  found: Page passes data to ActivityFeedFull client component. ActivityFeedFull itself (line 1: "use client") has csvColumns defined INSIDE it (lines 30-37) with accessor functions.
  implication: ActivityFeedFull is already a client component so its internal csvColumns should NOT cause the error. The error on this page may come from a different path, or the error report includes both pages but only licenses has the actual server->client boundary issue.

- timestamp: 2026-05-18T00:01:00
  checked: src/components/admin/CSVExportButton.tsx - Line 1: "use client" - this is a client component
  found: Accepts columns: CSVColumn[] as prop. CSVColumn type (from csv-export.ts line 1-4) defines accessor as (row: Record<string, unknown>) => string - a function type.
  implication: Any server component passing csvColumns with function accessors to this component will trigger the serialization error.

- timestamp: 2026-05-18T00:01:00
  checked: src/components/admin/ActivityFeedFull.tsx - Line 1: "use client"
  found: Lines 30-37 define csvColumns WITHIN the client component itself. Lines 113-117 pass them to CSVExportButton. Since both ActivityFeedFull and CSVExportButton are client components, the accessor functions stay client-side only.
  implication: The activity page csvColumns should NOT cause this error since both sides are client components. Need to verify if there is another accessor function crossing the boundary on this page.

## Resolution

root_cause: Two distinct issues:
1. **admin/licenses (DEFINITE BUG)**: csvColumns array (lines 21-28) contains arrow function accessors and is defined in the server component page.tsx, then passed as a prop to CSVExportButton (a "use client" component). React cannot serialize functions from server to client components.
2. **admin/activity (NEEDS VERIFICATION)**: csvColumns are defined inside ActivityFeedFull (already a "use client" component), so they should not trigger this error. The error on this page may be caused by something else, or the report may be conflating the two pages.

fix: For admin/licenses: Move csvColumns definition into a separate client-side module, or move it inline into a wrapper client component, or convert the CSVColumn type to use string key accessors instead of functions. The cleanest fix is to create a small client wrapper component that holds the csvColumns definition and renders the CSVExportButton, so the accessor functions never cross the server/client boundary.
files_changed: []
