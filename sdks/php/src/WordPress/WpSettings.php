<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\WordPress;

use ConversionFlow\Sdk\Client;
use ConversionFlow\Sdk\Exception\SdkException;

/**
 * WordPress admin settings page helper for ConversionFlow SDK.
 *
 * Per D-08: This is a helper class, NOT a registered WP admin page.
 * The plugin registers its own admin menu and calls these methods
 * to render license management UI components.
 *
 * Security: License key is NEVER echoed in full (masked, last 4 chars only).
 * Per T-35-08: prevents information disclosure in HTML output.
 */
class WpSettings
{
    /** @var string WordPress settings option group */
    private $optionGroup;

    /** @var string Nonce action name for form submissions */
    private const NONCE_ACTION = 'conversionflow_action';

    /**
     * @param string $optionGroup WordPress settings option group (default: conversionflow_settings)
     */
    public function __construct(string $optionGroup = 'conversionflow_settings')
    {
        $this->optionGroup = $optionGroup;
    }

    /**
     * Render the license key settings form.
     *
     * Uses standard WordPress settings API patterns (settings_fields,
     * do_settings_sections, submit_button). Outputs fields for license key,
     * server URL, API token, and product slug.
     *
     * Security: License key value is masked (last 4 chars only), input type="password".
     *
     * @return void
     */
    public function renderLicenseForm(): void
    {
        $licenseKey = get_option('conversionflow_license_key', '');
        $serverUrl = get_option('conversionflow_server_url', 'https://conversionflow.com');
        $apiToken = get_option('conversionflow_api_token', '');
        $productSlug = get_option('conversionflow_product_slug', '');

        echo '<div class="conversionflow-settings">';
        echo '<form method="post" action="">';
        settings_fields($this->optionGroup);
        do_settings_sections($this->optionGroup);

        echo '<table class="form-table">';

        // License Key field (masked for security, per T-35-08)
        // Value is NEVER echoed in HTML -- password input is empty for existing keys.
        // The masked display below shows last 4 chars so user knows a key is stored.
        echo '<tr>';
        echo '<th scope="row"><label for="conversionflow_license_key">License Key</label></th>';
        echo '<td>';
        echo '<input type="password" name="conversionflow_license_key" id="conversionflow_license_key" ';
        echo 'value="" class="regular-text" placeholder="Enter license key" />';
        if (!empty($licenseKey)) {
            $masked = str_repeat('*', strlen($licenseKey) - 4) . substr($licenseKey, -4);
            echo '<p class="description">Current: ' . esc_html($masked) . '</p>';
        }
        echo '</td>';
        echo '</tr>';

        // Server URL field
        echo '<tr>';
        echo '<th scope="row"><label for="conversionflow_server_url">Server URL</label></th>';
        echo '<td>';
        echo '<input type="text" name="conversionflow_server_url" id="conversionflow_server_url" ';
        echo 'value="' . esc_attr($serverUrl) . '" class="regular-text" />';
        echo '</td>';
        echo '</tr>';

        // API Token field (masked for security, per T-35-08)
        // Value is NEVER echoed in HTML -- password input is empty for existing tokens.
        // The masked display below shows last 4 chars so user knows a token is stored.
        echo '<tr>';
        echo '<th scope="row"><label for="conversionflow_api_token">API Token</label></th>';
        echo '<td>';
        echo '<input type="password" name="conversionflow_api_token" id="conversionflow_api_token" ';
        echo 'value="" class="regular-text" placeholder="Enter API token" />';
        if (!empty($apiToken)) {
            $masked = str_repeat('*', strlen($apiToken) - 4) . substr($apiToken, -4);
            echo '<p class="description">Current: ' . esc_html($masked) . '</p>';
        }
        echo '</td>';
        echo '</tr>';

        // Product Slug field
        echo '<tr>';
        echo '<th scope="row"><label for="conversionflow_product_slug">Product Slug</label></th>';
        echo '<td>';
        echo '<input type="text" name="conversionflow_product_slug" id="conversionflow_product_slug" ';
        echo 'value="' . esc_attr($productSlug) . '" class="regular-text" />';
        echo '</td>';
        echo '</tr>';

        echo '</table>';

        submit_button();

        echo '</form>';
        echo '</div>';
    }

