<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Transport;

use ConversionFlow\Sdk\Exception\SdkException;

/**
 * PHP cURL-based HTTP transport implementation.
 *
 * Default transport for the SDK. Works on any PHP 7.4+ host
 * with the cURL extension enabled. For WordPress environments
 * where cURL may be blocked, use WpTransport instead.
 */
class CurlTransport implements TransportInterface
{
    /** @var int Default timeout in seconds */
    private const TIMEOUT = 30;

    /**
     * {@inheritdoc}
     *
     * @throws SdkException On cURL connection errors (DNS failure, timeout, etc.)
     */
    public function post(string $url, array $body, array $headers = []): array
    {
        $ch = curl_init($url);

        if ($ch === false) {
            throw new SdkException('Failed to initialize cURL session', 0, ['url' => $url]);
        }

        $jsonBody = json_encode($body);
        $defaultHeaders = [
            'Content-Type: application/json',
            'Accept: application/json',
        ];
        $allHeaders = array_merge($defaultHeaders, $headers);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $jsonBody,
            CURLOPT_HTTPHEADER => $allHeaders,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => self::TIMEOUT,
            CURLOPT_HEADER => false,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $errorNumber = curl_errno($ch);

        curl_close($ch);

        if ($response === false || $errorNumber !== 0) {
            throw new SdkException(
                'HTTP request failed: ' . $error,
                $errorNumber,
                ['url' => $url, 'curl_error' => $error, 'curl_errno' => $errorNumber]
            );
        }

        return [
            'status' => (int) $statusCode,
            'body' => $response,
            'headers' => [],
        ];
    }

    /**
     * {@inheritdoc}
     *
     * @throws SdkException On cURL connection errors
     */
    public function get(string $url, array $headers = []): array
    {
        $ch = curl_init($url);

        if ($ch === false) {
            throw new SdkException('Failed to initialize cURL session', 0, ['url' => $url]);
        }

        $defaultHeaders = [
            'Accept: application/json',
        ];
        $allHeaders = array_merge($defaultHeaders, $headers);

        curl_setopt_array($ch, [
            CURLOPT_HTTPGET => true,
            CURLOPT_HTTPHEADER => $allHeaders,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => self::TIMEOUT,
            CURLOPT_HEADER => false,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $errorNumber = curl_errno($ch);

        curl_close($ch);

        if ($response === false || $errorNumber !== 0) {
            throw new SdkException(
                'HTTP request failed: ' . $error,
                $errorNumber,
                ['url' => $url, 'curl_error' => $error, 'curl_errno' => $errorNumber]
            );
        }

        return [
            'status' => (int) $statusCode,
            'body' => $response,
            'headers' => [],
        ];
    }
}
