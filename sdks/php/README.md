# ConversionFlow PHP SDK

A PHP client library for the ConversionFlow license server.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PHP](https://img.shields.io/badge/php-%3E%3D7.4-8892BF.svg)

## Installation

### Via Composer (recommended)

```bash
composer require conversionflow/sdk-php
```

### Bundled in a WordPress plugin

Add the SDK as a dependency in your plugin's `composer.json`, then run:

```bash
composer install --no-dev
```

This installs the SDK without development dependencies (PHPUnit, test files). Ship the `vendor/conversionflow/sdk-php/` directory inside your plugin ZIP.

## Requirements

- **PHP 7.4** or higher
- **PHP cURL extension** (for `CurlTransport`), or WordPress HTTP API (for `WpTransport`)
- **psr/log** `^2.0` (installed automatically via Composer)

## Quick Start

### Generic PHP Usage

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use ConversionFlow\Sdk\Client;

// Create a client instance
$client = new Client(
    'https://conversionflow.com',  // Server URL
    'CF-XXXX-XXXX-XXXX-XXXX-XXXX', // License key
    'your-api-token'                // API token
);

// Validate the license
$validation = $client->validate();
if ($validation->isSuccessful()) {
    echo 'License is valid!';
    echo 'Expires at: ' . $validation->getExpiresAt();
} else {
    echo 'Error: ' . $validation->getError();
}

// Activate the license for a domain
$activation = $client->activate('example.com');
if ($activation->isSuccessful()) {
    echo 'Domain activated successfully!';
}

// Check for updates
$update = $client->checkUpdate('1.0.0', 'my-product-slug');
if ($update->hasUpdate()) {
    echo 'New version available: ' . $update->getNewVersion();
}

// Check if a feature is enabled
if ($client->hasFeature('priority-support')) {
    echo 'Priority support is available!';
}
```

### WordPress Integration

The SDK includes dedicated WordPress integration classes that handle HTTP requests, auto-updates, admin settings, scheduled checks, and logging.

```php
<?php
// In your plugin's main file:

use ConversionFlow\Sdk\Client;
use ConversionFlow\Sdk\WordPress\WpUpdater;
use ConversionFlow\Sdk\WordPress\WpCron;
use ConversionFlow\Sdk\WordPress\WpSettings;

// Auto-update integration
$updater = new WpUpdater(
    plugin_basename(__FILE__),  // Plugin file path
    'my-product-slug',          // Product slug from ConversionFlow
    '1.0.0'                     // Current plugin version
);
$updater->register();

// Daily license check via WP-Cron
$cron = new WpCron();
$cron->register();

// Admin settings (call from your admin page callback)
$settings = new WpSettings();
$settings->renderLicenseForm();
$settings->renderStatusBadge();
$settings->renderDomainList();
$settings->handleFormSubmission();

// Zero-config client (reads from WP options automatically)
$client = Client::wordpress();
```

## API Reference

### Client Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `ValidationResponse` | Validate the current license and cache result |
| `activate(string $domain)` | `ActivationResponse` | Activate license for a domain (auto-requests verification token) |
| `deactivate(string $domain)` | `ActivationResponse` | Deactivate license for a domain |
| `getStatus()` | `StatusResponse` | Get full license status including features and activations |
| `checkUpdate(string $version, string $slug)` | `UpdateResponse` | Check for plugin updates (WordPress-compatible format) |
| `getUpdateInfo(string $slug)` | `array` | Get plugin info for WordPress "View details" popup |
| `hasFeature(string $feature)` | `bool` | Check if a feature flag is enabled (reads from cache) |
| `requestVerificationToken(string $domain)` | `VerificationTokenResponse` | Request a domain verification token for activation |
| `setTransport(TransportInterface $t)` | `void` | Set a custom HTTP transport |
| `setLogger(LoggerInterface $logger)` | `void` | Set a PSR-3 logger for debug output |
| `wordpress()` | `Client` | Static factory that auto-discovers config from WP options |

### Response Objects

All response classes share a common interface:

| Method | Returns | Description |
|--------|---------|-------------|
| `isSuccessful()` | `bool` | Whether the API call succeeded |
| `getError()` | `string\|null` | Error message if the call failed |
| `getData()` | `array` | Raw response data from the API |

**ValidationResponse** adds: `getStatus()`, `getExpiresAt()`, `getPlan()`, `getFeatures()`

**StatusResponse** adds: `getActivations()`, `getMaxActivations()`, `getCurrentActivations()`, `getGracePeriodExpiresAt()`

**UpdateResponse** adds: `hasUpdate()`, `getNewVersion()`, `getSlug()`, `getPackage()`, `getUrl()`

**VerificationTokenResponse** adds: `getToken()`

### WordPress Integration Classes

| Class | Description |
|-------|-------------|
| `WpTransport` | HTTP transport using `wp_remote_post` / `wp_remote_get`. Handles proxy support, SSL, and WP HTTP API timeouts. |
| `WpUpdater` | Auto-update integration via `pre_set_site_transient_update_plugins` hook. Caches results for 12 hours. |
| `WpSettings` | Admin settings page helper with license form, status badge, and domain list rendering. License keys are masked in HTML output. |
| `WpCron` | Daily license validation via WP-Cron. Shows admin notices for expiring (7 days), expired, and connection issues. |
| `WpLogger` | PSR-3 logger that bridges to WordPress `error_log()`. Debug levels gated behind `CONVERSIONFLOW_DEBUG` constant. |

## Configuration

### WordPress Options

The SDK reads configuration from WordPress options. These are set automatically when a user fills in the settings form rendered by `WpSettings::renderLicenseForm()`.

| Option Name | Constant Override | Description |
|-------------|-------------------|-------------|
| `conversionflow_server_url` | `CONVERSIONFLOW_SERVER_URL` | ConversionFlow server URL (e.g., `https://conversionflow.com`) |
| `conversionflow_license_key` | `CONVERSIONFLOW_LICENSE_KEY` | License key in `CF-XXXX-XXXX-XXXX-XXXX-XXXX` format |
| `conversionflow_api_token` | `CONVERSIONFLOW_API_TOKEN` | Per-license API token for authentication |
| `conversionflow_product_slug` | `CONVERSIONFLOW_PRODUCT_SLUG` | Product slug configured in ConversionFlow admin |

Constants take priority over options when both are defined (useful for `wp-config.php` deployment).

### Debug Mode

Define the following constant in `wp-config.php` to enable SDK debug logging:

```php
define('CONVERSIONFLOW_DEBUG', true);
```

This causes the `WpLogger` to output `[CF-SDK DEBUG]` prefixed messages to the WordPress debug log for info and debug level messages. Error and warning levels are always logged regardless of this setting.

### Admin Notices Filter

Control whether the SDK shows admin notices (expiry warnings, connection issues):

```php
// Disable all ConversionFlow admin notices
add_filter('conversionflow_show_admin_notices', '__return_false');
```

## Offline Behavior

The SDK is designed to work gracefully when the ConversionFlow server is unreachable:

- **Cached validation**: Successful `validate()` responses are cached for 24 hours. If the server is unreachable, the SDK returns cached data instead of throwing an exception.
- **Update checks**: The `WpUpdater` caches update results for 12 hours. Connection failures do not break the WordPress update flow.
- **Daily cron**: The `WpCron` daily check stores failure state and shows a dismissible admin notice indicating cached data is being used.
- **Admin status badge**: The `WpSettings::renderStatusBadge()` method catches connection errors and displays a "Connection Issue" badge with the remaining cache TTL.

## Versioning

The SDK follows [Semantic Versioning](https://semver.org/). The current version is stored in `Client::VERSION` and exposed via the `CONVERSIONFLOW_SDK_VERSION` constant. The SDK version is independent of the WordPress plugin version.

## License

The ConversionFlow PHP SDK is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
