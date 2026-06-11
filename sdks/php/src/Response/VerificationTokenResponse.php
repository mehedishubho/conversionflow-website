<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Response;

/**
 * Response from verification token request (POST /api/v1/license/verification-token).
 *
 * Used in the activation flow to obtain a verification token
 * before calling the activate endpoint.
 */
class VerificationTokenResponse
{
    /** @var bool */
    private $valid;

    /** @var string|null */
    private $token;

    /** @var string|null */
    private $error;

    /**
     * @param array $data Decoded JSON response from the server
     */
    public function __construct(array $data)
    {
        $this->valid = $data['valid'] ?? false;
        $this->token = $data['token'] ?? null;
        $this->error = $data['error'] ?? null;
    }

    /**
     * Whether the token request was successful.
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
            'token' => $this->token,
            'error' => $this->error,
        ];
    }

    /**
     * Returns the verification token (32-hex-char string) on success.
     *
     * @return string|null
     */
    public function getToken(): ?string
    {
        return $this->token;
    }
}
