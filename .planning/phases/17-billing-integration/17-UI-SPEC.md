---
phase: 17
slug: billing-integration
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-03
---

# Phase 17 — UI Design Contract

> Visual and interaction contract for Phase 17: Customer & Billing Integration.
> This phase has minimal new UI surface area. It modifies two existing surfaces
> (checkout success page and confirmation email) to display license credentials
> that are now generated locally instead of via central API.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (existing TailwindCSS v4 + TailAdmin pattern library) |
| Preset | not applicable |
| Component library | TailAdmin-based custom components (`src/components/ui/`) |
| Icon library | Lucide React 1.14.0 |
| Font | DM Sans (body), JetBrains Mono (license keys, tokens) |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing |
| md | 16px | Default element spacing |
| lg | 24px | Section padding |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: none for this phase. All spacing follows the 8-point grid established in `globals.css`.

---

## Typography

Uses existing project fonts. No new font declarations.

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Body | 14px | 400 | 1.5 | DM Sans |
| Label | 13px | 600 | 1.38 | DM Sans |
| Heading | 20px | 600 | 1.2 | DM Sans |
| Monospace | 14px | 600 | 1.5 | JetBrains Mono |

Monospace is used exclusively for license keys (`CF-XXXX-XXXX-XXXX-XXXX-XXXX` format) and API tokens. No other text uses monospace.

---

## Color

