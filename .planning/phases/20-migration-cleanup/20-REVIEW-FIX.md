---
phase: 20-migration-cleanup
fixed_at: 2026-06-04T12:30:00Z
review_path: .planning/phases/20-migration-cleanup/20-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 20: Code Review Fix Report

**Fixed at:** 2026-06-04T12:30:00Z
**Source review:** .planning/phases/20-migration-cleanup/20-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: SSL Commerce settings data shape mismatch between server action and form

**Files modified:** `src/app/(admin)/actions/admin-settings.ts`
**Commit:** 08eee59
**Status:** fixed: requires human verification
**Applied fix:** Added `storeId`, `storePassword`, and `dbSandbox` raw database value fields to the `sslCommerz` object returned by `getPaymentSettings()`. The form component was already reading these fields (`initialData.sslCommerz.storeId`, `initialData.sslCommerz.storePassword`, `initialData.sslCommerz.dbSandbox`) at lines 102-105, but the server action was only returning the `storeIdConfigured`, `storePasswordConfigured`, and `sandbox` boolean fields. Now the form will correctly initialize with stored values instead of always defaulting to empty strings.

### CR-02: Real database credentials in `.env.example`

**Files modified:** `.env.example`
**Commit:** ab35049
**Status:** fixed
**Applied fix:** Replaced `postgresql://wpmhs:Clay125524@localhost:5434/devsroom_conversionflow_db` with placeholder `postgresql://user:password@localhost:5432/conversionflow_db`.

### CR-03: XSS via HTML injection in API token notification email

**Files modified:** `src/lib/emails/api-token-notification.ts`
**Commit:** c08c21c
**Status:** fixed
**Applied fix:** Added `escapeHtml()` utility function that escapes `&`, `<`, `>`, `"`, and `'`. Applied escaping to `customerName`, `licenseKey`, and `apiToken` before HTML interpolation. Added `https://` URL validation for `portalUrl` -- falls back to `#` if the URL does not start with `https://`, preventing `javascript:` URL injection in the href attribute.

### WR-01: Command injection in migration script via unsanitized DATABASE_URL

**Files modified:** `scripts/migrate-phase20.ts`
**Commit:** 2629263
**Status:** fixed
**Applied fix:** Replaced `execSync` string interpolation for `pg_dump` with `execFileSync("pg_dump", [args])` using argument array, which bypasses shell interpretation entirely and prevents command injection via crafted `DATABASE_URL` values.

### WR-02: VAT rate truncated from float to integer in invoice display

**Files modified:** `src/app/(portal)/dashboard/billing/[id]/page.tsx`
**Commit:** 839d9e7
**Status:** fixed
**Applied fix:** Changed `parseInt(vatRateRow.value, 10)` to `parseFloat(vatRateRow.value)` to correctly preserve fractional VAT rates (e.g., 7.5% instead of 7%).

### WR-03: Invoice PDF route queries all settings rows to find one key

**Files modified:** `src/app/(portal)/dashboard/billing/[id]/page.tsx`
**Commit:** 839d9e7
**Status:** fixed
**Applied fix:** Replaced `await db.select().from(settings)` (full table scan) with a targeted query using `.where(eq(settings.key, "vat_rate")).limit(1)`. The `eq` import was already present in the file.

### WR-04: `saveSSLSettings` result not checked in PaymentSettingsForm

**Files modified:** `src/components/admin/PaymentSettingsForm.tsx`
**Commit:** e5d36f6
**Status:** fixed
**Applied fix:** Captured the return value of `saveSSLSettings()` into `sslResult`, then added an error check: if `sslResult.error` is truthy, displays an error message and returns early -- matching the same error-handling pattern used for VAT settings and payment account saves earlier in the same `handleSave` function.

---

_Fixed: 2026-06-04T12:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
