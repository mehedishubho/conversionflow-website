<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Response;

/**
 * Response from license validation (POST /api/v1/license/validate).
 *
 * Maps server JSON response to typed PHP properties.
 * Server returns snake_case fields; this class exposes camelCase getters.
 */
class ValidationResponse
{
    /** @var bool */
    private $valid;

    /** @var string|null */
    private $licenseId;

    /** @var string|null */
    private $plan;

    /** @var string|null */
    private $expiresAt;

    /** @var string|null */
    private $gracePeriodExpiresAt;

    /** @var int|null */
    private $maxActivations;

    /** @var int|null */
    private $currentActivations;

    /** @var string|null */
    private $error;

    /**
     * @param array $data Decoded JSON response from the server
     */
    public function __construct(array $data)
    {
        $this->valid = $data['valid'] ?? false;
        $this->licenseId = $data['license_id'] ?? null;
        $this->plan = $data['plan'] ?? null;
        $this->expiresAt = $data['expires_at'] ?? null;
        $this->gracePeriodExpiresAt = $data['grace_period_expires_at'] ?? null;
        $this->maxActivations = $data['max_activations'] ?? null;
        $this->currentActivations = $data['current_activations'] ?? null;
        $this->error = $data['error'] ?? null;
    }

    /**
     * Whether the API call was successful.
     *
     * @return bool
     */
    public function isSuccessful(): bool
    {
        return $this->valid;
    }

    /**
     * Returns the error code if the request failed.
     *
     * @return string|null
     */
    public function getError(): ?string
    {
        return $this->error;
    }

    /**
     * Returns all response data as an array.
     *
     * @return array
     */
    public function getData(): array
    {
        return [
            'valid' => $this->valid,
            'licenseId' => $this->licenseId,
            'plan' => $this->plan,
            'expiresAt' => $this->expiresAt,
            'gracePeriodExpiresAt' => $this->gracePeriodExpiresAt,
            'maxActivations' => $this->maxActivations,
            'currentActivations' => $this->currentActivations,
            'error' => $this->error,
        ];
    }

    /**
     * @return string|null
     */
    public function getLicenseId(): ?string
    {
        return $this->licenseId;
    }

    /**
     * @return string|null
     */
    public function getPlan(): ?string
    {
        return $this->plan;
    }

    /**
     * @return string|null
     */
    public function getExpiresAt(): ?string
    {
        return $this->expiresAt;
    }

    /**
     * @return string|null
     */
    public function getGracePeriodExpiresAt(): ?string
    {
        return $this->gracePeriodExpiresAt;
    }

    /**
     * @return int|null
     */
    public function getMaxActivations(): ?int
    {
        return $this->maxActivations;
    }

    /**
     * @return int|null
     */
    public function getCurrentActivations(): ?int
    {
        return $this->currentActivations;
    }
}
