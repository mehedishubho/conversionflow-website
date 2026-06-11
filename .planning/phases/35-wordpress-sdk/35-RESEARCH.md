# Phase 35: WordPress SDK - Research

**Researched:** 2026-06-11
**Domain:** PHP SDK development, WordPress plugin integration, Composer/Packagist distribution
**Confidence:** HIGH

## Summary

This phase builds a PHP client library (`conversionflow/sdk-php`) in a monorepo subdirectory (`sdks/php/`) that ships inside the WordPress plugin. The SDK calls six existing `/api/v1/*` endpoints on the ConversionFlow server. All server endpoints are fully implemented (Phases 16 and 32), with stable request/response contracts verified by reading route and handler source code.

The SDK consists of a framework-agnostic core (`Client`, `TransportInterface`, Response objects, `SdkException`) plus a WordPress integration layer (`WpTransport`, `WpUpdater`, `WpSettings`, `WpCron`, `WpLogger`). Distribution is via Composer on Packagist and bundled inside the WP plugin ZIP.

**Primary recommendation:** Follow the CONTEXT.md directory structure exactly. Build the framework-agnostic core first (Client + TransportInterface + Responses), then the WordPress integration layer. Use PHPUnit 9 for PHP 7.4 compatibility. The critical gap requiring resolution is the missing verification token issuance API endpoint -- the SDK needs a way to obtain a verification token before calling the activate endpoint.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Monorepo subdirectory at `sdks/php/` inside this Next.js project
- **D-02:** PHP namespace: `ConversionFlow\Sdk`. Composer package: `conversionflow/sdk-php`. PSR-4 autoloading.
- **D-03:** PHP 7.4+ minimum (matches `requires_php: 7.4` from update check API)
- **D-04:** Directory structure follows Composer/Packagist conventions (see CONTEXT.md for full tree)
- **D-05:** Constructor: `new Client($serverUrl, $licenseKey, $apiToken)`. Static helper: `Client::wordpress()`
- **D-06:** Methods return typed Response objects: `validate()`, `activate($domain)`, `deactivate($domain)`, `getStatus()`, `checkUpdate($version, $slug)`, `hasFeature($feature)`
- **D-07:** Each Response has `isSuccessful()`, `getError()`, `getData()` plus typed getters
- **D-08:** `WpSettings` is a helper class (not a registered WP page). Provides `renderLicenseForm()`, `renderStatusBadge()`, `renderDomainList()`.
- **D-09:** Auto-update via WordPress transient hooks: `pre_set_site_transient_update_plugins`, `plugins_api`, `upgrader_post_install`
- **D-10:** Domain verification via automatic meta tag injection through `wp_head` hook
- **D-11:** Primary storage: WordPress options API with specific option names
- **D-12:** Constants in `wp-config.php` take priority over options
- **D-13:** Plugin slug auto-discovery via `plugin_basename()`
- **D-14 through D-16:** TransportInterface abstraction with CurlTransport (default) and WpTransport (WP adapter)
- **D-17 through D-20:** Offline caching with 24h TTL, graceful degradation for update checks
- **D-21 through D-22:** Feature flag helpers checking cached validation `features` map
- **D-23 through D-25:** WP-Cron daily check, admin notices with specific messaging, filter for disabling notices
- **D-26 through D-28:** PHPUnit tests with MockTransport, Brain\Monkey for WP function mocking, CI matrix PHP 7.4 + 8.x
- **D-29 through D-31:** PSR-3 logging with WordPress error_log bridge, debug mode via constant
- **D-32 through D-34:** Dual distribution (Composer + bundled), independent semver, version constant

### Claude's Discretion
- Exact file and class naming within the established structure
- Error code constants and their string values
- Cache key naming in WP options table
- Admin settings HTML/CSS styling details
- PHPUnit test file organization and coverage targets
- CI workflow configuration details
- README.md documentation structure and examples
- Exact response object getter method names

