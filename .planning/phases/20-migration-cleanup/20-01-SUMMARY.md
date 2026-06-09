---
phase: 20-migration-cleanup
plan: 01
status: complete
started: 2026-06-04T02:37:00.000Z
completed: 2026-06-04T02:44:00.000Z
---

# Plan 20-01: Central API Code Removal — Summary

## Objective
Remove all code references to the external Central Licensing API. Delete the central-api.ts file, remove centralOrderId/centralLicenseId/centralUserId from schema/auth/types/UI, and clean up .env.example.

## Tasks Completed

| Task | Status | Commit |
|------|--------|--------|
| Task 1: Delete central-api.ts and remove all code references | Done | 4c047c1 |
| Task 2: Clean up .env.example and add startup deprecation warning | Done | 0dded2e |

## Key Files

### Created
- None

### Modified
- `src/lib/db/schema.ts` — Removed centralUserId, centralOrderId, centralLicenseId columns
- `src/lib/auth.ts` — Removed centralUserId from additionalFields
- `src/components/invoice/InvoiceHTML.tsx` — Removed centralOrderId from OrderWithUser type
- `src/app/(portal)/dashboard/billing/[id]/page.tsx` — Removed centralOrderId from select query and object construction
- `src/app/api/invoices/[id]/pdf/route.ts` — Removed centralOrderId from select query and object construction
- `src/app/(admin)/actions/admin-settings.ts` — Removed centralApi from getPaymentSettings return
- `src/app/(admin)/admin/settings/payment/page.tsx` — Removed centralApi from PaymentSettingsForm initialData prop
- `src/components/admin/PaymentSettingsForm.tsx` — Removed centralApi prop and Central API ComponentCard block
- `.env.example` — Removed CENTRAL_API_URL and CENTRAL_API_KEY lines
- `src/app/layout.tsx` — Added deprecation warning for Central API env vars

### Deleted
- `src/lib/central-api.ts` — External API client (124 lines)

## Verification Results
- `src/lib/central-api.ts` does not exist on disk
- Zero central API code references remain in src/ (only intentional deprecation warning in layout.tsx)
- All acceptance criteria pass
- Pre-existing build failures (nodemailer, tiptap, recharts) are unrelated to this plan

## Decisions Applied
- D-01: Dropped centralOrderId (orders), centralLicenseId (licenses), centralUserId (user) columns from schema definitions
- D-13: Deleted central-api.ts and removed all remaining references in 9+ files
- D-15: Clean removal of centralUserId from Better Auth configuration and Drizzle schema
- D-16: Removed centralOrderId from all invoice templates and billing page references
- D-17: Added startup deprecation warning for Central API env vars
- D-18: Kept nanoid in package.json (used in 4 other files)

## Requirements Addressed
- ARCH-07: Remove all external API dependencies

## Duration
~4 minutes

## Deferred Issues
- Pre-existing build failures from missing nodemailer, tiptap, and recharts dependencies are out of scope
