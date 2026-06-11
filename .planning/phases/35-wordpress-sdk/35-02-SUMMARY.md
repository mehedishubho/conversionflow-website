---
phase: 35-wordpress-sdk
plan: 02
subsystem: sdk, wordpress
tags: [wordpress, wp-cron, wp-transport, wp-updater, wp-settings, wp-logger, psr-3, brain-monkey, auto-update, admin-notices]

# Dependency graph
requires:
  - phase: 35-wordpress-sdk/plan-01
    provides: PHP SDK core (Client, TransportInterface, Response classes, SdkException)
provides:
  - WordPress HTTP transport (WpTransport) using wp_remote_post/wp_remote_get
  - WordPress auto-update integration (WpUpdater) via transient hooks
  - WordPress admin settings helper (WpSettings) with license form, status badge, domain list
  - WordPress cron integration (WpCron) for daily license checks with admin notices
  - PSR-3 to WordPress error_log bridge (WpLogger) with CONVERSIONFLOW_DEBUG gate
  - Client::wordpress() static factory and VERSION constant
  - Brain\Monkey test suite for WordPress integration (12 tests, 24 assertions)
affects: [35-wordpress-sdk/plan-03, 36-laravel-sdk]

# Tech tracking
tech-stack:
  added: [brain/monkey ^2.7 (active usage for WP mocking)]
  patterns: [WordPress transient caching, WP-Cron scheduling, WP admin notices with filter override, static factory pattern, PSR-3 logging bridge]

key-files:
  created:
    - sdks/php/src/WordPress/WpTransport.php
    - sdks/php/src/WordPress/WpLogger.php
    - sdks/php/src/WordPress/WpUpdater.php
    - sdks/php/src/WordPress/WpSettings.php
    - sdks/php/src/WordPress/WpCron.php
    - sdks/php/tests/WordPress/WpUpdaterTest.php
    - sdks/php/tests/WordPress/WpSettingsTest.php
  modified:
    - sdks/php/src/Client.php
deviations: []

decisions:
  - id: impl-wp-transport
    choice: WpTransport wraps wp_remote_post/wp_remote_get directly
    rationale: WordPress HTTP API handles proxy support, SSL verification, and timeout defaults natively
  - id: impl-wp-cache
    choice: Cache helpers check function_exists for WordPress option storage
    rationale: Core SDK works standalone while WordPress integration persists to wp_options
  - id: impl-license-key-security
    choice: License key masked in HTML (last 4 chars only), input type=password
    rationale: WPSDK-03 security requirement
  - id: impl-admin-notices-filter
    choice: conversionflow_show_admin_notices filter allows disabling all notices
    rationale: Per D-25, gives plugin developers control over notice display
