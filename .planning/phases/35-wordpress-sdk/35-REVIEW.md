---
phase: 35-wordpress-sdk
reviewed: 2026-06-11T16:35:00Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - .github/workflows/sdk-php-ci.yml
  - sdks/php/.gitattributes
  - sdks/php/.gitignore
  - sdks/php/README.md
  - sdks/php/composer.json
  - sdks/php/phpunit.xml
  - sdks/php/src/Client.php
  - sdks/php/src/Exception/SdkException.php
  - sdks/php/src/Response/ActivationResponse.php
  - sdks/php/src/Response/StatusResponse.php
  - sdks/php/src/Response/UpdateResponse.php
  - sdks/php/src/Response/ValidationResponse.php
  - sdks/php/src/Response/VerificationTokenResponse.php
  - sdks/php/src/Transport/CurlTransport.php
  - sdks/php/src/Transport/TransportInterface.php
  - sdks/php/src/WordPress/WpCron.php
  - sdks/php/src/WordPress/WpLogger.php
  - sdks/php/src/WordPress/WpSettings.php
  - sdks/php/src/WordPress/WpTransport.php
  - sdks/php/src/WordPress/WpUpdater.php
  - sdks/php/tests/ClientTest.php
  - sdks/php/tests/Transport/MockTransport.php
  - sdks/php/tests/WordPress/WpSettingsTest.php
  - sdks/php/tests/WordPress/WpUpdaterTest.php
  - src/app/api/v1/license/verification-token/route.ts
findings:
  critical: 2
  warning: 5
  info: 4
  total: 11
status: issues_found
---

# Phase 35: Code Review Report

**Reviewed:** 2026-06-11T16:35:00Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

Reviewed the complete ConversionFlow PHP SDK implementation (23 files), including the client library, WordPress integration layer, response objects, transport abstraction, tests, CI workflow, and the server-side verification-token route.

The SDK is well-structured with proper separation of concerns, good defensive coding (cache fallback on failure, nonce verification, license key masking in HTML). However, there are two critical security issues in the API token handling and open redirect potential, plus several warnings around missing SSL verification in cURL and unvalidated server URL configuration.

## Critical Issues

### CR-01: API token exposed in cleartext via HTML form value attribute

**File:** `sdks/php/src/WordPress/WpSettings.php:89-91`
**Issue:** The API token is placed directly into the `value` attribute of an `<input type="password">` field using `esc_attr($apiToken)`. While the input type is `password` (so browsers mask it visually), the full API token value is present in the HTML source. Any admin page visitor, browser extension, or screen reader can access it. The license key field correctly avoids this by leaving the value empty and showing only a masked display, but the API token field does not follow the same pattern. This is an information disclosure vulnerability -- the API token grants full license management access.
**Fix:**
```php
// In renderLicenseForm(), change the API Token field to match the license key pattern:
echo '<input type="password" name="conversionflow_api_token" id="conversionflow_api_token" ';
echo 'value="" class="regular-text" placeholder="Enter API token" />';
if (!empty($apiToken)) {
    $masked = str_repeat('*', strlen($apiToken) - 4) . substr($apiToken, -4);
    echo '<p class="description">Current: ' . esc_html($masked) . '</p>';
}
```

### CR-02: Open redirect via unsanitized `$_SERVER['REQUEST_URI']` in wp_redirect

**File:** `sdks/php/src/WordPress/WpSettings.php:317`
**Issue:** `wp_redirect(admin_url($_SERVER['REQUEST_URI'] ?? ''))` passes user-controlled `REQUEST_URI` directly into `wp_redirect()` without sanitization. While `admin_url()` prefixes it with the admin base URL, `REQUEST_URI` can contain malicious path components or query strings that may bypass redirect validation in some WordPress versions. This is an open redirect vector.
**Fix:**
```php
// Sanitize REQUEST_URI before passing to admin_url
$redirectUrl = admin_url(sanitize_text_field($_SERVER['REQUEST_URI'] ?? ''));
wp_redirect($redirectUrl);
exit;
```

## Warnings

### WR-01: CurlTransport does not set SSL verification options

**File:** `sdks/php/src/Transport/CurlTransport.php:41-48` and `sdks/php/src/Transport/CurlTransport.php:90-96`
**Issue:** Neither the `post()` nor `get()` methods set `CURLOPT_SSL_VERIFYPEER` or `CURLOPT_SSL_VERIFYHOST`. While cURL defaults to verifying SSL certificates (these default to `true`/`2`), explicitly setting them documents the security intent and prevents issues on systems where the default php.ini or cURL build has disabled verification. Additionally, `CURLOPT_FOLLOWLOCATION` is not set, meaning redirects are not followed -- but this is actually fine since following redirects automatically can be a security risk.
**Fix:**
```php
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $jsonBody,
    CURLOPT_HTTPHEADER => $allHeaders,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => self::TIMEOUT,
    CURLOPT_HEADER => false,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
]);
```

### WR-02: Client::wordpress() does not validate that required config values are present

