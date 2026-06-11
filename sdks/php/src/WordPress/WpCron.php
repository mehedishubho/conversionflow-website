<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\WordPress;

use ConversionFlow\Sdk\Client;
use ConversionFlow\Sdk\Exception\SdkException;

/**
 * WordPress WP-Cron integration for daily license checks.
 *
 * Per D-23: registers conversionflow_daily_check cron job running once daily.
 * Per D-24: shows admin notices for expiring (7d), expired, and connection issues.
 * Per D-25: respects conversionflow_show_admin_notices filter to disable notices.
 * Per T-35-10: single daily validate() call is well within 100 req/min rate limit.
 */
class WpCron
{
    /** @var string Cron hook name (per D-23) */
    private const CRON_HOOK = 'conversionflow_daily_check';

    /** @var int Days before expiry to show warning */
    private const EXPIRY_WARNING_DAYS = 7;

    /**
     * Register WP-Cron hook and admin notices.
     *
     * @return void
     */
    public function register(): void
    {
        add_action(self::CRON_HOOK, [$this, 'dailyCheck']);

        // Schedule the cron if not already scheduled
        if (!wp_next_scheduled(self::CRON_HOOK)) {
            wp_schedule_event(time(), 'daily', self::CRON_HOOK);
        }

        add_action('admin_notices', [$this, 'showNotices']);
    }

    /**
     * Daily license validation check.
     *
     * Calls Client::wordpress()->validate() and stores results
     * in WP options for admin notice display.
     *
     * @return void
     */
    public function dailyCheck(): void
    {
        try {
            $client = Client::wordpress();
            $response = $client->validate();

            if ($response->isSuccessful()) {
                $expiresAt = $response->getExpiresAt();

                // Store expiry date for notice display
                update_option('conversionflow_license_expires', $expiresAt ?? '');

                // Clear any previous failure state
                delete_option('conversionflow_last_check_failure');

                if ($expiresAt) {
                    $daysRemaining = (int) ((strtotime($expiresAt) - time()) / 86400);

                    if ($daysRemaining <= 0) {
                        update_option('conversionflow_license_expired', '1');
                        delete_option('conversionflow_expiry_warning');
                    } elseif ($daysRemaining <= self::EXPIRY_WARNING_DAYS) {
                        update_option('conversionflow_expiry_warning', (string) $daysRemaining);
                        delete_option('conversionflow_license_expired');
                    } else {
                        // License healthy, clear warnings
                        delete_option('conversionflow_expiry_warning');
                        delete_option('conversionflow_license_expired');
                    }
                }
            } else {
                // License invalid/expired
                $error = $response->getError();
                if ($error === 'LICENSE_EXPIRED' || $error === 'INVALID_LICENSE') {
                    update_option('conversionflow_license_expired', '1');
                }
            }
        } catch (SdkException $e) {
            // Connection failure
            update_option('conversionflow_last_check_failure', (string) time());
        }
    }

    /**
     * Show admin notices for license status.
     *
     * Per D-24: yellow dismissible (expiring 7d), red persistent (expired),
     * yellow dismissible (connection issue).
     * Per D-25: respects conversionflow_show_admin_notices filter.
     *
     * @return void
     */
    public function showNotices(): void
    {
        // Check filter (per D-25)
        if (!apply_filters('conversionflow_show_admin_notices', true)) {
            return;
        }

        // Only show on plugin-related admin pages
        $screen = get_current_screen();
        if ($screen && $screen->base !== 'plugins' && strpos($screen->base, 'conversionflow') === false) {
            return;
        }

        // Expired license: red persistent notice
        $expired = get_option('conversionflow_license_expired', '');
        if ($expired === '1') {
            echo '<div class="notice notice-error">';
            echo '<p><strong>ConversionFlow:</strong> Your license has expired. ';
            echo 'Reactivate to continue receiving updates and support. ';
            echo '<a href="https://conversionflow.com/dashboard">Renew your license</a></p>';
            echo '</div>';
            return;
        }

        // Expiring within 7 days: yellow dismissible notice
        $warning = get_option('conversionflow_expiry_warning', '');
        if ($warning !== '' && (int) $warning > 0) {
            $days = (int) $warning;
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>ConversionFlow:</strong> Your license expires in '
                . esc_html((string) $days) . ' day' . ($days !== 1 ? 's' : '') . '. ';
            echo 'Renew to continue receiving updates. ';
            echo '<a href="https://conversionflow.com/dashboard">Renew your license</a></p>';
            echo '</div>';
            return;
        }

        // Connection issue: yellow dismissible notice
        $lastFailure = get_option('conversionflow_last_check_failure', '');
        if ($lastFailure !== '') {
            $hoursAgo = round((time() - (int) $lastFailure) / 3600, 1);
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>ConversionFlow:</strong> Unable to verify license — using cached data. ';
            echo 'Last verified ' . esc_html((string) $hoursAgo) . ' hours ago.</p>';
            echo '</div>';
        }
    }

    /**
     * Cleanup on plugin deactivation.
     *
     * Removes scheduled cron hook and cleans up options.
     *
     * @return void
     */
    public function deactivate(): void
    {
        wp_clear_scheduled_hook(self::CRON_HOOK);
        delete_option('conversionflow_expiry_warning');
        delete_option('conversionflow_license_expired');
        delete_option('conversionflow_last_check_failure');
    }
}
