---
phase: 35-wordpress-sdk
fixed_at: 2026-06-11T16:50:00Z
review_path: .planning/phases/35-wordpress-sdk/35-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 35: Code Review Fix Report

**Fixed at:** 2026-06-11T16:50:00Z
**Source review:** .planning/phases/35-wordpress-sdk/35-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (2 Critical, 5 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: API token exposed in cleartext via HTML form value attribute

**Files modified:** `sdks/php/src/WordPress/WpSettings.php`
**Commit:** 34322d4
**Applied fix:** Changed API Token field to match the license key security pattern -- input value is now empty, and a masked display (last 4 chars) is shown below the field when a token exists. Also updated `saveSettings()` to only update the API token option when a new value is provided (matching the license key guard). This fix also includes CR-02 in the same commit since both touch the same file.

### CR-02: Open redirect via unsanitized `$_SERVER['REQUEST_URI']` in wp_redirect

**Files modified:** `sdks/php/src/WordPress/WpSettings.php`
**Commit:** 34322d4
**Applied fix:** Wrapped `$_SERVER['REQUEST_URI']` with `sanitize_text_field()` before passing to `admin_url()` to prevent open redirect via malicious path/query injection.

### WR-01: CurlTransport does not set SSL verification options

**Files modified:** `sdks/php/src/Transport/CurlTransport.php`
**Commit:** 537eb9b
**Applied fix:** Added explicit `CURLOPT_SSL_VERIFYPEER => true` and `CURLOPT_SSL_VERIFYHOST => 2` to both `post()` and `get()` methods to document security intent and prevent issues on misconfigured systems.

### WR-02: Client::wordpress() does not validate that required config values are present

**Files modified:** `sdks/php/src/Client.php`
**Commit:** 070e98a
**Applied fix:** Added validation check in `wordpress()` factory that throws `SdkException` with specific missing-config details when `serverUrl`, `licenseKey`, or `apiToken` are empty. The exception context includes which values are missing for easier debugging.

### WR-03: Server URL is not validated or restricted to HTTPS in Client constructor

**Files modified:** `sdks/php/src/Client.php`
**Commit:** 62104e0
**Applied fix:** Added HTTPS enforcement in the constructor. Server URLs must use `https://` unless they match localhost/127.0.0.1 or `.test`/`.local` TLDs for local development. Throws `SdkException` with clear error message for non-HTTPS production URLs.

### WR-04: WpCron::showNotices uses `strpos` instead of `stripos`

**Files modified:** `sdks/php/src/WordPress/WpCron.php`
**Commit:** d69b79a
**Applied fix:** Changed `strpos($screen->base, 'conversionflow')` to `stripos()` for case-insensitive matching of admin screen base identifiers.

### WR-05: WpCron::deactivate() does not clear the validation cache

**Files modified:** `sdks/php/src/WordPress/WpCron.php`
**Commit:** e78af3d
**Applied fix:** Added `delete_option()` calls for `conversionflow_cached_validation`, `conversionflow_cache_expires`, and `conversionflow_license_expires` in `deactivate()` to prevent stale cached data from persisting across plugin reactivation.

## Skipped Issues

None -- all in-scope findings were successfully fixed.

---

_Fixed: 2026-06-11T16:50:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
