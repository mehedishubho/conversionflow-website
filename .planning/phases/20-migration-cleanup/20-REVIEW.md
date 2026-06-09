---
phase: 20-migration-cleanup
reviewed: 2026-06-04T12:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - .env.example
  - scripts/migrate-phase20.ts
  - src/app/(admin)/actions/admin-settings.ts
  - src/app/(admin)/admin/settings/payment/page.tsx
  - src/app/(portal)/dashboard/billing/[id]/page.tsx
  - src/app/api/invoices/[id]/pdf/route.ts
  - src/app/layout.tsx
  - src/components/admin/PaymentSettingsForm.tsx
  - src/components/invoice/InvoiceHTML.tsx
  - src/lib/auth.ts
  - src/lib/central-api.ts
  - src/lib/db/schema.ts
  - src/lib/emails/api-token-notification.ts
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 20: Code Review Report

**Reviewed:** 2026-06-04T12:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Reviewed 13 files from the Phase 20 migration cleanup. The phase migrates from an external Central API to self-contained licensing, adds admin payment settings, and introduces invoice generation. Three critical issues were found: a data shape mismatch between the payment settings server action and the form component (which will cause SSL Commerce credentials to always initialize as empty), a real database credential in `.env.example`, and HTML injection in the API token notification email. Additionally, a command injection vector exists in the migration script, and the VAT rate is truncated from decimal to integer when displaying invoices.

The deleted `src/lib/central-api.ts` was confirmed safe to remove -- no active imports remain anywhere in the codebase. The only references are the deprecation warning in `layout.tsx` and a historical code comment in `OrderService.ts`.

## Critical Issues

### CR-01: SSL Commerce settings data shape mismatch between server action and form

**File:** `src/app/(admin)/admin/settings/payment/page.tsx:33` (origin: `src/app/(admin)/actions/admin-settings.ts:237-248`)
**Issue:** `getPaymentSettings()` returns `sslCommerz` as `{ storeIdConfigured: boolean, storePasswordConfigured: boolean, sandbox: boolean }`. The page passes this directly to `PaymentSettingsForm` at line 33. However, the form component reads `initialData.sslCommerz.storeId`, `initialData.sslCommerz.storePassword`, and `initialData.sslCommerz.dbSandbox` at lines 102-105. None of these fields exist on the returned object. This means:
  - Store ID and Store Password will always initialize as empty strings, even if values exist in the database.
  - The sandbox toggle will fall back to the `sandbox` boolean field, which works differently from the expected `dbSandbox` string field.
  - When the admin saves, the empty strings will overwrite any previously stored credentials with blank values.

**Fix:** Update `getPaymentSettings()` to return the raw database values alongside the configured flags:
```typescript
// In admin-settings.ts getPaymentSettings(), lines 237-248:
return {
  paymentAccounts: accounts,
  vatRate: vatRateRow.length > 0 ? parseFloat(vatRateRow[0].value) : 0,
  vatMode: vatModeRow.length > 0 ? vatModeRow[0].value : "exclusive",
  vatEnabled: vatEnabledRow.length > 0 ? vatEnabledRow[0].value !== "false" : true,
  sslCommerzEnabled: sslEnabledRow.length > 0 ? sslEnabledRow[0].value !== "false" : true,
  sslCommerz: {
    storeId: sslDbStoreId,          // <-- add raw value
    storePassword: sslDbPassword,   // <-- add raw value
    dbSandbox: sslDbSandbox,        // <-- add raw string
    storeIdConfigured: !!sslDbStoreId || (!!process.env.SSL_COMMERZ_STORE_ID && process.env.SSL_COMMERZ_STORE_ID !== "your_store_id"),
    storePasswordConfigured: !!sslDbPassword || (!!process.env.SSL_COMMERZ_STORE_PASSWORD && process.env.SSL_COMMERZ_STORE_PASSWORD !== "your_store_password"),
    sandbox: sslDbSandbox !== "false" || process.env.SSL_COMMERZ_SANDBOX !== "false",
  },
};
```

### CR-02: Real database credentials in `.env.example`

**File:** `.env.example:2`
**Issue:** Line 2 contains `DATABASE_URL=postgresql://wpmhs:Clay125524@localhost:5434/devsroom_conversionflow_db`. The username `wpmhs` and password `Clay125524` appear to be real credentials, not placeholder values. This file is tracked in git and would be visible to anyone with repository access. `.env.example` should contain only placeholder values that clearly indicate they need to be changed.
**Fix:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/conversionflow_db
```

### CR-03: XSS via HTML injection in API token notification email

**File:** `src/lib/emails/api-token-notification.ts:38-64`
**Issue:** `customerName` (line 38), `licenseKey` (line 41), `apiToken` (line 48), and `portalUrl` (line 64) are interpolated directly into the HTML email template without any HTML escaping. If a user registers with a name containing HTML/JavaScript (e.g., `<script>alert(1)</script>` or `<img src=x onerror=...>`), it will be injected into the email. While most email clients strip `<script>` tags, other injection vectors (CSS exfiltration, `<img onerror>`, etc.) can still work. The `portalUrl` in the `href` attribute (line 64) is particularly risky as it could allow `javascript:` URL injection.
**Fix:** Use an HTML escaping utility before interpolation:
```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Then use escapeHtml(customerName), escapeHtml(licenseKey), etc.
// For portalUrl in href, also validate it starts with https://
```

## Warnings

### WR-01: Command injection in migration script via unsanitized DATABASE_URL

**File:** `scripts/migrate-phase20.ts:127-129`
**Issue:** `process.env.DATABASE_URL` is interpolated directly into an `execSync` shell command: `pg_dump "${process.env.DATABASE_URL}" -f "${backupFile}"`. While wrapped in double quotes, a DATABASE_URL containing a double quote character would break out of the quoting and allow arbitrary command execution. For example, a URL like `postgresql://u:"$(rm -rf /)"@host/db` would execute the injected command. This is a lower risk than CR-03 since the migration script runs in a controlled server environment, but it should still be hardened.
**Fix:** Use `execFileSync` with an argument array instead of `execSync` with a string command, or use `child_process.spawn` with separate arguments:
```typescript
import { execFileSync } from "child_process";

// Instead of execSync with string interpolation:
execFileSync("pg_dump", [process.env.DATABASE_URL!, "-f", backupFile], {
  stdio: "pipe",
});
```

