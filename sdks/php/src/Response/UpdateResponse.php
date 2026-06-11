<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Response;

/**
 * Response from update check (POST /api/v1/update/check).
 *
 * Maps WordPress-compatible server response to typed PHP properties.
 * isSuccessful() returns true when the API call itself succeeded
 * (even if no update is available).
 */
class UpdateResponse
{
    /** @var bool */
    private $updateAvailable;

    /** @var string|null */
    private $slug;

    /** @var string|null */
    private $newVersion;

    /** @var string|null */
    private $downloadUrl;

    /** @var string|null */
    private $package;

    /** @var string|null */
    private $url;

    /** @var string|null */
    private $lastUpdated;

    /** @var array|null */
    private $sections;

    /** @var string|null */
    private $requires;

    /** @var string|null */
    private $tested;

    /** @var string|null */
    private $requiresPhp;

    /** @var string|null */
    private $error;

    /**
     * @param array $data Decoded JSON response from the server
     */
    public function __construct(array $data)
    {
        $this->updateAvailable = $data['update_available'] ?? false;
        $this->slug = $data['slug'] ?? null;
        $this->newVersion = $data['new_version'] ?? null;
        $this->downloadUrl = $data['download_url'] ?? null;
        $this->package = $data['package'] ?? null;
        $this->url = $data['url'] ?? null;
        $this->lastUpdated = $data['last_updated'] ?? null;
        $this->sections = $data['sections'] ?? null;
        $this->requires = $data['requires'] ?? null;
        $this->tested = $data['tested'] ?? null;
        $this->requiresPhp = $data['requires_php'] ?? null;
        $this->error = $data['error'] ?? null;
    }

    /**
     * Whether the API call was successful (even if no update available).
     *
     * @return bool
     */
    public function isSuccessful(): bool
    {
        return $this->error === null;
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
            'updateAvailable' => $this->updateAvailable,
            'slug' => $this->slug,
            'newVersion' => $this->newVersion,
            'downloadUrl' => $this->downloadUrl,
            'package' => $this->package,
            'url' => $this->url,
            'lastUpdated' => $this->lastUpdated,
            'sections' => $this->sections,
            'requires' => $this->requires,
            'tested' => $this->tested,
            'requiresPhp' => $this->requiresPhp,
            'error' => $this->error,
        ];
    }

    /**
     * Whether an update is available for the installed version.
     *
     * @return bool
     */
    public function hasUpdate(): bool
    {
        return $this->updateAvailable;
    }

    /**
     * @return string|null
     */
    public function getSlug(): ?string
    {
        return $this->slug;
    }

    /**
     * @return string|null
     */
    public function getNewVersion(): ?string
    {
        return $this->newVersion;
    }

    /**
     * @return string|null
     */
    public function getDownloadUrl(): ?string
    {
        return $this->downloadUrl;
    }

    /**
     * @return string|null
     */
    public function getPackage(): ?string
    {
        return $this->package;
    }

    /**
     * @return string|null
     */
    public function getUrl(): ?string
    {
        return $this->url;
    }

    /**
     * @return string|null
     */
    public function getLastUpdated(): ?string
    {
        return $this->lastUpdated;
    }

    /**
     * @return array|null
     */
    public function getSections(): ?array
    {
        return $this->sections;
    }

    /**
     * @return string|null
     */
    public function getRequires(): ?string
    {
        return $this->requires;
    }

    /**
     * @return string|null
     */
    public function getTested(): ?string
    {
        return $this->tested;
    }

    /**
     * @return string|null
     */
    public function getRequiresPhp(): ?string
    {
        return $this->requiresPhp;
    }
}
