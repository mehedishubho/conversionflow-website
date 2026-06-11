<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Tests\WordPress;

use Brain\Monkey;
use Brain\Monkey\Functions;
use ConversionFlow\Sdk\Exception\SdkException;
use ConversionFlow\Sdk\WordPress\WpUpdater;
use PHPUnit\Framework\TestCase;

/**
 * Tests for WpUpdater WordPress auto-update integration.
 *
 * Per D-28: Uses Brain\Monkey for WP function mocking.
 * No full WordPress installation required.
 */
class WpUpdaterTest extends TestCase
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

    /**
     * Test that register() adds the expected WordPress hooks.
     */
    public function testRegisterAddsFilters(): void
    {
        Functions\expect('add_filter')
            ->once()
            ->with('pre_set_site_transient_update_plugins', \Mockery::type('array'));

        Functions\expect('add_filter')
            ->once()
            ->with('plugins_api', \Mockery::type('array'), 10, 3);

        Functions\expect('add_action')
            ->once()
            ->with('upgrader_post_install', \Mockery::type('array'));

        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');
        $updater->register();

        $this->assertTrue(true); // No exceptions means hooks were registered
    }

    /**
     * Test that checkForUpdate returns transient unchanged when no checked plugins.
     */
    public function testCheckForUpdateReturnsTransientWhenNoCheckedPlugins(): void
    {
        Functions\when('get_transient')->justReturn(false);

        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');
        $transient = (object) ['checked' => []];

        $result = $updater->checkForUpdate($transient);

        $this->assertSame($transient, $result);
    }

    /**
     * Test that checkForUpdate returns cached result without API call.
     */
    public function testCheckForUpdateReturnsCachedResult(): void
    {
        $cachedData = (object) [
            'slug' => 'my-plugin',
            'new_version' => '2.0.0',
            'package' => 'https://example.com/download',
        ];

        Functions\when('get_transient')->justReturn($cachedData);

        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');
        $transient = (object) ['checked' => ['my-plugin/my-plugin.php' => '1.0.0']];

        $result = $updater->checkForUpdate($transient);

        $this->assertSame($transient, $result);
        $this->assertEquals($cachedData, $result->response['my-plugin/my-plugin.php']);
    }

    /**
     * Test that checkForUpdate handles API failure gracefully (per D-18).
     * The Client::wordpress() chain will throw SdkException because
     * wp_remote_post returns a WP_Error-like object, and WpTransport
     * converts that into an SdkException.
     */
    public function testCheckForUpdateHandlesApiFailureGracefully(): void
    {
        // Create a simple error object that mimics WP_Error
        $wpError = new class {
            public function get_error_message(): string
            {
                return 'Connection refused';
            }
        };

        Functions\when('get_transient')->justReturn(false);
        Functions\when('get_option')->justReturn('');
        Functions\when('wp_remote_post')->justReturn($wpError);
        Functions\when('is_wp_error')->justReturn(true);

        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');
        $transient = (object) ['checked' => ['my-plugin/my-plugin.php' => '1.0.0']];

        // Should NOT throw, should return transient unchanged
        $result = $updater->checkForUpdate($transient);

        $this->assertSame($transient, $result);
        // No response should be set on transient
        $this->assertFalse(isset($result->response['my-plugin/my-plugin.php']));
    }

    /**
     * Test that getPluginInfo returns default for wrong action.
     */
    public function testGetPluginInfoReturnsDefaultForWrongAction(): void
    {
        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');

        $default = (object) ['name' => 'default'];
        $result = $updater->getPluginInfo($default, 'theme_information', (object) []);

        $this->assertSame($default, $result);
    }

    /**
     * Test that getPluginInfo returns default for wrong slug.
     */
    public function testGetPluginInfoReturnsDefaultForWrongSlug(): void
    {
        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');

        $default = (object) ['name' => 'default'];
        $args = (object) ['slug' => 'other-plugin'];
        $result = $updater->getPluginInfo($default, 'plugin_information', $args);

        $this->assertSame($default, $result);
    }

    /**
     * Test that postInstall clears the cache and returns response unmodified.
     */
    public function testPostInstallReturnsResponseUnmodified(): void
    {
        Functions\expect('delete_transient')->once()->with('conversionflow_update_check');

        $updater = new WpUpdater('my-plugin/my-plugin.php', 'my-product', '1.0.0');

        $response = ['success' => true];
        $result = $updater->postInstall($response);

        $this->assertSame($response, $result);
    }
}
