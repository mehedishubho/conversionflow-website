<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Response;

/**
 * Response from license status check (POST /api/v1/license/status).
 *
 * Contains full license profile including activations list,
 * feature map, product info, and plan details.
 */
class StatusResponse
{
    /** @var bool */
    private $valid;

    /** @var string|null */
    private $licenseId;

    /** @var string|null */
    private $status;

    /** @var array|null Plan with 'name' and 'slug' keys */
    private $plan;

    /** @var array|null Product with 'name' and 'slug' keys */
    private $product;

    /** @var string|null */
    private $expiresAt;

    /** @var string|null */
    private $gracePeriodExpiresAt;

    /** @var int|null */
    private $maxActivations;

    /** @var int|null */
    private $currentActivations;

    /** @var array List of activations: [{domain: string, activated_at: ?string}] */
    private $activations;

    /** @var array Feature map: {feature_name: bool} */
    private $features;

    /** @var string|null */
    private $licenseType;

    /** @var string|null */
    private $error;

    /**
     * @param array $data Decoded JSON response from the server
     */
    public function __construct(array $data)
    {
        $this->valid = $data['valid'] ?? false;
        $this->licenseId = $data['license_id'] ?? null;
        $this->status = $data['status'] ?? null;
        $this->plan = $data['plan'] ?? null;
        $this->product = $data['product'] ?? null;
        $this->expiresAt = $data['expires_at'] ?? null;
        $this->gracePeriodExpiresAt = $data['grace_period_expires_at'] ?? null;
        $this->maxActivations = $data['max_activations'] ?? null;
        $this->currentActivations = $data['current_activations'] ?? null;
        $this->activations = $data['activations'] ?? [];
        $this->features = $data['features'] ?? [];
        $this->licenseType = $data['license_type'] ?? null;
        $this->error = $data['error'] ?? null;
    }

    /**
     * Whether the status check was successful.
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
            'status' => $this->status,
            'plan' => $this->plan,
            'product' => $this->product,
            'expiresAt' => $this->expiresAt,
            'gracePeriodExpiresAt' => $this->gracePeriodExpiresAt,
            'maxActivations' => $this->maxActivations,
            'currentActivations' => $this->currentActivations,
            'activations' => $this->activations,
            'features' => $this->features,
            'licenseType' => $this->licenseType,
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
    public function getStatus(): ?string
    {
        return $this->status;
    }

    /**
     * Returns plan info with 'name' and 'slug' keys.
     *
     * @return array|null
     */
    public function getPlan(): ?array
    {
        return $this->plan;
    }

    /**
     * Returns product info with 'name' and 'slug' keys.
     *
     * @return array|null
     */
    public function getProduct(): ?array
    {
        return $this->product;
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

    /**
     * Returns the list of domain activations.
     * Each entry has 'domain' (string) and 'activated_at' (?string) keys.
     *
     * @return array
     */
    public function getActivations(): array
    {
        return $this->activations;
    }

    /**
     * Returns the feature map from the license.
     * Keys are feature names, values are booleans.
     *
     * @return array
     */
    public function getFeatures(): array
    {
        return $this->features;
    }

    /**
     * @return string|null
     */
    public function getLicenseType(): ?string
    {
        return $this->licenseType;
    }
}
