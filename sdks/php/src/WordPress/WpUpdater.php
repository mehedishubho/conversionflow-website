<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\WordPress;

use ConversionFlow\Sdk\Client;
use ConversionFlow\Sdk\Exception\SdkException;

/**
 * WordPress auto-update integration via transient hooks.
 *
 * Per D-09: hooks into pre_set_site_transient_update_plugins, plugins_api,
 * and upgrader_post_install to provide plugin updates from ConversionFlow server.
 *
 * Per Pitfall 4: caches update check results in WP transient with 12h TTL
 * to prevent duplicate API calls from simultaneous WP cron and admin checks.
 */
class WpUpdater
{
    /** @var string Plugin file path (e.g., my-plugin/my-plugin.php) */
    private $pluginFile;

    /** @var string Product slug matching ConversionFlow admin configuration */
    private $productSlug;

    /** @var string Currently installed plugin version */
    private $installedVersion;

    /** @var string WP transient key for caching update check results */
    private const CACHE_KEY = 'conversionflow_update_check';

    /** @var int Cache TTL in seconds (12 hours) */
    private const CACHE_TTL = 43200;

    /**
     * @param string $pluginFile Plugin file path (via plugin_basename(__FILE__))
     * @param string $productSlug Product slug configured in ConversionFlow admin
     * @param string $installedVersion Current plugin version string
     */
    public function __construct(string $pluginFile, string $productSlug, string $installedVersion)
    {
        $this->pluginFile = $pluginFile;
        $this->productSlug = $productSlug;
        $this->installedVersion = $installedVersion;
    }

    /**
     * Register WordPress filter and action hooks for auto-update.
     *
     * @return void
     */
    public function register(): void
    {
        add_filter('pre_set_site_transient_update_plugins', [$this, 'checkForUpdate']);
        add_filter('plugins_api', [$this, 'getPluginInfo'], 10, 3);
        add_action('upgrader_post_install', [$this, 'postInstall']);
    }

    /**
     * Check for plugin updates via ConversionFlow API.
     *
     * Hooked into pre_set_site_transient_update_plugins.
     * Caches results for 12 hours to prevent duplicate API calls.
     * Per D-18: fails gracefully, never breaks WP update flow.
     *
     * @param object $transient WordPress update transient object
     * @return object Unmodified or enriched transient
     */
    public function checkForUpdate($transient)
    {
        // If no checked plugins, return unchanged
        if (empty($transient->checked)) {
            return $transient;
        }

        // Check cached result first (avoid duplicate API calls, per Pitfall 4)
        $cached = get_transient(self::CACHE_KEY);
        if ($cached !== false) {
            $transient->response[$this->pluginFile] = $cached;
            return $transient;
        }

        try {
            $client = Client::wordpress();
            $response = $client->checkUpdate($this->installedVersion, $this->productSlug);

            if ($response->isSuccessful() && $response->hasUpdate()) {
                $pluginData = (object) [
                    'slug' => $response->getSlug(),
                    'new_version' => $response->getNewVersion(),
                    'package' => $response->getPackage(),
                    'url' => $response->getUrl(),
                ];
                $transient->response[$this->pluginFile] = $pluginData;
                set_transient(self::CACHE_KEY, $pluginData, self::CACHE_TTL);
            }
        } catch (SdkException $e) {
            // Per D-18: fail gracefully, no broken notices
        }

        return $transient;
    }

    /**
     * Provide plugin info for WordPress "View details" popup.
     *
     * Hooked into plugins_api filter.
     *
     * @param object|false $result Default WP result
     * @param string $action The API action being performed
     * @param object $args Arguments for the API call
     * @return object|false Plugin info object or original result
     */
    public function getPluginInfo($result, $action, $args)
    {
        if ($action !== 'plugin_information') {
            return $result;
        }

        // Extract slug from plugin file (directory name)
        $slugParts = explode('/', $this->pluginFile);
        $pluginSlug = $slugParts[0] ?? '';

        if (!isset($args->slug) || $args->slug !== $pluginSlug) {
            return $result;
        }

        try {
            $client = Client::wordpress();
            $info = $client->getUpdateInfo($this->productSlug);

            return (object) [
                'name' => $info['name'] ?? $this->productSlug,
                'slug' => $info['slug'] ?? $pluginSlug,
                'version' => $info['version'] ?? $this->installedVersion,
                'sections' => $info['sections'] ?? ['description' => ''],
                'requires' => $info['requires'] ?? '5.0',
                'tested' => $info['tested'] ?? '6.5',
                'requires_php' => $info['requires_php'] ?? '7.4',
                'download_link' => $info['download_link'] ?? '',
            ];
        } catch (SdkException $e) {
            return $result;
        }
    }

    /**
     * Post-install cleanup hook.
     *
     * Hooked into upgrader_post_install action.
     * Clears the update cache so next check fetches fresh data.
     *
     * @param mixed $response Upgrade response
     * @return mixed Unmodified response
     */
    public function postInstall($response)
    {
        delete_transient(self::CACHE_KEY);
        return $response;
    }
}
