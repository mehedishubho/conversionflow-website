<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Tests\WordPress;

use Brain\Monkey;
use Brain\Monkey\Functions;
use ConversionFlow\Sdk\WordPress\WpSettings;
use PHPUnit\Framework\TestCase;

/**
 * Tests for WpSettings WordPress admin settings helper.
 *
 * Per D-28: Uses Brain\Monkey for WP function mocking.
 * Tests verify HTML output contains expected fields and
 * security requirements (masked license key, per T-35-08).
 */
class WpSettingsTest extends TestCase
{
    /**
     * Mock common WP functions needed by WpSettings.
     */
    private function mockWpHelperFunctions(): void
    {
        Functions\when('esc_attr')->alias(function ($text) {
            return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
        });
        Functions\when('esc_html')->alias(function ($text) {
            return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
        });
        Functions\when('esc_url_raw')->alias(function ($url) {
            return filter_var($url, FILTER_SANITIZE_URL);
        });
        Functions\when('sanitize_text_field')->alias(function ($str) {
            return strip_tags((string) $str);
        });
    }

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

    /**
     * Test that renderLicenseForm contains expected input fields.
     */
    public function testRenderLicenseFormContainsExpectedFields(): void
    {
        Functions\when('get_option')->justReturn('');
        Functions\when('settings_fields')->justEcho('');
        Functions\when('do_settings_sections')->justEcho('');
        Functions\when('submit_button')->justEcho('<input type="submit" />');
        $this->mockWpHelperFunctions();

        $settings = new WpSettings();

        ob_start();
        $settings->renderLicenseForm();
        $output = ob_get_clean();

        // Verify all 4 expected fields are present
        $this->assertStringContainsString('name="conversionflow_license_key"', $output);
        $this->assertStringContainsString('name="conversionflow_server_url"', $output);
        $this->assertStringContainsString('name="conversionflow_api_token"', $output);
        $this->assertStringContainsString('name="conversionflow_product_slug"', $output);

        // Verify form structure
        $this->assertStringContainsString('conversionflow-settings', $output);
        $this->assertStringContainsString('form-table', $output);
    }

    /**
     * Test that renderLicenseForm does NOT echo the full license key.
     * Per T-35-08: license key is masked, showing only last 4 chars.
     */
    public function testRenderLicenseFormDoesNotEchoFullKey(): void
    {
        Functions\when('get_option')->alias(function ($key, $default = '') {
            if ($key === 'conversionflow_license_key') {
                return 'CF-TEST-1234-5678-ABCD';
            }
            return $default;
        });
        Functions\when('settings_fields')->justEcho('');
        Functions\when('do_settings_sections')->justEcho('');
        Functions\when('submit_button')->justEcho('<input type="submit" />');
        $this->mockWpHelperFunctions();

        $settings = new WpSettings();

        ob_start();
        $settings->renderLicenseForm();
        $output = ob_get_clean();

        // Full key must NOT appear in output
        $this->assertStringNotContainsString('CF-TEST-1234-5678-ABCD', $output);

        // Masked version should show last 4 chars
        $this->assertStringContainsString('ABCD', $output);

        // Should contain asterisks for masking
        $this->assertStringContainsString('****', $output);
    }

    /**
     * Test that renderStatusBadge shows "Active" for valid license.
     * Uses reflection to set a mock Client response rather than calling Client::wordpress().
     */
    public function testRenderStatusBadgeShowsActiveForValid(): void
    {
        Functions\when('get_option')->alias(function ($key, $default = '') {
            $map = [
                'conversionflow_server_url' => 'https://api.example.com',
                'conversionflow_license_key' => 'CF-TEST',
                'conversionflow_api_token' => 'token',
                'conversionflow_cache_expires' => null,
            ];
            return $map[$key] ?? $default;
        });

        // Mock WP HTTP API functions for WpTransport
        Functions\when('wp_remote_post')->justReturn([
            'response' => ['code' => 200],
            'body' => json_encode([
                'valid' => true,
                'status' => 'active',
                'plan' => ['name' => 'Professional', 'slug' => 'professional'],
                'expires_at' => '2027-01-01T00:00:00.000Z',
                'max_activations' => 5,
                'current_activations' => 2,
                'activations' => [],
                'features' => [],
            ]),
        ]);
        Functions\when('is_wp_error')->justReturn(false);
        Functions\when('wp_remote_retrieve_response_code')->justReturn(200);
        Functions\when('wp_remote_retrieve_body')->justReturn(json_encode([
            'valid' => true,
            'status' => 'active',
            'plan' => ['name' => 'Professional', 'slug' => 'professional'],
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 2,
            'activations' => [],
            'features' => [],
        ]));
        $this->mockWpHelperFunctions();

        $settings = new WpSettings();

        ob_start();
        $settings->renderStatusBadge();
        $output = ob_get_clean();

        $this->assertStringContainsString('Active', $output);
    }

