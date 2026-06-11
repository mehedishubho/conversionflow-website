<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Transport;

/**
 * HTTP transport abstraction for the ConversionFlow SDK.
 *
 * Framework-agnostic interface that decouples the SDK core
 * from specific HTTP implementations (cURL, WordPress HTTP API, etc.).
 */
interface TransportInterface
{
    /**
     * Send an HTTP POST request.
     *
     * @param string $url The full URL to send the request to
     * @param array $body The request body (will be JSON-encoded)
     * @param array $headers Additional HTTP headers
     * @return array{status: int, body: string, headers: array}
     */
    public function post(string $url, array $body, array $headers = []): array;

    /**
     * Send an HTTP GET request.
     *
     * @param string $url The full URL to send the request to
     * @param array $headers Additional HTTP headers
     * @return array{status: int, body: string, headers: array}
     */
    public function get(string $url, array $headers = []): array;
}
