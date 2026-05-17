---
phase: 04-checkout-payments
plan: 05
subsystem: invoices, emails, pdf
tags: [react-pdf, resend, invoice-generation, order-confirmation, pdf-download]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "DB schema, Drizzle ORM, auth, server action patterns"
  - plan: 04-01
    provides: "Orders table, checkout server actions, settings table"
  - plan: 04-04
    provides: "Admin verify/reject/refund actions, payment settings"
provides:
  - "InvoiceHTML component rendering full invoice with line items, VAT, discount, payment details (D-17)"
  - "InvoicePDF component generating A4 PDF via @react-pdf/renderer (D-18)"
  - "generateInvoicePDF utility wrapping renderToBuffer"
  - "PDF download API route at /api/invoices/[id]/pdf with auth + ownership check"
  - "Invoice detail page at /dashboard/billing/[id] with auth, ownership, license display (D-17)"
  - "Order confirmation email template via Resend (D-19)"
  - "Clickable order IDs in InvoiceTable linking to invoice detail"
affects: [04-06, customer-portal, admin-bi-dashboard]

# Tech tracking
tech-stack:
  added: ["@react-pdf/renderer"]
  patterns: [invoice-pdf-generation, order-confirmation-email, invoice-detail-ownership-check]

key-files:
  created:
    - src/components/invoice/InvoiceHTML.tsx
    - src/components/invoice/InvoicePDF.tsx
    - src/lib/invoices.tsx
    - src/app/api/invoices/[id]/pdf/route.ts
    - src/app/(portal)/dashboard/billing/[id]/page.tsx
    - src/lib/emails/order-confirmation.ts
  modified:
    - src/components/portal/InvoiceTable.tsx

key-decisions:
  - "invoices.ts renamed to invoices.tsx to support JSX (renderToBuffer with InvoicePDF component)"
  - "OrderWithUser type exported from InvoiceHTML.tsx and reused across InvoicePDF, invoices.tsx, and billing/[id]/page.tsx"
  - "PDF route uses new Uint8Array(pdfBuffer) wrapper for Response body compatibility (Node.js Buffer not assignable to BodyInit)"
  - "Invoice detail page queries both order+user and license+settings for complete context"
  - "Order confirmation email conditionally shows license key section and status-dependent 'What happens next' text"
  - "InvoiceTable order IDs wrapped in Next.js Link with brand-500 color styling"

patterns-established:
  - "Invoice PDF generation: renderToBuffer(<InvoicePDF />) -> Buffer -> Uint8Array -> Response"
  - "Order confirmation email: conditional license key display based on status parameter"
  - "Invoice detail page: auth check + ownership filter on query + optional license card"

requirements-completed: [PAY-05, PAY-06]

# Metrics
duration: 5min
completed: 2026-05-17
---

# Phase 4 Plan 05: Invoice Generation and Order Confirmation Summary

**Invoice HTML/PDF generation with @react-pdf/renderer, authenticated PDF download route, invoice detail page with ownership check, and order confirmation email via Resend**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-17
- **Completed:** 2026-05-17
- **Tasks:** 2
- **Files created:** 6
- **Files modified:** 1

## Accomplishments
- InvoiceHTML component renders printable invoice with Bill To, Company info, line items (plan, VAT, discount), total, and payment details
- InvoicePDF component generates identical A4 layout via @react-pdf/renderer with Helvetica font
- generateInvoicePDF utility wraps renderToBuffer for PDF buffer generation
- PDF download API route at /api/invoices/[id]/pdf with auth check, userId ownership verification, and admin override
- Invoice detail page at /dashboard/billing/[id] with auth, user ownership filter, optional license key display, and VAT rate from settings
- Order confirmation email via Resend with branded HTML template, conditional license key display, and status-dependent messaging
- InvoiceTable order IDs now clickable links navigating to /dashboard/billing/${order.id}

## Task Commits

Each task was committed atomically:

1. **Task 1: Create InvoiceHTML, InvoicePDF components and PDF generation utility** - `74eff52` (feat)
2. **Task 2: Create invoice detail page, order confirmation email, and link order IDs** - `6c27df1` (feat)

## Files Created/Modified
- `src/components/invoice/InvoiceHTML.tsx` - Server component: full HTML invoice with line items, VAT breakdown, discount, total, payment details, Download PDF button
- `src/components/invoice/InvoicePDF.tsx` - @react-pdf/renderer Document: A4 PDF invoice with matching layout
- `src/lib/invoices.tsx` - generateInvoicePDF utility wrapping renderToBuffer, exports OrderWithUser type
- `src/app/api/invoices/[id]/pdf/route.ts` - GET handler: auth check, ownership verification, PDF generation, Content-Disposition attachment response
- `src/app/(portal)/dashboard/billing/[id]/page.tsx` - Server component: invoice detail page with auth, ownership filter, InvoiceHTML rendering, optional license card
- `src/lib/emails/order-confirmation.ts` - sendOrderConfirmationEmail via Resend: branded HTML with order details, conditional license key, status-dependent messaging
- `src/components/portal/InvoiceTable.tsx` - Added Link import, order IDs now clickable links to /dashboard/billing/${order.id}

## Decisions Made
- Renamed invoices.ts to invoices.tsx since it contains JSX (renderToBuffer with InvoicePDF component)
- OrderWithUser type defined in InvoiceHTML.tsx and reused across InvoicePDF, invoices.tsx, and billing page
- PDF route wraps Buffer in new Uint8Array() for Response body compatibility
- Invoice detail page queries settings table for dynamic VAT rate display
- Order confirmation email shows license key box only when licenseKey parameter is provided
- Status-dependent "What happens next" section: completed vs pending verification messaging

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Renamed invoices.ts to invoices.tsx for JSX support**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** invoices.ts contains JSX (`<InvoicePDF order={order} />`) but .ts extension does not support JSX, causing TS1005/TS1109 errors
- **Fix:** Renamed src/lib/invoices.ts to src/lib/invoices.tsx
- **Files modified:** src/lib/invoices.tsx (renamed from invoices.ts)
- **Verification:** npx tsc --noEmit passes cleanly
- **Committed in:** 74eff52 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed Buffer not assignable to Response BodyInit**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Node.js Buffer type not assignable to BodyInit in `new Response(pdfBuffer, ...)`, causing TS2345 error
- **Fix:** Wrapped in `new Uint8Array(pdfBuffer)` which is compatible with Response body
- **Files modified:** src/app/api/invoices/[id]/pdf/route.ts
- **Verification:** npx tsc --noEmit passes cleanly
- **Committed in:** 74eff52 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes were TypeScript compatibility issues. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required at this stage.

## Next Phase Readiness
- Invoice generation and PDF download fully functional
- Order confirmation email template ready for integration with verifyOrder flow (Plan 04)
- InvoiceTable links provide navigation to invoice detail from billing page
- Ready for Plan 06 (checkout integration and testing)

## Self-Check: PASSED

- src/components/invoice/InvoiceHTML.tsx: FOUND
- src/components/invoice/InvoicePDF.tsx: FOUND
- src/lib/invoices.tsx: FOUND
- src/app/api/invoices/[id]/pdf/route.ts: FOUND
- src/app/(portal)/dashboard/billing/[id]/page.tsx: FOUND
- src/lib/emails/order-confirmation.ts: FOUND
- Commit 74eff52 (Task 1): FOUND
- Commit 6c27df1 (Task 2): FOUND
- TypeScript compilation passes (`npx tsc --noEmit` clean)

---
*Phase: 04-checkout-payments*
*Completed: 2026-05-17*
