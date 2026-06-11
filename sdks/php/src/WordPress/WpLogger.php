<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\WordPress;

use Psr\Log\LoggerInterface;

/**
 * PSR-3 to WordPress error_log bridge for the ConversionFlow SDK.
 *
 * Maps PSR-3 log levels to WordPress error_log() calls with prefixed output.
 * Debug and info levels are gated behind the CONVERSIONFLOW_DEBUG constant.
 *
 * Log level mapping:
 * - emergency, alert, critical, error -> [CF-SDK ERROR]
 * - warning, notice -> [CF-SDK WARN]
 * - info, debug -> [CF-SDK DEBUG] (only when CONVERSIONFLOW_DEBUG is enabled)
 */
class WpLogger implements LoggerInterface
{
    /**
     * System is unusable.
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function emergency($message, array $context = []): void
    {
        $this->log('emergency', $message, $context);
    }

    /**
     * Action must be taken immediately.
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function alert($message, array $context = []): void
    {
        $this->log('alert', $message, $context);
    }

    /**
     * Critical conditions.
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function critical($message, array $context = []): void
    {
        $this->log('critical', $message, $context);
    }

    /**
     * Runtime errors that do not require immediate action.
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function error($message, array $context = []): void
    {
        $this->log('error', $message, $context);
    }

    /**
     * Exceptional occurrences that are not errors.
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function warning($message, array $context = []): void
    {
        $this->log('warning', $message, $context);
    }

    /**
     * Normal but significant events.
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function notice($message, array $context = []): void
    {
        $this->log('notice', $message, $context);
    }

    /**
     * Interesting events (only when CONVERSIONFLOW_DEBUG is enabled).
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function info($message, array $context = []): void
    {
        $this->log('info', $message, $context);
    }

    /**
     * Detailed debug information (only when CONVERSIONFLOW_DEBUG is enabled).
     *
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function debug($message, array $context = []): void
    {
        $this->log('debug', $message, $context);
    }

    /**
     * Logs with an arbitrary level.
     *
     * Maps PSR-3 levels to prefixed error_log output:
     * - error levels: always logged with [CF-SDK ERROR]
     * - warning levels: always logged with [CF-SDK WARN]
     * - debug levels: only logged when CONVERSIONFLOW_DEBUG is defined and truthy
     *
     * @param mixed $level
     * @param string|\Stringable $message
     * @param array $context
     * @return void
     */
    public function log($level, $message, array $context = []): void
    {
        $prefixes = [
            'emergency' => '[CF-SDK ERROR]',
            'alert' => '[CF-SDK ERROR]',
            'critical' => '[CF-SDK ERROR]',
            'error' => '[CF-SDK ERROR]',
            'warning' => '[CF-SDK WARN]',
            'notice' => '[CF-SDK WARN]',
            'info' => '[CF-SDK DEBUG]',
            'debug' => '[CF-SDK DEBUG]',
        ];

        $prefix = $prefixes[$level] ?? '[CF-SDK]';

        // Debug/info only if CONVERSIONFLOW_DEBUG is enabled
        if (in_array($level, ['debug', 'info'], true)) {
            if (!defined('CONVERSIONFLOW_DEBUG') || !CONVERSIONFLOW_DEBUG) {
                return;
            }
        }

        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        error_log($prefix . ' ' . (string) $message . $contextStr);
    }
}
