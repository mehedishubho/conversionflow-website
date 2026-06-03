---
phase: 20
slug: migration-cleanup
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-04
---

# Phase 20 -- UI Design Contract

> Visual and interaction contract for the Migration & External API Removal phase. This is a cleanup phase that removes legacy UI elements and replaces one status card. No new visual patterns are introduced.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (custom ComponentCard, InputField, Select, Button, Badge) |
| Icon library | lucide-react 1.14.0 |
| Font | DM Sans (body), Syne (headings), JetBrains Mono (monospace) |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Status dot size, inline badge padding |
| sm | 8px | Compact element spacing, icon gaps |
| md | 16px | Default element spacing, card body padding |
| lg | 24px | Section padding, card header padding (px-6 py-5) |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: None for this phase. All spacing matches existing `ComponentCard` and admin dashboard patterns.

---

## Typography

Uses existing admin dashboard type scale from `globals.css` `@theme` block.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (--text-theme-sm) | 500 (medium) | 20px |
| Label | 12px (--text-theme-xs) | 600 (semibold) | 18px |
| Heading | 16px (text-base) | 500 (medium) | -- |
| Badge | 12px (text-xs) | 600 (medium) | -- |

Note: This phase does not introduce any new typography patterns. The Local Engine status card uses the same `text-sm`, `text-xs` sizes as the existing Central API card it replaces.

---

## Color

Uses existing admin dashboard color tokens from `globals.css`.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--color-gray-25` / `#fcfcfd` | Card backgrounds, page surface |
| Secondary (30%) | `--color-white` / `#ffffff` | ComponentCard backgrounds, elevated surfaces |
| Accent (10%) | `--color-brand-500` / `#465fff` | Active toggle switches, focus rings, brand highlights |
| Success | `--color-success-500` / `#12b76a` | "Active" indicator dot and badge |
| Error | `--color-error-500` / `#f04438` | Error state dot (removed in this phase) |
| Warning | `--color-warning-500` / `#f79009` | Sandbox mode badge |
| Muted text | `--color-gray-500` / `#667085` | Secondary labels, descriptions |

Accent reserved for: toggle switches (peer-checked:bg-brand-500), focus rings, CTA buttons. NOT used for status indicators (those use semantic colors).

### Dark Mode Overrides

| Light | Dark | Token |
|-------|------|-------|
| `bg-success-50` | `bg-success-500/10` | Success badge background |
| `text-success-600` | `text-success-400` | Success badge text |
| `bg-gray-100` | `bg-gray-800` | Inactive badge background |
| `text-gray-500` | `text-gray-400` | Inactive badge text |
| `bg-white` | `bg-white/[0.03]` | ComponentCard background |
| `border-gray-200` | `border-gray-800` | ComponentCard border |

---

## UI Changes for Phase 20

### Change 1: Replace Central Licensing API Card with Local License Engine Card

**File:** `src/components/admin/PaymentSettingsForm.tsx` (lines 466-489)

**Current state:** "Central Licensing API" status card with URL/Key configured-not-configured indicators. Uses env var checks (`CENTRAL_API_URL`, `CENTRAL_API_KEY`).

**New state:** "Local License Engine" status card with:

| Element | Spec |
|---------|------|
| Card title | "Local License Engine" |
| Card description | "Self-contained license management engine. All operations run locally." |
| Status indicator | Green dot (`h-2 w-2 rounded-full bg-success-500`) + "Active" badge (`bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400`) |
| Data row 1 | Label: "Total Licenses" -- Value: `{count}` from live query |
| Data row 2 | Label: "Last Health Check" -- Value: `{timestamp}` from settings table or live query |
| No action buttons | Read-only status display |
| No env var hints | No `.env.local` code blocks (those were Central API specific) |

**Layout pattern:** Reuses exact same `ComponentCard` wrapper with `space-y-3` inner layout. Each data row is `flex items-center gap-2` with `text-sm` label and `text-xs` badge -- identical to existing status row pattern.