### WR-02: VAT rate truncated from float to integer in invoice display

**File:** `src/app/(portal)/dashboard/billing/[id]/page.tsx:91`
**Issue:** `parseInt(vatRateRow.value, 10)` truncates the VAT rate to an integer. If the admin sets a fractional VAT rate (e.g., 7.5%), it will display as 7% on invoices. The form allows fractional input with `step={0.5}` (PaymentSettingsForm.tsx line 249), and `saveVATSettings` accepts any number between 0-100 (admin-settings.ts line 119), so fractional rates are explicitly supported.
**Fix:**
```typescript
const vatRate = vatRateRow ? parseFloat(vatRateRow.value) : 15;
```

### WR-03: Invoice PDF route queries all settings rows to find one key

**File:** `src/app/(portal)/dashboard/billing/[id]/page.tsx:89-91`
**Issue:** Line 89 does `await db.select().from(settings)` which fetches every row from the `settings` table, then filters in JavaScript with `.find()`. As the settings table grows, this becomes an unnecessary full table scan. The billing page already imports `eq` from drizzle-orm (line 6), so a targeted query is straightforward.
**Fix:**
```typescript
const [vatRateRow] = await db
  .select()
  .from(settings)
  .where(eq(settings.key, "vat_rate"))
  .limit(1);
const vatRate = vatRateRow ? parseFloat(vatRateRow.value) : 15;
```

### WR-04: `saveSSLSettings` result not checked in PaymentSettingsForm

**File:** `src/components/admin/PaymentSettingsForm.tsx:198-203`
**Issue:** The `saveSSLSettings` call on line 198 is `await`ed but its return value is not checked for errors. All other save operations in `handleSave` (lines 171-195) check `result.error` and show an error message if saving fails. The SSL settings save silently ignores failures, which means the admin could see "All settings saved successfully" even when SSL settings failed to persist.
**Fix:**
```typescript
const sslResult = await saveSSLSettings({
  storeId: sslStoreId,
  storePassword: sslStorePassword,
  sandbox: sslSandbox,
  enabled: sslEnabled,
});
if (sslResult.error) {
  setSaveMessage({ type: "error", text: `Error saving SSL Commerce settings: ${sslResult.error}` });
  return;
}
```

## Info

### IN-01: Unused variables in `getSubscriptionSettings` and `getTransferSettings`

**File:** `src/app/(admin)/actions/admin-settings.ts:335,440`
**Issue:** Both `getSubscriptionSettings` (line 335) and `getTransferSettings` (line 440) destructure `{ userId, role }` from `requireAdmin()`, but neither variable is used -- they only need the guard. The `saveSubscriptionSettings` (line 355) and `saveTransferSettings` (line 456) do use these for audit logging, so the destructuring is correct there.
**Fix:** In the getter functions, use a simple call without destructuring:
```typescript
// Line 335
await requireAdmin();

// Line 440
await requireAdmin();
```

### IN-02: Deprecation warning for Central API env vars at module level in layout

**File:** `src/app/layout.tsx:8-12`
**Issue:** The deprecation check runs at module evaluation time (top-level), which means it logs every time the module is imported. In development with hot reloading, this will log repeatedly. This is acceptable for a transitional deprecation warning, but should be removed in a future cleanup phase once the migration is confirmed complete.
**Fix:** No immediate action needed, but add a TODO comment with a target removal date:
```typescript
// TODO: Remove after Phase 22 or when all deployments have migrated
if (process.env.CENTRAL_API_URL || process.env.CENTRAL_API_KEY) {
```

### IN-03: Manual `updatedAt: new Date()` in upserts is redundant with `$onUpdate`

**File:** `src/app/(admin)/actions/admin-settings.ts:81,138,157,176,280,392,410,477`
**Issue:** The schema defines `updatedAt` with `.$onUpdate(() => new Date())`, which automatically sets the field on Drizzle `update()` calls. The server actions also manually set `updatedAt: new Date()` in every `.set()` call. This is harmless (the explicit set wins) but redundant -- it means the update timestamp comes from the Node.js process time rather than the database server time, and it adds boilerplate to every update.
**Fix:** Remove the manual `updatedAt: new Date()` from `.set()` calls and rely on the Drizzle `$onUpdate` hook, or document that the explicit set is intentional.

---

_Reviewed: 2026-06-04T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