    /**
     * Render the license status badge.
     *
     * Calls Client::wordpress()->getStatus() and displays a colored badge
     * showing: status, plan name, expiry date, and activation count.
     *
     * Per D-19: shows connection issue warning when operating from cache.
     *
     * @return void
     */
    public function renderStatusBadge(): void
    {
        try {
            $client = Client::wordpress();
            $response = $client->getStatus();

            if ($response->isSuccessful()) {
                $status = $response->getStatus();
                $plan = $response->getPlan();
                $expiresAt = $response->getExpiresAt();
                $gracePeriod = $response->getGracePeriodExpiresAt();
                $maxActivations = $response->getMaxActivations();
                $currentActivations = $response->getCurrentActivations();

                // Determine badge color
                if ($status === 'active') {
                    $color = '#46b450'; // green
                    $label = 'Active';
                } elseif ($status === 'grace_period' || $gracePeriod) {
                    $color = '#ffb900'; // yellow
                    $label = 'Grace Period';
                } else {
                    $color = '#46b450';
                    $label = ucfirst($status ?? 'Active');
                }

                echo '<div class="conversionflow-status-badge">';
                echo '<span style="display:inline-block;padding:4px 12px;border-radius:4px;';
                echo 'background:' . esc_attr($color) . ';color:#fff;font-weight:600;">';
                echo esc_html($label);
                echo '</span>';

                if ($plan) {
                    echo ' <strong>' . esc_html(is_array($plan) ? ($plan['name'] ?? '') : $plan) . '</strong>';
                }

                if ($expiresAt) {
                    echo ' &mdash; Expires: ' . esc_html(date('Y-m-d', strtotime($expiresAt)));
                }

                if ($maxActivations !== null) {
                    echo ' &mdash; ' . esc_html((string) ($currentActivations ?? 0)) . ' / '
                        . esc_html((string) $maxActivations) . ' activations used';
                }

                echo '</div>';
            } else {
                $error = $response->getError() ?? 'Unknown error';
                echo '<div class="conversionflow-status-badge">';
                echo '<span style="display:inline-block;padding:4px 12px;border-radius:4px;';
                echo 'background:#dc3232;color:#fff;font-weight:600;">';
                echo 'Expired / Invalid';
                echo '</span>';
                echo ' <span class="description">' . esc_html($error) . '</span>';
                echo '</div>';
            }
        } catch (SdkException $e) {
            // Per D-19: connection issue warning
            $cacheExpires = get_option('conversionflow_cache_expires', null);
            $hoursLeft = $cacheExpires ? max(0, round(((int) $cacheExpires - time()) / 3600, 1)) : 0;

            echo '<div class="conversionflow-status-badge">';
            echo '<span style="display:inline-block;padding:4px 12px;border-radius:4px;';
            echo 'background:#ffb900;color:#fff;font-weight:600;">';
            echo 'Connection Issue';
            echo '</span>';
            echo ' <span class="description">Using cached license data';
            if ($hoursLeft > 0) {
                echo ' (expires in ' . esc_html((string) $hoursLeft) . 'h)';
            }
            echo '</span>';
            echo '</div>';
        }
    }