**File:** `sdks/php/src/Client.php:332-349`
**Issue:** The `wordpress()` factory reads server URL, license key, and API token from WordPress options or constants but does not check whether any of them are empty. If no configuration has been set, the method returns a Client with empty strings, which will produce confusing error messages (e.g., "Invalid JSON response from server" instead of "SDK not configured"). This is a usability and debugging concern.
**Fix:**
```php
public static function wordpress(): self
{
    $serverUrl = defined('CONVERSIONFLOW_SERVER_URL')
        ? CONVERSIONFLOW_SERVER_URL
        : get_option('conversionflow_server_url', '');
    $licenseKey = defined('CONVERSIONFLOW_LICENSE_KEY')
        ? CONVERSIONFLOW_LICENSE_KEY
        : get_option('conversionflow_license_key', '');
    $apiToken = defined('CONVERSIONFLOW_API_TOKEN')
        ? CONVERSIONFLOW_API_TOKEN
        : get_option('conversionflow_api_token', '');

    if (empty($serverUrl) || empty($licenseKey) || empty($apiToken)) {
        throw new SdkException(
            'ConversionFlow SDK not configured. Set server URL, license key, and API token via WordPress options or wp-config.php constants.',
            0,
            ['missing' => array_filter([
                'serverUrl' => empty($serverUrl),
                'licenseKey' => empty($licenseKey),
                'apiToken' => empty($apiToken),
            ])]
        );
    }

    $client = new self($serverUrl, $licenseKey, $apiToken);
    $client->setTransport(new WpTransport());
    $client->setLogger(new WpLogger());
    return $client;
}
```

### WR-03: Server URL is not validated or restricted to HTTPS in Client constructor

**File:** `sdks/php/src/Client.php:87-99`
**Issue:** The `$serverUrl` parameter accepts any string. If a user configures `http://` (instead of `https://`), all license keys and API tokens will be transmitted in cleartext over the network. The SDK should enforce HTTPS for the server URL.
**Fix:**
```php
public function __construct(string $serverUrl, string $licenseKey, string $apiToken)
{
    $this->serverUrl = rtrim($serverUrl, '/');
    // Enforce HTTPS
    if (strpos($this->serverUrl, 'https://') !== 0) {
        throw new SdkException(
            'Server URL must use HTTPS. Got: ' . $this->serverUrl,
            0,
            ['serverUrl' => $this->serverUrl]
        );
    }
    // ... rest of constructor
}
```
Note: Consider allowing `http://` for local development (e.g., `localhost`, `.test`, `.local`) but enforce HTTPS for production domains.

### WR-04: WpCron::showNotices uses `strpos` instead of `str_contains` (PHP 8.0+) or `stripos`

**File:** `sdks/php/src/WordPress/WpCron.php:112`
**Issue:** `strpos($screen->base, 'conversionflow') === false` performs a case-sensitive search. If any WordPress admin screen uses different casing in the base identifier, the check would fail to match. Since the SDK supports PHP 7.4+, `strpos` is correct for compatibility, but the comparison should at minimum be documented as intentionally case-sensitive. This is a minor logic gap, not a bug.
**Fix:** This is low-severity. If case-insensitive matching is desired:
```php
if ($screen && $screen->base !== 'plugins' && stripos($screen->base, 'conversionflow') === false) {
    return;
}
```

### WR-05: WpCron::deactivate() does not clear the validation cache

**File:** `sdks/php/src/WordPress/WpCron.php:158-165`
**Issue:** The `deactivate()` method clears expiry warnings and failure state options, but does not clear the cached validation data (`conversionflow_cached_validation`, `conversionflow_cache_expires`). If the plugin is reactivated, stale cached validation data from a previous installation could be served for up to 24 hours.
**Fix:**
```php
public function deactivate(): void
{
    wp_clear_scheduled_hook(self::CRON_HOOK);
    delete_option('conversionflow_expiry_warning');
    delete_option('conversionflow_license_expired');
    delete_option('conversionflow_last_check_failure');
    delete_option('conversionflow_cached_validation');
    delete_option('conversionflow_cache_expires');
    delete_option('conversionflow_license_expires');
}
```

## Info

### IN-01: CI workflow uses deprecated `--no-suggest` flag

**File:** `.github/workflows/sdk-php-ci.yml:38`
**Issue:** Composer 2.x removed the `--no-suggest` flag (suggestions are no longer shown by default). This will produce a warning in the CI output.
**Fix:** Remove `--no-suggest` from the `composer install` command:
```yaml
run: composer install --prefer-dist --no-progress
```

### IN-02: MockTransport type hint uses `\Exception` instead of `\Throwable`

**File:** `sdks/php/tests/Transport/MockTransport.php:23` and `sdks/php/tests/Transport/MockTransport.php:43`
**Issue:** The `$exception` property is typed as `?\Exception` and `setException()` accepts `\Exception`, but the SDK's own `SdkException` extends `\Exception` so this works in practice. However, using `\Throwable` would be more broadly correct and matches PHP best practices for catch/throw patterns. This is a test file so it has no production impact.
**Fix:** Minor improvement only, not required for correctness.

### IN-03: Multiple `echo` statements in WpSettings and WpCron could be consolidated

**File:** `sdks/php/src/WordPress/WpSettings.php:54-108` and `sdks/php/src/WordPress/WpCron.php:119-148`
**Issue:** HTML output is built with many consecutive `echo` statements. While functionally correct, using heredoc syntax or output buffering would improve readability. This is a style observation only.
**Fix:** No action required. This follows a common WordPress plugin convention.

### IN-04: Server-side route returns HTTP 404 for validation errors that are not "not found"

**File:** `src/app/api/v1/license/verification-token/route.ts:76-84` and `route.ts:90-98`
**Issue:** When the license key fails to parse or the domain fails to normalize, the server responds with HTTP 404 and error `INVALID_LICENSE`. While this is a deliberate design choice (to avoid revealing whether a license key exists), the semantic mismatch between "malformed input" and "404 Not Found" could confuse API consumers. Similarly, `INVALID_LICENSE` is used for both "key doesn't exist" and "token validation failed" at line 116-128. This is an API design observation, not a bug.
**Fix:** Document the intentional use of 404 for all authentication/authorization failures in the API specification.

---

_Reviewed: 2026-06-11T16:35:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