**Props change:** Remove `centralApi` from `PaymentSettingsFormProps`. Add `localEngine: { active: boolean; totalLicenses: number; lastHealthCheck: string | null }`.

### Change 2: Remove centralOrderId from Invoice Templates

**Files:**
- `src/components/invoice/InvoiceHTML.tsx` -- Remove `centralOrderId` from `OrderWithUser` type (line 9)
- `src/app/(portal)/dashboard/billing/[id]/page.tsx` -- Remove `centralOrderId` from select query (line 39) and OrderWithUser construction (line 97)
- `src/app/api/invoices/[id]/pdf/route.ts` -- Remove `centralOrderId` from query and type

**Visual impact:** None. `centralOrderId` was defined in the type but never rendered in the invoice HTML. Removal is a type cleanup only.

### Change 3: Remove centralApi from Admin Settings

**Files:**
- `src/app/(admin)/actions/admin-settings.ts` -- Remove `centralApi` object from `getPaymentSettings` return (lines 248-251)
- `src/app/(admin)/admin/settings/payment/page.tsx` -- Remove `centralApi: settings.centralApi` prop (line 31)

**Visual impact:** None visible. Prop is removed upstream before rendering.

### Change 4: Startup Deprecation Warning

**Behavior:** If `process.env.CENTRAL_API_URL` or `process.env.CENTRAL_API_KEY` are detected at startup, log to console:

```
[DEPRECATED] Central API env vars (CENTRAL_API_URL, CENTRAL_API_KEY) are deprecated and can be removed from your .env configuration.
```

**Visual impact:** Console output only. No UI rendered. Use `console.warn` for visibility.

### Change 5: Email Template for API Token Notification

**File:** `src/lib/emails/api-token-notification.ts` (NEW)

**Spec:**
- Subject: "Your ConversionFlow API Token is Ready"
- Body: Customer name, license key, API token in monospace block (`font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded`), "Save this token -- it will not be shown again" callout in a warning-style box, link to portal license detail page.
- Follows existing email template pattern from `src/lib/emails/order-confirmation.ts`.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Card title | Local License Engine |
| Card description | Self-contained license management engine. All operations run locally. |
| Status badge (active) | Active |
| Total licenses label | Total Licenses |
| Health check label | Last Health Check |
| Health check fallback | Never (if no timestamp) |
| Env deprecation message | Central API env vars (CENTRAL_API_URL, CENTRAL_API_KEY) are deprecated and can be removed from your .env configuration. |
| Email subject | Your ConversionFlow API Token is Ready |
| Email callout | Save this token -- it will not be shown again. |
| No destructive actions | This phase has no destructive UI actions. Data deletion (column drops) happens via migration script, not through UI. |
| No empty states | The Local Engine card always shows data (even if totalLicenses is 0, it displays "0"). |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable -- no shadcn, no third-party registries |

---

## Component Inventory (Existing -- No New Components)

| Component | File | Usage in Phase 20 |
|-----------|------|--------------------|
| ComponentCard | `src/components/common/ComponentCard.tsx` | Wraps Local Engine status card |
| InputField | `src/components/form/input/InputField.tsx` | Not changed |
| Select | `src/components/form/Select.tsx` | Not changed |
| Button | `src/components/ui/button/Button.tsx` | Not changed |
| Badge | `src/components/ui/badge/Badge.tsx` | Used in InvoiceHTML (not changed) |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS -- All labels, descriptions, and messages specified
- [ ] Dimension 2 Visuals: PASS -- Card layout reuses existing ComponentCard pattern
- [ ] Dimension 3 Color: PASS -- Uses existing success/brand/muted semantic tokens
- [ ] Dimension 4 Typography: PASS -- Uses existing admin dashboard type scale
- [ ] Dimension 5 Spacing: PASS -- Uses existing ComponentCard spacing (space-y-3, gap-2)
- [ ] Dimension 6 Registry Safety: PASS -- No registries, no third-party blocks

**Approval:** pending
