<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Tests\Transport;

use ConversionFlow\Sdk\Transport\TransportInterface;

/**
 * Mock HTTP transport for testing.
 *
 * Records requests for assertions and returns pre-configured responses.
 * Supports queuing multiple responses and simulating connection failures.
 */
class MockTransport implements TransportInterface
{
    /** @var array Queue of responses to return */
    private $responses = [];

    /** @var array Recorded requests for assertions */
    private $requests = [];

    /** @var \Exception|null Optional exception to throw */
    private $exception = null;

    /**
     * Push a response onto the queue.
     *
     * @param array $response Response array: ['status' => int, 'body' => string, 'headers' => array]
     * @return void
     */
    public function setResponse(array $response): void
    {
        $this->responses[] = $response;
    }

    /**
     * Set an exception to throw on the next call.
     *
     * @param \Exception $e
     * @return void
     */
    public function setException(\Exception $e): void
    {
        $this->exception = $e;
    }

    /**
     * {@inheritdoc}
     */
    public function post(string $url, array $body, array $headers = []): array
    {
        $this->requests[] = [
            'method' => 'POST',
            'url' => $url,
            'body' => $body,
            'headers' => $headers,
        ];

        if ($this->exception !== null) {
            $exception = $this->exception;
            $this->exception = null;
            throw $exception;
        }

        if (empty($this->responses)) {
            throw new \RuntimeException('MockTransport: no responses queued');
        }

        return array_shift($this->responses);
    }

    /**
     * {@inheritdoc}
     */
    public function get(string $url, array $headers = []): array
    {
        $this->requests[] = [
            'method' => 'GET',
            'url' => $url,
            'body' => [],
            'headers' => $headers,
        ];

        if ($this->exception !== null) {
            $exception = $this->exception;
            $this->exception = null;
            throw $exception;
        }

        if (empty($this->responses)) {
            throw new \RuntimeException('MockTransport: no responses queued');
        }

        return array_shift($this->responses);
    }

    /**
     * Get the last recorded request.
     *
     * @return array|null ['method' => string, 'url' => string, 'body' => array, 'headers' => array]
     */
    public function getLastRequest(): ?array
    {
        if (empty($this->requests)) {
            return null;
        }
        return $this->requests[count($this->requests) - 1];
    }

    /**
     * Get all recorded requests.
     *
     * @return array
     */
    public function getRequests(): array
    {
        return $this->requests;
    }

    /**
     * Reset the mock state (clear responses, requests, exceptions).
     *
     * @return void
     */
    public function reset(): void
    {
        $this->responses = [];
        $this->requests = [];
        $this->exception = null;
    }
}