    /**
     * Test that renderStatusBadge shows expired/invalid for failed response.
     */
    public function testRenderStatusBadgeShowsExpiredForInvalid(): void
    {
        Functions\when('get_option')->alias(function ($key, $default = '') {
            $map = [
                'conversionflow_server_url' => 'https://api.example.com',
                'conversionflow_license_key' => 'CF-TEST',
                'conversionflow_api_token' => 'token',
            ];
            return $map[$key] ?? $default;
        });

        Functions\when('wp_remote_post')->justReturn([
            'response' => ['code' => 404],
            'body' => json_encode([
                'valid' => false,
                'error' => 'INVALID_LICENSE',
            ]),
        ]);
        Functions\when('is_wp_error')->justReturn(false);
        Functions\when('wp_remote_retrieve_response_code')->justReturn(404);
        Functions\when('wp_remote_retrieve_body')->justReturn(json_encode([
            'valid' => false,
            'error' => 'INVALID_LICENSE',
        ]));
        $this->mockWpHelperFunctions();

        $settings = new WpSettings();

        ob_start();
        $settings->renderStatusBadge();
        $output = ob_get_clean();

        $this->assertStringContainsString('Expired', $output);
    }

    /**
     * Test that renderDomainList shows activated domains from status response.
     */
    public function testRenderDomainListShowsActivatedDomains(): void
    {
        Functions\when('get_option')->alias(function ($key, $default = '') {
            $map = [
                'conversionflow_server_url' => 'https://api.example.com',
                'conversionflow_license_key' => 'CF-TEST',
                'conversionflow_api_token' => 'token',
            ];
            return $map[$key] ?? $default;
        });

        Functions\when('wp_remote_post')->justReturn([
            'response' => ['code' => 200],
            'body' => json_encode([
                'valid' => true,
                'status' => 'active',
                'activations' => [
                    ['domain' => 'shop.example.com', 'activated_at' => '2026-01-15T10:30:00.000Z'],
                    ['domain' => 'mystore.bd', 'activated_at' => '2026-03-20T14:00:00.000Z'],
                ],
                'features' => [],
            ]),
        ]);
        Functions\when('is_wp_error')->justReturn(false);
        Functions\when('wp_remote_retrieve_response_code')->justReturn(200);
        Functions\when('wp_remote_retrieve_body')->justReturn(json_encode([
            'valid' => true,
            'status' => 'active',
            'activations' => [
                ['domain' => 'shop.example.com', 'activated_at' => '2026-01-15T10:30:00.000Z'],
                ['domain' => 'mystore.bd', 'activated_at' => '2026-03-20T14:00:00.000Z'],
            ],
            'features' => [],
        ]));
        Functions\when('wp_nonce_field')->justEcho('<input type="hidden" name="_wpnonce" />');
        $this->mockWpHelperFunctions();

        $settings = new WpSettings();

        ob_start();
        $settings->renderDomainList();
        $output = ob_get_clean();

        // Both domains should appear in output
        $this->assertStringContainsString('shop.example.com', $output);
        $this->assertStringContainsString('mystore.bd', $output);

        // Table structure should be present
        $this->assertStringContainsString('conversionflow-domain-list', $output);

        // Deactivate button should be present
        $this->assertStringContainsString('Deactivate', $output);
    }
}