    /**
     * Render the list of activated domains.
     *
     * Calls Client::wordpress()->getStatus() and displays a table
     * of domains with deactivate buttons.
     *
     * @return void
     */
    public function renderDomainList(): void
    {
        try {
            $client = Client::wordpress();
            $response = $client->getStatus();

            if (!$response->isSuccessful()) {
                echo '<p class="description">Unable to retrieve domain activations.</p>';
                return;
            }

            $activations = $response->getActivations();

            if (empty($activations)) {
                echo '<p class="description">No domains activated yet.</p>';
                return;
            }

            echo '<table class="widefat conversionflow-domain-list">';
            echo '<thead><tr>';
            echo '<th>Domain</th>';
            echo '<th>Activated</th>';
            echo '<th>Action</th>';
            echo '</tr></thead>';
            echo '<tbody>';

            foreach ($activations as $activation) {
                $domain = $activation['domain'] ?? '';
                $activatedAt = $activation['activated_at'] ?? '';

                echo '<tr>';
                echo '<td>' . esc_html($domain) . '</td>';
                echo '<td>' . esc_html($activatedAt ? date('Y-m-d H:i', strtotime($activatedAt)) : 'N/A') . '</td>';
                echo '<td>';
                echo '<form method="post" action="" style="display:inline;">';
                wp_nonce_field(self::NONCE_ACTION);
                echo '<input type="hidden" name="cf_action" value="cf_deactivate" />';
                echo '<input type="hidden" name="cf_domain" value="' . esc_attr($domain) . '" />';
                echo '<button type="submit" class="button button-small">Deactivate</button>';
                echo '</form>';
                echo '</td>';
                echo '</tr>';
            }

            echo '</tbody></table>';
        } catch (SdkException $e) {
            echo '<p class="description">Unable to retrieve domain activations. Connection issue.</p>';
        }
    }

    /**
     * Handle form submissions for activate/deactivate actions.
     *
     * Verifies nonce, calls Client activate/deactivate methods,
     * and redirects back with admin notice message.
     *
     * Per T-35-07: nonce verification on all form submissions.
     *
     * @return void
     */
    public function handleFormSubmission(): void
    {
        $action = $_POST['cf_action'] ?? '';

        if (empty($action)) {
            return;
        }

        if (!in_array($action, ['cf_activate', 'cf_deactivate'], true)) {
            return;
        }

        // Verify nonce (per T-35-07)
        $nonce = $_POST['_wpnonce'] ?? '';
        if (!wp_verify_nonce($nonce, self::NONCE_ACTION)) {
            wp_die('Security check failed. Please refresh the page and try again.');
        }

        $client = Client::wordpress();
        $message = '';
        $type = 'success';

        if ($action === 'cf_activate') {
            // Save settings first
            $this->saveSettings();

            $domain = $this->getCurrentDomain();
            $response = $client->activate($domain);

            if ($response->isSuccessful()) {
                $message = 'License activated successfully for ' . $domain;
            } else {
                $message = 'Activation failed: ' . ($response->getError() ?? 'Unknown error');
                $type = 'error';
            }
        } elseif ($action === 'cf_deactivate') {
            $domain = sanitize_text_field($_POST['cf_domain'] ?? '');
            $response = $client->deactivate($domain);

            if ($response->isSuccessful()) {
                $message = 'Domain ' . $domain . ' deactivated successfully';
            } else {
                $message = 'Deactivation failed: ' . ($response->getError() ?? 'Unknown error');
                $type = 'error';
            }
        }

        // Store message in transient for display after redirect
        set_transient('conversionflow_admin_notice', [
            'message' => $message,
            'type' => $type,
        ], 60);

        wp_redirect(admin_url(sanitize_text_field($_SERVER['REQUEST_URI'] ?? '')));
        exit;
    }

    /**
     * Save license settings from POST data to WP options.
     *
     * @return void
     */
    private function saveSettings(): void
    {
        // Only update license key if a new value was provided (input is empty for existing keys)
        if (isset($_POST['conversionflow_license_key']) && $_POST['conversionflow_license_key'] !== '') {
            update_option('conversionflow_license_key', sanitize_text_field($_POST['conversionflow_license_key']));
        }
        if (isset($_POST['conversionflow_server_url'])) {
            update_option('conversionflow_server_url', esc_url_raw($_POST['conversionflow_server_url']));
        }
        // Only update API token if a new value was provided (input is empty for existing tokens)
        if (isset($_POST['conversionflow_api_token']) && $_POST['conversionflow_api_token'] !== '') {
            update_option('conversionflow_api_token', sanitize_text_field($_POST['conversionflow_api_token']));
        }
        if (isset($_POST['conversionflow_product_slug'])) {
            update_option('conversionflow_product_slug', sanitize_text_field($_POST['conversionflow_product_slug']));
        }
    }

    /**
     * Get the current site domain for activation.
     *
     * @return string
     */
    private function getCurrentDomain(): string
    {
        return wp_parse_url(site_url(), PHP_URL_HOST) ?? 'localhost';
    }
}