### Deferred Ideas (OUT OF SCOPE)
- Laravel SDK package (Phase 36)
- Shopify app integration (Phase 37)
- Next.js npm package and API security/HMAC signing (Phase 38)
- Building the actual WordPress plugin itself
- WordPress.org plugin directory hosting (DEFER-08)
- Cryptographic offline validation (DEFER-06)
- Hardware fingerprinting (DEFER-07)
- Real-time SDK telemetry dashboard (DEFER-10)
- WordPress multisite support
- Internationalization of admin notices
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WPSDK-01 | PHP client library with activate(), deactivate(), validate(), check_update() methods calling /api/v1/* endpoints | API contracts fully documented from source (6 endpoints). TransportInterface abstraction for framework-agnostic HTTP. Response objects mapped to server JSON shapes. |
| WPSDK-02 | Auto-update integration hooks into WordPress native plugin update system (pre_set_site_transient_update_plugins) | WordPress transient API pattern researched. `WpUpdater` class hooks into 3 WordPress filters. Server returns WordPress-compatible response format from UpdateCheckHandler. |
| WPSDK-03 | Admin settings page helper (license key input, status display, activation management) for WordPress admin panel | `WpSettings` helper class pattern documented. Uses standard WP form APIs (settings_fields, do_settings_sections, submit_button). |
| WPSDK-04 | Composer package (conversionflow/sdk-php) for distribution via Packagist | Packagist submission workflow verified. composer.json structure with PSR-4 autoloading standard. Dual distribution strategy (Composer + bundled). |
| WPSDK-05 | Domain activation and verification helpers working on shared hosting, WP-CLI, and managed WordPress environments | Meta tag injection via wp_head hook. CurlTransport for generic hosts, WpTransport for WP-restricted hosts. Offline cache for shared hosting with restrictive firewalls. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `psr/log` | ^2.0 | PSR-3 LoggerInterface for logging abstraction | PHP-FIG standard, version 2.x supports PHP 7.4+ (version 3.x requires PHP 8.0+) [VERIFIED: Packagist/PHP-FIG] |
| `phpunit/phpunit` | ^9.6 | Unit testing framework | Last PHPUnit version supporting PHP 7.4 (PHPUnit 10+ requires PHP 8.1+) [VERIFIED: phpunit.de/supported-versions] |

### WordPress Testing
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `brain/monkey` | ^2.7 | Mock WordPress functions and hooks in unit tests | All WordPress integration class tests (WpUpdater, WpSettings, WpCron, WpLogger) |
| `mockery/mockery` | ^1.6 | Object mocking framework (Brain Monkey dependency) | Automatic via Brain Monkey dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `brain/monkey` | `wp_mock` (10up/wp-mock) | Brain Monkey is lighter, more focused, well-documented. WP Mock requires more setup and has slower release cadence. |
| `phpunit/phpunit:^9` | `pest/php` | Pest requires PHP 8.1+ and is syntactic sugar over PHPUnit. PHPUnit 9 is the only option for PHP 7.4 compatibility. |
| `psr/log:^2.0` | `psr/log:^1.0` | Version 1.x also works on PHP 7.4 but lacks scalar type hints. Version 2.x adds parameter types while maintaining PHP 7.4 compat. |

**Installation:**
```bash
# Production dependencies
composer require psr/log:^2.0

# Dev dependencies
composer require --dev phpunit/phpunit:^9.6 brain/monkey:^2.7
```

**Version verification:**
- `psr/log` 2.x: Latest in 2.x line supports PHP 7.4+ (verified via Packagist and PHP-FIG GitHub) [VERIFIED: packagist.org/packages/psr/log]
- `phpunit/phpunit` 9.6: Last 9.x release, supports PHP 7.3-8.0 [VERIFIED: phpunit.de/supported-versions]
- `brain/monkey` 2.7.0: Latest stable, requires PHP 7.2+ [VERIFIED: packagist.org/packages/brain/monkey]

## Architecture Patterns

### Recommended Project Structure
```
sdks/php/
├── src/
│   ├── Client.php                    # Main SDK client
│   ├── Response/
│   │   ├── ValidationResponse.php    # Typed response from validate()
│   │   ├── ActivationResponse.php    # Typed response from activate()/deactivate()
│   │   ├── StatusResponse.php        # Typed response from getStatus()
│   │   └── UpdateResponse.php        # Typed response from checkUpdate()
│   ├── Transport/
│   │   ├── TransportInterface.php    # HTTP abstraction
│   │   └── CurlTransport.php         # PHP cURL implementation
│   ├── Exception/
│   │   └── SdkException.php          # Base SDK exception
│   └── WordPress/
│       ├── WpTransport.php           # wp_remote_post/get adapter
│       ├── WpSettings.php            # Admin settings page helper
│       ├── WpUpdater.php             # Auto-update transient hooks
│       ├── WpCron.php                # Daily license check + admin notices
│       └── WpLogger.php              # PSR-3 → error_log bridge
├── tests/
│   ├── ClientTest.php
│   ├── Transport/
│   │   └── MockTransport.php         # Test transport
│   └── WordPress/
│       ├── WpUpdaterTest.php
│       └── WpSettingsTest.php
├── composer.json
├── phpunit.xml
├── .github/workflows/ci.yml
└── README.md
```

### Pattern 1: Framework-Agnostic Core with Platform Adapters
**What:** The `Client` class depends only on `TransportInterface`, never on WordPress functions. Platform-specific adapters (WpTransport, WpLogger, etc.) are in the `WordPress/` namespace.
**When to use:** Always -- this is the core architectural pattern enabling the same SDK core to be reused by the Laravel SDK (Phase 36).
**Example:**
```php
// Source: CONTEXT.md D-14, D-15
interface TransportInterface {
    public function post(string $url, array $body, array $headers = []): array;
    public function get(string $url, array $headers = []): array;
}
```

### Pattern 2: WordPress Transient Hook Integration for Auto-Updates
**What:** Hook into WordPress's built-in update check system rather than building a custom update mechanism.
**When to use:** WpUpdater class registration.
**Example:**
```php
// Source: CONTEXT.md D-09, WordPress developer docs
// Hook into WP's update check
add_filter('pre_set_site_transient_update_plugins', [$this, 'checkForUpdate']);
// Provide plugin info for "View details" popup
add_filter('plugins_api', [$this, 'getPluginInfo'], 10, 3);
// Cleanup after update
add_action('upgrader_post_install', [$this, 'postInstall']);
```

### Pattern 3: Static Factory for WordPress Auto-Discovery
**What:** `Client::wordpress()` reads config from WP options/constants, instantiates with `WpTransport`, zero-config for plugin developers.
**When to use:** WordPress plugin integration entry point.
**Example:**
```php
// Source: CONTEXT.md D-05
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

    $client = new self($serverUrl, $licenseKey, $apiToken);
    $client->setTransport(new WpTransport());
    return $client;
}
```

### Anti-Patterns to Avoid
- **Calling WordPress functions from core SDK classes:** Core Client/Response/Transport classes must never call `get_option()`, `wp_remote_post()`, etc. Only classes in the `WordPress/` namespace do this. [CITED: CONTEXT.md D-14]
- **Hardcoding API endpoint paths:** Use constants or constructor parameters for endpoint URLs. The server URL is configurable, endpoints paths should be class constants.
- **Throwing exceptions on connection failure:** Per D-20, connection failures trigger cache fallback, not exceptions. Only malformed responses and HTTP 5xx throw `SdkException`.
- **Using PHP 8+ features:** No named arguments, union types, match expressions, enums, readonly properties, or fiber support. PHP 7.4 target means typed properties are OK but constructor promotion is NOT.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP transport for WordPress sites | Custom cURL wrapper that handles WP edge cases | `WpTransport` wrapping `wp_remote_post()`/`wp_remote_get()` | Many shared hosts block direct cURL. WordPress HTTP API handles proxies, SSL, cookies, redirects. |
| WordPress function mocking in tests | Custom stubs for `get_option`, `add_filter`, etc. | Brain\Monkey `Functions\when()` and `Actions\expectDone()` | Brain Monkey handles all WP function/hook mocking, integrates with PHPUnit via Mockery. |
| Domain normalization | Custom regex for stripping protocol/www/slash | Match the server's `Domain.create()` rules in PHP | Must match exactly: strip protocol, www, trailing slash, port, lowercase. Mismatch = validation failure. |
| Feature flag checking | API call per feature check | Cached `features` map from last validation | Per D-21, `hasFeature()` reads local cache, no API call. Rate limit is 100 req/min -- cannot check per feature. |
| Semver comparison | Custom string comparison | Simple major.minor.patch parsing (matches server's `SemverCompare.ts`) | Must match server behavior: strip prerelease suffix, compare [major, minor, patch] numerically. |

**Key insight:** The SDK is a thin client -- it does NOT implement business logic. It translates between WordPress/PHP patterns and the ConversionFlow REST API. All business logic (license validation, activation limits, grace periods, feature enforcement) lives on the server.

## Common Pitfalls

### Pitfall 1: Missing Verification Token Issuance API
**What goes wrong:** The SDK's `activate()` method needs a verification token before calling `/api/v1/license/activate`. Currently, verification tokens can ONLY be issued through the portal server action (`issueVerificationToken()` in `portal-licenses.ts`) which requires an authenticated customer session. There is NO public API endpoint to issue verification tokens.
**Why it happens:** The portal flow (Phase 16) was designed for web UI activation where the customer is logged in. The SDK needs an unattended activation flow.
**How to avoid:** This phase MUST either (a) add a new API endpoint `POST /api/v1/license/verification-token` that authenticates via `license_key + api_token` and returns a verification token, or (b) modify the activate endpoint to issue-and-verify in a single call for the `meta` method. Option (a) is cleaner and keeps existing endpoints unchanged.
**Warning signs:** If `activate()` is called without first obtaining a valid verification token, the server returns 403 with `VERIFICATION_FAILED`.

### Pitfall 2: PHP 7.4 Constructor Property Promotion
**What goes wrong:** Using PHP 8 constructor property promotion (`public function __construct(private string $url)`) which is a PHP 8.0+ feature.
**Why it happens:** Developer is used to PHP 8+ syntax.
**How to avoid:** Always declare properties separately: `private string $url;` then assign in constructor body. PHP 7.4 DOES support typed properties but NOT constructor promotion.
**Warning signs:** CI matrix PHP 7.4 build fails with parse error.

### Pitfall 3: WordPress Options Table Cache Busting
**What goes wrong:** `get_option()` returns cached values from WP's object cache. After `update_option()`, a subsequent `get_option()` on the same request may return stale data.
**Why it happens:** WordPress caches option values in memory per request via `wp_load_alloptions()`.
**How to avoid:** After writing to options, read directly from the written value, not from `get_option()`. For cache invalidation across requests, WP handles this automatically via `wp_cache_delete()`.
**Warning signs:** Status display shows stale data immediately after activation.

### Pitfall 4: WordPress Transient Race with Dual Update Checks
**What goes wrong:** WordPress fires `wp_update_plugins` cron and admin page update checks simultaneously. Both set `site_transient_update_plugins`. The SDK's filter runs for both, causing duplicate API calls.
**Why it happens:** WP does not deduplicate transient set operations.
**How to avoid:** Cache the update check result in a WP transient (e.g., `conversionflow_update_check`) with 12-hour TTL. In the `pre_set_site_transient_update_plugins` filter, read from this transient first. Only call the API if the transient is expired.
**Warning signs:** Rate limit hit (100 req/min) on the ConversionFlow server from a single WP site.

### Pitfall 5: Domain Normalization Mismatch
**What goes wrong:** SDK sends `https://www.example.com/` but server normalizes to `example.com`. The domain comparison fails.
**Why it happens:** SDK doesn't apply the same normalization rules as the server's `Domain.create()`.
**How to avoid:** Implement `normalizeDomain()` in PHP that matches exactly: (1) lowercase, (2) strip `https?://` protocol, (3) strip `www.` prefix, (4) strip trailing slashes and paths, (5) strip port numbers, (6) validate hostname format per RFC 1123.
**Warning signs:** Validate and activate calls return `INVALID_LICENSE` for otherwise valid credentials.

### Pitfall 6: cURL Not Available on Shared Hosting
**What goes wrong:** `CurlTransport` fails because `curl_init()` is undefined. Some shared hosts disable the cURL extension.
**Why it happens:** PHP cURL is an extension, not a built-in function.
**How to avoid:** `WpTransport` using `wp_remote_post()`/`wp_remote_get()` handles this -- WordPress has its own HTTP abstraction with multiple fallback transports (cURL, streams, fsockopen). The `Client::wordpress()` factory always uses `WpTransport`.
**Warning signs:** Fatal error "Call to undefined function curl_init()" on specific hosting environments.

## Code Examples

### Domain Normalization (Must Match Server)
```php
// Source: src/shared/domain/valueObjects/Domain.ts (TypeScript server code)
// PHP port must match these exact rules:
private function normalizeDomain(string $input): string
{
    $normalized = strtolower(trim($input));
    // Strip protocol
    $normalized = preg_replace('/^https?:\/\//', '', $normalized);
    // Strip www prefix
    $normalized = preg_replace('/^www\./', '', $normalized);
    // Strip trailing slashes and paths
    $normalized = preg_replace('/\/.*$/', '', $normalized);
    // Strip port numbers
    $normalized = preg_replace('/:\d+$/', '', $normalized);
    return $normalized;
}
```

### WordPress Update Transient Hook Pattern
```php
// Source: CONTEXT.md D-09, WordPress developer docs
// Based on pattern from rudrastyh.com/wordpress/self-hosted-plugin-update.html
public function checkForUpdate($transient)
{
    if (empty($transient->checked)) {
        return $transient;
    }

    // Check our cached result first (avoid duplicate API calls)
    $cached = get_transient('conversionflow_update_check');
    if ($cached !== false) {
        $transient->response[$this->pluginSlug] = $cached;
        return $transient;
    }

    try {
        $client = Client::wordpress();
        $response = $client->checkUpdate(
            $this->installedVersion,
            $this->productSlug
        );

        if ($response->isSuccessful() && $response->hasUpdate()) {
            $pluginData = (object) [
                'slug' => $response->getSlug(),
                'new_version' => $response->getNewVersion(),
                'package' => $response->getDownloadUrl(),
                'url' => $response->getUrl(),
            ];
            $transient->response[$this->pluginFile] = $pluginData;
            set_transient('conversionflow_update_check', $pluginData, 12 * HOUR_IN_SECONDS);
        }
    } catch (SdkException $e) {
        // Per D-18: fail gracefully, no broken notices
    }

    return $transient;
}
```

### Meta Tag Verification Flow (Activation)
```php
// Source: CONTEXT.md D-10, src/modules/licensing/infrastructure/adapters/HttpProofFetcher.ts
// The SDK injects this meta tag via wp_head during activation:
// <meta name="cf-license-verify" content="<token>">

// Step 1: Get verification token from server (requires new API endpoint)
$tokenResponse = $client->requestVerificationToken($domain);
$token = $tokenResponse->getToken();

// Step 2: Store token temporarily for wp_head injection
update_option('conversionflow_verify_token', $token);

// Step 3: Add wp_head hook that outputs the meta tag
add_action('wp_head', function() {
    $token = get_option('conversionflow_verify_token');
    if ($token) {
        echo '<meta name="cf-license-verify" content="' . esc_attr($token) . '">' . "\n";
    }
});

// Step 4: Call activate API (server fetches the meta tag server-side)
$activationResponse = $client->activate($domain);

// Step 5: Clean up meta tag on success
if ($activationResponse->isSuccessful()) {
    delete_option('conversionflow_verify_token');
}
```

### PHPUnit Test with Brain\Monkey
```php
// Source: CONTEXT.md D-28, brain/monkey docs (giuseppe-mazzapica.gitbook.io/brain-monkey)
use Brain\Monkey;
use Brain\Monkey\Functions;

class WpUpdaterTest extends \PHPUnit\Framework\TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Monkey\setUp();
    }

    protected function tearDown(): void
    {
        Monkey\tearDown();
        parent::tearDown();
    }

    public function testCheckForUpdateReturnsTransientUnmodifiedWhenNoCheckedPlugins()
    {
        Functions\when('get_transient')->justReturn(false);

        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product');
        $transient = (object) ['checked' => []];

        $result = $updater->checkForUpdate($transient);
        $this->assertSame($transient, $result);
    }
}
```

### Response Object Pattern
```php
// Source: CONTEXT.md D-06, D-07
// Maps to server response from /api/v1/license/validate route.ts
class ValidationResponse
{
    private bool $valid;
    private ?string $licenseId;
    private ?string $plan;
    private ?string $expiresAt;
    private ?string $gracePeriodExpiresAt;
    private ?int $maxActivations;
    private ?int $currentActivations;
    private ?string $error;

    public function __construct(array $data)
    {
        $this->valid = $data['valid'] ?? false;
        $this->licenseId = $data['license_id'] ?? null;
        $this->plan = $data['plan'] ?? null;
        $this->expiresAt = $data['expires_at'] ?? null;
        $this->gracePeriodExpiresAt = $data['grace_period_expires_at'] ?? null;
        $this->maxActivations = $data['max_activations'] ?? null;
        $this->currentActivations = $data['current_activations'] ?? null;
        $this->error = $data['error'] ?? null;
    }

    public function isSuccessful(): bool { return $this->valid; }
    public function getError(): ?string { return $this->error; }
    public function getData(): array { return get_object_vars($this); }
    public function getPlan(): ?string { return $this->plan; }
    public function getExpiresAt(): ?string { return $this->expiresAt; }
    // ... other typed getters
}
```

## API Endpoint Contracts (Verified from Source)

The SDK calls these six endpoints. All contracts were read directly from the route.ts files.

### POST /api/v1/license/validate
**Request:** `{license_key, domain, api_token}`
**Success (200):** `{valid:true, license_id, plan, expires_at, grace_period_expires_at, max_activations, current_activations, error:null}`
**Failure (404):** `{valid:false, license_id:null, plan:null, expires_at:null, max_activations:null, current_activations:null, error:"INVALID_LICENSE"}`
**Rate limited (429):** `{valid:false, ..., error:"RATE_LIMITED"}` with `Retry-After` header
[VERIFIED: src/app/api/v1/license/validate/route.ts]

### POST /api/v1/license/activate
**Request:** `{license_key, api_token, domain, verification_method:"meta"|"dns"|"file", verification_token}`
**Success (200):** `{valid:true, license_id, plan, expires_at, max_activations, current_activations, error:null}`
**Errors (400/403/404/409):** INVALID_REQUEST, VERIFICATION_FAILED (403), ACTIVATION_LIMIT_REACHED (403), ALREADY_ACTIVATED (409), INVALID_LICENSE (404)
[VERIFIED: src/app/api/v1/license/activate/route.ts]

### POST /api/v1/license/deactivate
**Request:** `{license_key, api_token, domain}`
**Success (200):** `{valid:true, license_id, plan, expires_at, max_activations, current_activations, error:null}`
**Failure (404):** `{valid:false, ..., error: "INVALID_LICENSE"}`
[VERIFIED: src/app/api/v1/license/deactivate/route.ts]

### POST /api/v1/license/status
**Request:** `{license_key, domain, api_token}`
**Success (200):** `{valid:true, license_id, status, plan:{name,slug}, product:{name,slug}, expires_at, grace_period_expires_at, max_activations, current_activations, activations:[{domain,activated_at}], features:{}, license_type}`
[VERIFIED: src/app/api/v1/license/status/route.ts + LicenseStatusHandler.ts]

### POST /api/v1/update/check
**Request:** `{license_key, domain, api_token, installed_version, product_slug}`
**No update (200):** `{update_available:false}`
**Update available (200):** `{update_available:true, slug, new_version, url, package (signed download URL), download_url, last_updated, sections:{description,changelog,installation}, requires:"5.0", tested:"6.5", requires_php:"7.4"}`
[VERIFIED: src/app/api/v1/update/check/route.ts + UpdateCheckHandler.ts]

### POST /api/v1/update/info
**Request:** `{license_key, domain, api_token, product_slug}`
**Purpose:** WordPress "View details" popup data via `plugins_api` filter
[VERIFIED: src/app/api/v1/update/info/route.ts]

### GET /api/v1/update/download?token={signed_token}
**Purpose:** ZIP file download (SDK receives the URL from update check response, does not construct it)
**Response:** Binary ZIP stream with `Content-Type: application/zip`
[VERIFIED: src/app/api/v1/update/download/route.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PHPUnit 8.x | PHPUnit 9.x for PHP 7.4 support | PHPUnit 9 released 2020 | PHPUnit 9 is the last version supporting PHP 7.4. PHPUnit 10+ requires PHP 8.1+. |
| psr/log 1.x | psr/log 2.x for PHP 7.4+ | psr/log 2.0 released 2021 | Version 2.x adds scalar parameter types. Version 3.x adds return types but requires PHP 8.0+. |
| WordPress manual plugin updates | Self-hosted update API via transients | WordPress 3.8+ | `pre_set_site_transient_update_plugins` is the standard hook for custom update servers. |

**Deprecated/outdated:**
- PHPUnit 8.x: End of life. Use PHPUnit 9.x for PHP 7.4 support.
- psr/log 1.x: Still works but lacks type declarations. Use 2.x for PHP 7.4+ compatibility with modern typing.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A new API endpoint `POST /api/v1/license/verification-token` (or similar) will need to be created as part of this phase to enable SDK-driven domain activation. Currently verification tokens can only be issued via the portal server action which requires an authenticated customer session. | Architecture / Pitfall 1 | If this endpoint cannot be added, the activation flow requires the customer to log into the portal first to get a verification token, breaking the "click Activate in WP admin" UX described in CONTEXT.md. |
| A2 | The `sdks/` directory does not yet exist and must be created. | Architecture | If another phase creates it first, directory creation steps become redundant. |
| A3 | License key format is accepted as-is by the server (the SDK sends the raw key string, server handles parsing via `LicenseKey.create()`). The SDK does not need to validate key format client-side beyond non-empty check. | API Contracts | If server rejects certain formats the SDK should catch early, the UX will be poor (server error instead of client-side validation). |

## Open Questions

1. **Verification Token API Endpoint**
   - What we know: The activate endpoint requires a `verification_token` that must be issued server-side via `VerificationTokenIssuer.issue()`. Currently this only exists as a portal server action requiring authenticated customer session.
   - What's unclear: Does the planner intend to create a new public API endpoint for verification token issuance as part of this phase, or should the SDK assume the customer pre-obtains a token from the portal?
   - Recommendation: Add `POST /api/v1/license/verification-token` endpoint (auth via `license_key + api_token`, returns `{token: "..."}`). This enables the seamless "click Activate in WP admin" flow described in CONTEXT.md D-10. Add this as a task in the plan.

2. **License Key Format Validation in SDK**
   - What we know: Server's `LicenseKey.create()` strips hyphens/spaces, uppercases, validates length 12-32 chars, and rejects ambiguous characters (0, O, 1, I, L).
   - What's unclear: Should the SDK replicate this validation client-side before making API calls?
   - Recommendation: Minimal client-side validation only (non-empty, reasonable length). Let the server be the source of truth for format validation. The server returns identical error responses regardless, so client-side validation provides minimal UX benefit.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PHP | SDK runtime + tests | Needs verification on target | 7.4+ required | -- |
| Composer | Package management + autoloading | Needs verification on target | 2.x | -- |
| cURL extension | CurlTransport | Most PHP hosts | varies | WpTransport (uses WP HTTP API) |
| GitHub Actions | CI pipeline | External service | — | Manual test runs |
| Packagist account | Package distribution | Needs creation | — | Composer path repository (local dev) |

**Missing dependencies with no fallback:**
- None that block SDK development. The SDK itself has no runtime dependencies beyond PHP 7.4+ and `psr/log ^2.0`.

**Missing dependencies with fallback:**
- cURL: WpTransport provides fallback for hosts where cURL is disabled.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | PHPUnit 9.6 |
| Config file | `sdks/php/phpunit.xml` (to be created) |
| Quick run command | `cd sdks/php && vendor/bin/phpunit --no-coverage` |
| Full suite command | `cd sdks/php && vendor/bin/phpunit` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WPSDK-01 | Client.validate() calls correct API endpoint and returns ValidationResponse | unit | `cd sdks/php && vendor/bin/phpunit tests/ClientTest.php --filter testValidate` | Wave 0 |
| WPSDK-01 | Client.activate() sends domain + verification_token to activate endpoint | unit | `cd sdks/php && vendor/bin/phpunit tests/ClientTest.php --filter testActivate` | Wave 0 |
| WPSDK-01 | Client.deactivate() sends correct request | unit | `cd sdks/php && vendor/bin/phpunit tests/ClientTest.php --filter testDeactivate` | Wave 0 |
| WPSDK-01 | Client.checkUpdate() returns UpdateResponse with update_available flag | unit | `cd sdks/php && vendor/bin/phpunit tests/ClientTest.php --filter testCheckUpdate` | Wave 0 |
| WPSDK-02 | WpUpdater hooks into pre_set_site_transient_update_plugins correctly | unit | `cd sdks/php && vendor/bin/phpunit tests/WordPress/WpUpdaterTest.php` | Wave 0 |
| WPSDK-03 | WpSettings renderLicenseForm() outputs expected HTML | unit | `cd sdks/php && vendor/bin/phpunit tests/WordPress/WpSettingsTest.php` | Wave 0 |
| WPSDK-04 | composer.json validates and PSR-4 autoloading works | smoke | `cd sdks/php && composer validate && composer dump-autoload` | Wave 0 |
| WPSDK-05 | Domain normalization matches server rules | unit | `cd sdks/php && vendor/bin/phpunit tests/ClientTest.php --filter testNormalizeDomain` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd sdks/php && vendor/bin/phpunit --no-coverage`
- **Per wave merge:** `cd sdks/php && vendor/bin/phpunit`
- **Phase gate:** Full suite green + `composer validate` + `composer dump-autoload` dry run

### Wave 0 Gaps
- [ ] `sdks/php/phpunit.xml` -- PHPUnit configuration for PHP 7.4+ compatibility
- [ ] `sdks/php/tests/ClientTest.php` -- covers WPSDK-01 core client methods
- [ ] `sdks/php/tests/Transport/MockTransport.php` -- test transport implementing TransportInterface
- [ ] `sdks/php/tests/WordPress/WpUpdaterTest.php` -- covers WPSDK-02 auto-update hooks
- [ ] `sdks/php/tests/WordPress/WpSettingsTest.php` -- covers WPSDK-03 admin settings
- [ ] Framework install: `cd sdks/php && composer require --dev phpunit/phpunit:^9.6 brain/monkey:^2.7`
- [ ] Directory creation: `mkdir -p sdks/php/{src,tests}`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Per-license API token auth on every request (license_key + api_token + domain) |
| V3 Session Management | no | Stateless SDK, no sessions |
| V4 Access Control | yes | Domain-scoped operations, activation limit enforcement (server-side) |
| V5 Input Validation | yes | Domain normalization matching server rules, non-empty checks before API calls |
| V6 Cryptography | yes | Verification tokens (server-issued, 32-hex, single-use, Redis GETDEL). Download tokens (HMAC-signed, 2h expiry). SDK never handles crypto directly. |

### Known Threat Patterns for PHP/WordPress SDK

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API token exposure in wp-config.php | Information Disclosure | Document that `CONVERSIONFLOW_*` constants should use secure file permissions. The API token is per-license, not global. |
| Verification token replay | Tampering | Server handles prevention via Redis GETDEL (single-use). SDK just consumes the token once. |
| Domain spoofing in meta tag | Spoofing | Server fetches meta tag directly (never trusts client). Meta tag content must match the token issued by the server. |
| Rate limit exhaustion from WP-Cron | Denial of Service | SDK caches update checks in WP transient with 12h TTL. Daily cron = 1 validate call. WP update checks = cached. |
| Supply chain (Composer) | Tampering | Composer checksum verification. Packagist serves as distribution point. `composer.lock` pins exact versions. |

## Sources

### Primary (HIGH confidence)
- `src/app/api/v1/license/validate/route.ts` -- Validate endpoint contract
- `src/app/api/v1/license/activate/route.ts` -- Activate endpoint contract
- `src/app/api/v1/license/deactivate/route.ts` -- Deactivate endpoint contract
- `src/app/api/v1/license/status/route.ts` -- Status endpoint contract
- `src/app/api/v1/update/check/route.ts` -- Update check endpoint contract
- `src/app/api/v1/update/download/route.ts` -- Download endpoint contract
- `src/app/api/v1/update/info/route.ts` -- Update info endpoint contract
- `src/modules/licensing/application/commands/ValidateLicenseHandler.ts` -- Validation flow + response shape
- `src/modules/licensing/application/commands/ActivateLicenseHandler.ts` -- Activation flow + verification methods
- `src/modules/licensing/application/commands/LicenseStatusHandler.ts` -- Status response shape (features map, activations array)
- `src/modules/licensing/application/commands/UpdateCheckHandler.ts` -- Update check response (WordPress-compatible format)
- `src/shared/domain/valueObjects/Domain.ts` -- Domain normalization rules (PHP port must match)
- `src/shared/domain/valueObjects/LicenseKey.ts` -- License key format rules
- `src/modules/licensing/domain/services/VerificationTokenIssuer.ts` -- Token issuance/consumption (Redis GETDEL)
- `src/modules/licensing/infrastructure/adapters/HttpProofFetcher.ts` -- Meta tag verification pattern (`cf-license-verify`)

### Secondary (MEDIUM confidence)
- [phpunit.de/supported-versions](https://phpunit.de/supported-versions.html) -- PHPUnit version compatibility matrix
- [packagist.org/packages/psr/log](https://packagist.org/packages/psr/log) -- PSR-3 package versions
- [packagist.org/packages/brain/monkey](https://packagist.org/packages/brain/monkey) -- Brain Monkey 2.7.0, PHP 7.2+
- [packagist.org/packages/phpunit/phpunit](https://packagist.org/packages/phpunit/phpunit) -- PHPUnit package page

### Tertiary (LOW confidence)
- [rudrastyh.com/wordpress/self-hosted-plugin-update.html](https://rudrastyh.com/wordpress/self-hosted-plugin-update.html) -- WordPress self-hosted update tutorial (community resource)
- [developer.wordpress.org/reference/functions/plugins_api](https://developer.wordpress.org/reference/functions/plugins_api/) -- WordPress plugins_api filter documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified against Packagist and phpunit.de
- Architecture: HIGH - directory structure and patterns locked in CONTEXT.md, API contracts read from source
- Pitfalls: HIGH - critical verification token gap identified from source code analysis, PHP 7.4 constraints verified
- API contracts: HIGH - all 6+1 endpoint request/response shapes read directly from route.ts files

**Research date:** 2026-06-11
**Valid until:** 2026-07-11 (30 days -- PHP ecosystem is stable)