Uses the existing color token system from `globals.css`. No new color tokens.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--background` / `--surface` | Page background, card surfaces |
| Secondary (30%) | `--surface2` / `--bg2` | Detail blocks, key-value rows |
| Accent (10%) | `--accent` (#0047FF light / #4D8AFF dark) | CTA buttons, active links, status highlights |
| Success | `--green` (#00BF7A light / #00D48A dark) | Completed status badge, license key block border |
| Destructive | `--red` (#F53B5C light / #FF4D70 dark) | Error states, revoke actions (admin only, not in this phase) |

Accent reserved for: CTA button backgrounds (`Go to Billing`, `Go to Dashboard`), breadcrumb active link, icon highlights.

Success green reserved for: License key display block border/background, `Completed` status badge, CheckCircle2 icon.

---

## Copywriting Contract

### Checkout Success Page

| Element | Copy |
|---------|------|
| Page title | "Success" (breadcrumb) |
| Completed heading | "Payment Successful" |
| Pending heading | "Payment Submitted" |
| Completed body | "Your payment was successful! Your license is ready." |
| Pending body | "Your payment is being verified. We will email your license key within 24 hours once confirmed." |
| Primary CTA | "Go to Billing" (link to `/dashboard/billing`) |
| Secondary CTA | "Go to Dashboard" (link to `/dashboard`) |
| License key label | "License Key" |
| API token label | "API Token" |
| API token warning | "Save this API token -- it will not be shown again." |
| Copy button tooltip | "Copy to clipboard" (sr-only) |
| Copy success feedback | "Copied!" (inline text replacing "Copy" for 2 seconds) |

### License Credential Block (Success Page)

| Element | Copy |
|---------|------|
| Section heading | "Your Credentials" |
| License key description | "Use this key to activate ConversionFlow on your WooCommerce store." |
| API token description | "Use this token for API access. Save it now -- it will not be shown again in the portal." |
| Pending state | "Your license credentials will appear here once payment is verified." |

### Confirmation Email

| Element | Copy |
|---------|------|
| Subject | "Order Confirmation - ConversionFlow" |
| License key block label | "YOUR LICENSE KEY" |
| API token block label | "YOUR API TOKEN" |
| API token warning | "Save this API token -- it will not be shown again in email." |
| Next steps (completed) | "Your license is ready! Download the plugin and activate it using your license key from your dashboard." |

### Error State (License Generation Failure)

| Element | Copy |
|---------|------|
| Heading | "Payment Received" |
| Body | "Your payment was processed, but we could not generate your license immediately. Our team has been notified and will email your license key shortly." |
| CTA | "Go to Dashboard" |

### Empty State

No empty state needed. The success page always has an order to display or an error.

### Destructive Actions

No destructive actions in this phase. Admin revoke/suspend is Phase 18 scope.

---

## Component Inventory

### Existing Components Used (No Modifications)

| Component | Path | Usage |
|-----------|------|-------|
| PageBreadcrumb | `src/components/common/PageBreadCrumb.tsx` | Success page breadcrumb |
| Badge | `src/components/ui/badge/Badge.tsx` | Order status badge |
| Button | `src/components/ui/button/Button.tsx` | Not directly used (success page uses Link) |
| CheckCircle2 | `lucide-react` | Success icon |
| ArrowRight | `lucide-react` | CTA arrow icon |

### New Components Created (in this phase)

| Component | Location | Purpose |
|-----------|----------|---------|
| CredentialCard | Inline in success page or `src/components/portal/` | Displays license key + API token with copy-to-clipboard buttons |
| CopyButton | Inline in success page or `src/components/portal/` | Small button that copies text to clipboard and shows "Copied!" feedback |

These are small, single-purpose components. They may be defined inline within the success page component or extracted to `src/components/portal/` if they will be reused in Phase 19 (license management UI).

### Component Contract: CredentialCard

```
Props:
  - licenseKey: string (format: CF-XXXX-XXXX-XXXX-XXXX-XXXX)
  - apiToken?: string (format: cf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
  - loading?: boolean (shows skeleton while order is being fetched)

Layout:
  - Rounded card (rounded-xl) with border (--border)
  - Light background (--surface2 / --bg2)
  - Two rows:
    1. "License Key" label + monospace value + CopyButton
    2. "API Token" label + monospace value + CopyButton + warning text

States:
  - Default: Both key and token visible with copy buttons
  - Token hidden: If apiToken is not available (pre-existing orders, pending)
  - Pending: Shows "Credentials will appear here once payment is verified" text

Dark mode: Uses dark: variants matching existing success page pattern
```

### Component Contract: CopyButton

```
Props:
  - text: string (the value to copy)
  - label?: string (sr-only label, default: "Copy to clipboard")

Behavior:
  1. Click: navigator.clipboard.writeText(text)
  2. Show "Copied!" text for 2 seconds
  3. Revert to copy icon

Visual:
  - Small button: p-1.5 rounded-md
  - Icon: Copy from lucide-react (h-4 w-4)
  - Copied state: Check icon (green) + "Copied!" text
  - Transition: 200ms

Accessibility:
  - aria-label on button
  - sr-only live region announcing copy success
```

---

## Layout Specifications

### Checkout Success Page Layout (Modified)

```
Structure (existing, unchanged):
  PageBreadcrumb("Success", "/dashboard")
  max-w-lg mx-auto container
    rounded-2xl card with border
      CheckCircle2 icon (h-16 w-16, success-500)
      Heading (20px semibold)
      Description (14px, text-gray-500)
      Order details card (existing key-value rows)
      [NEW] CredentialCard (license key + API token)
      CTA buttons row (existing)
```

The CredentialCard is inserted between the existing order details card and the CTA buttons row. It only renders when `order.status === "completed"` and a license exists for the order.

### Order Details Fetch (Modified)

The `getOrderDetails` server action must be extended to return:
- `licenseKey: string | null` (from licenses table, joined by orderId)
- `apiToken: string | null` (only available at generation time; not stored)

Since the API token is not stored in the database (only its hash), the token is available only:
1. On the success page immediately after IPN processes (passed via URL param or server-side session)
2. In the confirmation email (sent by the event handler at generation time)

For the success page flow:
- If IPN has already processed: License key is fetched from DB. API token is NOT available (only hash stored).
- SOLUTION per D-08: Success page shows license key from DB. API token is shown ONLY in the email. The success page shows "Your API token has been sent to your email." with a note to check inbox.
- ALTERNATIVE: Store API token briefly in server-side session/Redis with 10-minute TTL for immediate display, then purge. This is Claude's discretion per CONTEXT.md.

### Confirmation Email Layout (Modified)

```
Existing structure (unchanged):
  Blue header (ConversionFlow branding)
  Order details table

NEW section (after license key block):
  API Token Block:
    - Background: warning-50 (#fffaf5) with orange border (#fb6514)
    - Warning icon + "YOUR API TOKEN" label (12px uppercase)
    - Monospace token text (16px, JetBrains Mono)
    - Warning text: "Save this API token -- it will not be shown again in email."
    - Orange accent creates urgency (distinct from green license key block)

Existing (unchanged):
  "What happens next" section
  CTA button
  Footer
```

---

## Interaction Specifications

### Copy to Clipboard

1. User clicks CopyButton next to license key or API token
2. `navigator.clipboard.writeText(text)` called
3. Button transitions: copy icon -> check icon (green) + "Copied!" text
4. After 2 seconds, reverts to copy icon
5. If clipboard API fails (older browsers): Fallback to `document.execCommand('copy')` with temporary textarea

### Success Page Load Sequence

1. Page loads with Suspense fallback (spinner)
2. `useEffect` fires `getOrderDetails(orderId)`
3. If order status is "completed":
   a. Show CheckCircle2 + "Payment Successful"
   b. Show order details
   c. Show CredentialCard with license key (fetched from DB)
   d. API token: Show email delivery message OR display if available via session
4. If order status is "pending":
   a. Show CheckCircle2 (dimmed) + "Payment Submitted"
   b. Show order details
   c. Show pending credential message
5. If order not found: Show error state

### IPN Race Condition Handling

Per D-08: No polling or auto-refresh. If customer reaches success page before IPN processes:
- Order status is "pending"
- Show "Payment Submitted" with "Your payment is being verified"
- Customer can reload manually to see updated status
- Once IPN processes and license is generated, reload shows credentials

---

## Responsive Behavior

### Mobile (< 640px)

- CredentialCard stacks vertically (single column)
- CopyButton remains right-aligned within each credential row
- License key and API token text uses `word-break: break-all` for long strings
- Font size for monospace text reduces to 13px on mobile

### Tablet (640px - 960px)

- Same as desktop layout
- CredentialCard at full width within max-w-lg container

### Desktop (> 960px)

- Same as existing success page layout
- No changes to max-w-lg constraint

---

## Accessibility

| Element | Requirement |
|---------|-------------|
| CopyButton | `aria-label="Copy license key to clipboard"` / `aria-label="Copy API token to clipboard"` |
| Copy feedback | `aria-live="polite"` region announcing "Copied!" |
| License key text | Semantic `<code>` or `role="textbox"` with `aria-readonly="true"` |
| API token warning | Associated via `aria-describedby` on the token display |
| CredentialCard | Landmark `role="region"` with `aria-label="License credentials"` |
| Status badge | Uses existing Badge component (already accessible) |
| Color contrast | Success green on white/light bg meets WCAG AA (4.5:1 ratio confirmed) |

---

## States Reference

| State | Visual | Copy |
|-------|--------|------|
| Completed with license | Green CheckCircle2, full order details, CredentialCard with key | "Payment Successful" |
| Completed, no license yet | Green CheckCircle2, order details, no CredentialCard | "Payment Successful" (edge case, should not happen with sync processing) |
| Pending verification | Orange CheckCircle2 or gray, order details, pending message | "Payment Submitted" |
| Order not found | Error text, link to dashboard | "Order not found." |
| License generation failed | Green CheckCircle2, order details, failure message | "Payment Received" + failure body copy |
| Loading | Spinner + "Loading order details..." | "Loading order details..." |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| Third-party | none | not applicable |

No third-party registries or new external dependencies in this phase.

---

## Files Modified (UI-Specific)

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/(portal)/dashboard/checkout/success/page.tsx` | Modify | Add CredentialCard with license key + API token display, extend OrderDetails type |
| `src/app/(portal)/actions/checkout.ts` | Modify | Extend `getOrderDetails` return type to include `licenseKey` |
| `src/lib/emails/order-confirmation.ts` | Modify | Add API token block with orange warning styling |

## Files Created (UI-Specific)

| File | Description |
|------|-------------|
| `src/components/portal/CredentialCard.tsx` (optional) | Extracted credential display component |
| `src/components/portal/CopyButton.tsx` (optional) | Extracted copy-to-clipboard button |

These may be inline within the success page instead of extracted. Extraction decision is at Claude's discretion per CONTEXT.md.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
