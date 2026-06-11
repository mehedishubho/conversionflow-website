<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Response;

/**
 * Response from license activation/deactivation (POST /api/v1/license/activate, /deactivate).
 *
 * Maps server JSON response to typed PHP properties.
 * Same field structure as ValidationResponse.
 */
class ActivationResponse
{
    /** @var bool */
    private $valid;

    /** @var string|null */
    private $licenseId;

    /** @var string|null */
    private $plan;

    /** @var string|null */
    private $expiresAt;

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
        $this->maxActivations = $data['max_activations'] ?? null;
        $this->currentActivations = $data['current_activations'] ?? null;
        $this->error = $data['error'] ?? null;
    }

    /**
     * Whether the activation/deactivation was successful.
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
