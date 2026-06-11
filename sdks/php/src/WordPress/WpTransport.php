<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\WordPress;

use ConversionFlow\Sdk\Exception\SdkException;
use ConversionFlow\Sdk\Transport\TransportInterface;

/**
 * WordPress HTTP API transport for the ConversionFlow SDK.
 *
 * Uses wp_remote_post() and wp_remote_get() instead of raw cURL.
 * More portable on WordPress hosts that block direct cURL calls.
 * Automatically registered by Client::wordpress() factory.
 */
class WpTransport implements TransportInterface
{
    /** @var int Default timeout in seconds */
    private const TIMEOUT = 30;

    /**
     * {@inheritdoc}
     *
     * @throws SdkException On WordPress HTTP API errors (WP_Error)
     */
    public function post(string $url, array $body, array $headers = []): array
    {
        $response = wp_remote_post($url, [
            'timeout' => self::TIMEOUT,
            'headers' => array_merge(
                ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
                $headers
            ),
            'body' => json_encode($body),
        ]);

        if (is_wp_error($response)) {
            throw new SdkException(
                'WordPress HTTP request failed: ' . $response->get_error_message(),
                0,
                ['url' => $url]
            );
        }

        return [
            'status' => wp_remote_retrieve_response_code($response),
            'body' => wp_remote_retrieve_body($response),
            'headers' => [],
        ];
    }

    /**
     * {@inheritdoc}
     *
     * @throws SdkException On WordPress HTTP API errors (WP_Error)
     */
    public function get(string $url, array $headers = []): array
    {
        $response = wp_remote_get($url, [
            'timeout' => self::TIMEOUT,
            'headers' => array_merge(
                ['Accept' => 'application/json'],
                $headers
            ),
        ]);

        if (is_wp_error($response)) {
            throw new SdkException(
                'WordPress HTTP request failed: ' . $response->get_error_message(),
                0,
                ['url' => $url]
            );
        }

        return [
            'status' => wp_remote_retrieve_response_code($response),
            'body' => wp_remote_retrieve_body($response),
            'headers' => [],
        ];
    }
}
