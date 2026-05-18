---
status: complete
phase: 04-checkout-payments
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md]
started: 2026-05-18T15:00:00Z
updated: 2026-05-18T15:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Start with pnpm dev. Server boots without errors, homepage loads at localhost:3000, and the application is responsive.
result: pass

### 2. Checkout Page Layout
expected: Navigate to /dashboard/checkout?plan=starter. Page renders a 2-column layout with order summary on the left (plan name, price, VAT line, total) and payment method selection on the right with 5 branded cards (bKash, Nagad, Rocket, SSL Commerce, Bank Transfer).
result: pass

### 3. Manual Payment Flow
expected: Select a manual payment method (e.g., bKash). Payment instructions display with account details. Enter a transaction ID (min 4 chars) and submit. Creates a pending order and redirects to success page showing "Payment Submitted" message.
result: pass

### 4. SSL Commerce Payment Redirect
expected: Select "SSL Commerce" payment method. Click "Pay with SSL Commerce". Redirects to external SSL Commerz hosted payment page (sandbox mode).
result: blocked
blocked_by: third-party
reason: "Failed to create payment session but order was captured correctly. SSL Commerce sandbox credentials are placeholder values (your_store_id/your_store_password)."

### 5. Coupon Code Validation
expected: Enter valid coupon "LAUNCH20" on checkout page. Green discount line appears with recalculated total. Remove coupon, enter invalid code. Specific error message displays.
result: pass

### 6. Admin Order Management
expected: Log in as admin. Navigate to /admin/orders. Pending orders are visible. Click "Verify & Confirm" on a pending order. Order status changes to completed and a license key is generated.
result: issue
reported: "If I click on verify and confirm button it will not change the status without reloading"
severity: major

### 7. Admin Settings - Payment Accounts
expected: Navigate to /admin/settings. All payment method cards (bKash, Nagad, Rocket, Bank Transfer, SSL Commerce) are visible with account name/number fields and active toggles. Saving settings persists changes.
result: pass

### 8. Admin Settings - VAT Enable/Disable
expected: On /admin/settings, VAT Configuration card has a Rate input, Mode dropdown, and an enable/disable toggle. Toggling VAT off and saving hides VAT from the checkout order summary.
result: pass

### 9. Admin Settings - SSL Commerce Enable/Disable
expected: On /admin/settings, SSL Commerce Configuration card has an enable/disable toggle. Toggling SSL off and saving makes SSL Commerce show as "Not Available" on the checkout page.
result: issue
reported: "when I disable it and save it not working still showing the gateway on payment page"
severity: major

### 10. Admin Invoice View
expected: Log in as admin. Navigate to /admin/invoices. Click "View" on any completed order. Invoice detail page loads at /dashboard/billing/[id] showing full invoice with company info, customer info, line items, VAT, discount, and total.
result: pass

### 11. Invoice PDF Download
expected: On the invoice detail page (/dashboard/billing/[id]), click "Download PDF". PDF file downloads and contains the same content as the HTML invoice view.
result: pass

### 12. Admin Sales Page
expected: Navigate to /admin/sales. Page shows revenue metrics (Total Revenue, Pending Revenue, Total Orders, Completed) and a table of the 20 most recent orders with plan, amount, method, status, and date.
result: pass

### 13. Admin Users Page
expected: Navigate to /admin/users. Page shows user stats (Total Users, Customers, Admins) and a table of all users with name, email, phone, role badge, and active/banned status.
result: pass

## Summary

total: 13
passed: 10
issues: 2
pending: 0
blocked: 1
skipped: 0
blocked: 0

## Gaps

- truth: "Clicking Verify & Confirm on a pending order immediately updates the order status to completed in the UI without page reload"
  status: fixed
  reason: "User reported: If I click on verify and confirm button it will not change the status without reloading"
  severity: major
  test: 6
  root_cause: "OrdersTable.tsx handlers called server actions but never called router.refresh() to re-fetch server data"
  artifacts:
    - path: "src/components/admin/OrdersTable.tsx"
      issue: "Missing router.refresh() after successful verify/reject/refund"
  missing:
    - "Add useRouter import and router.refresh() calls after successful actions"
  debug_session: ""

- truth: "Toggling SSL Commerce off in admin settings and saving makes SSL Commerce show as Not Available on checkout page"
  status: fixed
  reason: "User reported: when I disable it and save it not working still showing the gateway on payment page"
  severity: major
  test: 9
  root_cause: "PaymentSettingsForm.tsx only called saveSSLSettings when sslStoreId || sslStorePassword was truthy, so the enabled toggle was never saved without credentials"
  artifacts:
    - path: "src/components/admin/PaymentSettingsForm.tsx"
      issue: "Conditional guard prevented saveSSLSettings from running when credentials empty"
  missing:
    - "Remove the if (sslStoreId || sslStorePassword) guard so enabled flag always saves"
  debug_session: ""
