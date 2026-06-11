<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk;

use ConversionFlow\Sdk\Exception\SdkException;
use ConversionFlow\Sdk\Response\ActivationResponse;
use ConversionFlow\Sdk\Response\StatusResponse;
use ConversionFlow\Sdk\Response\UpdateResponse;
use ConversionFlow\Sdk\Response\ValidationResponse;
use ConversionFlow\Sdk\Response\VerificationTokenResponse;
use ConversionFlow\Sdk\Transport\CurlTransport;
use ConversionFlow\Sdk\Transport\TransportInterface;
use ConversionFlow\Sdk\WordPress\WpLogger;
use ConversionFlow\Sdk\WordPress\WpTransport;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

/**
 * ConversionFlow SDK Client.
 *
 * Framework-agnostic PHP client for the ConversionFlow license server API.
 * Handles license validation, activation, deactivation, status checks,
 * update checks, and feature flag queries.
 *
 * Usage:
 *   $client = new Client('https://api.conversionflow.com', 'CF-XXXX-...', 'api-token');
 *   $response = $client->validate();
 *
 * WordPress shortcut:
 *   $client = Client::wordpress();
 */
class Client
{
    /**
     * SDK version for version tracking (per D-34).
     * Independent of WordPress plugin version. Follows semantic versioning.
     */
    public const VERSION = '1.0.0';

    /** @var string */
    private $serverUrl;

    /** @var string */
    private $licenseKey;

    /** @var string */
    private $apiToken;

    /** @var TransportInterface */
    private $transport;

    /** @var LoggerInterface */
    private $logger;

    /** @var array|null */
    private $cachedValidation = null;

    /** @var int|null */
    private $cacheExpiresAt = null;

    /** @var array */
    private $features = [];

    /** Cache TTL in seconds (24 hours per D-17) */
    private const CACHE_TTL = 86400;

    /** WordPress option names (per D-11) */
    private const OPTION_CACHE = 'conversionflow_cached_validation';
    private const OPTION_CACHE_EXPIRES = 'conversionflow_cache_expires';

    /** Endpoint paths */
    private const ENDPOINT_VALIDATE = '/api/v1/license/validate';
    private const ENDPOINT_ACTIVATE = '/api/v1/license/activate';
    private const ENDPOINT_DEACTIVATE = '/api/v1/license/deactivate';
    private const ENDPOINT_STATUS = '/api/v1/license/status';
    private const ENDPOINT_UPDATE_CHECK = '/api/v1/update/check';
    private const ENDPOINT_UPDATE_INFO = '/api/v1/update/info';
    private const ENDPOINT_VERIFICATION_TOKEN = '/api/v1/license/verification-token';

    /**
     * @param string $serverUrl The ConversionFlow server URL (e.g., https://api.conversionflow.com)
     * @param string $licenseKey The license key (CF-XXXX-XXXX-XXXX-XXXX-XXXX format)
     * @param string $apiToken The per-license API token
     */
    public function __construct(string $serverUrl, string $licenseKey, string $apiToken)
    {
        $this->serverUrl = rtrim($serverUrl, '/');
        $this->licenseKey = $licenseKey;
        $this->apiToken = $apiToken;
        $this->transport = new CurlTransport();
        $this->logger = new NullLogger();

        // Define version constant if not already defined (per D-34)
        if (!defined('CONVERSIONFLOW_SDK_VERSION')) {
            define('CONVERSIONFLOW_SDK_VERSION', self::VERSION);
        }
    }

    /**
     * Validate the current license.
     *
     * Calls POST /api/v1/license/validate with the configured credentials.
     * On success, caches the response and updates the features map.
     * On connection failure, returns cached response if within 24h TTL.
     *
     * @return ValidationResponse
     *
     * @throws SdkException On HTTP 5xx or expired cache with connection failure
     */
    public function validate(): ValidationResponse
    {
        $body = [
            'license_key' => $this->licenseKey,
            'domain' => $this->detectDomain(),
            'api_token' => $this->apiToken,
        ];

        try {
            $result = $this->callApi(self::ENDPOINT_VALIDATE, $body);
        } catch (SdkException $e) {
            // Connection failure -- try cache fallback
            $cached = $this->getFromCache();
            if ($cached !== null) {
                $this->logger->warning('ConversionFlow SDK: API call failed, using cached validation', [
                    'error' => $e->getMessage(),
                ]);
                return new ValidationResponse($cached);
            }
            throw $e;
        }

        $data = $result['data'];
        $response = new ValidationResponse($data);

        if ($response->isSuccessful()) {
            $this->storeCache($data);
            $this->features = $data['features'] ?? [];
        }

        return $response;
    }

    /**
     * Activate the license for a specific domain.
     *
     * First requests a verification token, then calls POST /api/v1/license/activate
     * with the meta verification method and the obtained token.
     *
     * @param string $domain The domain to activate (will be normalized)
     * @return ActivationResponse
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    public function activate(string $domain): ActivationResponse
    {
        $normalizedDomain = $this->normalizeDomain($domain);

        // Step 1: Request verification token
        $tokenResponse = $this->requestVerificationToken($normalizedDomain);
        if (!$tokenResponse->isSuccessful()) {
            // Return an activation response with the same error
            return new ActivationResponse([
                'valid' => false,
                'error' => $tokenResponse->getError(),
            ]);
        }

        // Step 2: Call activate with token
        $body = [
            'license_key' => $this->licenseKey,
            'api_token' => $this->apiToken,
            'domain' => $normalizedDomain,
            'verification_method' => 'meta',
            'verification_token' => $tokenResponse->getToken(),
        ];

        $result = $this->callApi(self::ENDPOINT_ACTIVATE, $body);
        return new ActivationResponse($result['data']);
    }

    /**
     * Deactivate the license for a specific domain.
     *
     * Calls POST /api/v1/license/deactivate.
     *
     * @param string $domain The domain to deactivate (will be normalized)
     * @return ActivationResponse
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    public function deactivate(string $domain): ActivationResponse
    {
        $normalizedDomain = $this->normalizeDomain($domain);

        $body = [
            'license_key' => $this->licenseKey,
            'api_token' => $this->apiToken,
            'domain' => $normalizedDomain,
        ];

        $result = $this->callApi(self::ENDPOINT_DEACTIVATE, $body);
        return new ActivationResponse($result['data']);
    }

    /**
     * Get the full license status including features and activations.
     *
     * Calls POST /api/v1/license/status.
     *
     * @return StatusResponse
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    public function getStatus(): StatusResponse
    {
        $body = [
            'license_key' => $this->licenseKey,
            'domain' => $this->detectDomain(),
            'api_token' => $this->apiToken,
        ];

        $result = $this->callApi(self::ENDPOINT_STATUS, $body);

        $data = $result['data'];
        $response = new StatusResponse($data);

        // Update cached features from status response
        if ($response->isSuccessful()) {
            $this->features = $data['features'] ?? [];
        }

        return $response;
    }

    /**
     * Check for plugin updates.
     *
     * Calls POST /api/v1/update/check with the installed version
     * and product slug. Returns WordPress-compatible update information.
     *
     * @param string $installedVersion The currently installed version (e.g., "1.2.3")
     * @param string $productSlug The product slug configured on the server
     * @return UpdateResponse
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    public function checkUpdate(string $installedVersion, string $productSlug): UpdateResponse
    {
        $body = [
            'license_key' => $this->licenseKey,
            'domain' => $this->detectDomain(),
            'api_token' => $this->apiToken,
            'installed_version' => $installedVersion,
            'product_slug' => $productSlug,
        ];

        $result = $this->callApi(self::ENDPOINT_UPDATE_CHECK, $body);
        return new UpdateResponse($result['data']);
    }

    /**
     * Get plugin update info for WordPress "View details" popup.
     *
     * Calls POST /api/v1/update/info with product slug.
     * Returns raw data array for WpUpdater to build plugin info object.
     *
     * @param string $productSlug The product slug configured on the server
     * @return array
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    public function getUpdateInfo(string $productSlug): array
    {
        $result = $this->callApi(self::ENDPOINT_UPDATE_INFO, [
            'license_key' => $this->licenseKey,
            'domain' => $this->detectDomain(),
            'api_token' => $this->apiToken,
            'product_slug' => $productSlug,
        ]);
        return $result['data'] ?? [];
    }

    /**
     * Check if a specific feature is enabled for the current license.
     *
     * Reads from the locally cached features map (updated on validate/getStatus).
     * No API call is made -- the caller should call validate() first.
     *
     * @param string $feature The feature name to check
     * @return bool True if the feature is enabled, false otherwise
     */
    public function hasFeature(string $feature): bool
    {
        return $this->features[$feature] ?? false;
    }

    /**
     * Request a domain verification token for the activation flow.
     *
     * Calls POST /api/v1/license/verification-token.
     * Returns a VerificationTokenResponse containing the 32-hex-char token.
     *
     * @param string $domain The domain to get a verification token for (will be normalized)
     * @return VerificationTokenResponse
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    public function requestVerificationToken(string $domain): VerificationTokenResponse
    {
        $normalizedDomain = $this->normalizeDomain($domain);

        $body = [
            'license_key' => $this->licenseKey,
            'api_token' => $this->apiToken,
            'domain' => $normalizedDomain,
        ];

        $result = $this->callApi(self::ENDPOINT_VERIFICATION_TOKEN, $body);
        return new VerificationTokenResponse($result['data']);
    }

    /**
     * WordPress static factory. Auto-discovers config from WP options/constants.
     *
     * Per D-05: zero-config for plugin authors who use the admin settings page.
     * Per D-12: constants take priority over options when both exist.
     *
     * @return self
     */
    public static function wordpress(): self
    {
        $serverUrl = defined('CONVERSIONFLOW_SERVER_URL')
            ? CONVERSIONFLOW_SERVER_URL
            : get_option('conversionflow_server_url', '');

        $licenseKey = defined('CONVERSIONFLOW_LICENSE_KEY')
            ? CONVERSIONFLOW_LICENSE_KEY
            : get_option('conversionflow_license_key', '');

        $apiToken = defined('CONVERSIONFLOW_API_TOKEN')
            ? CONVERSIONFLOW_API_TOKEN
            : get_option('conversionflow_api_token', '');

        $client = new self($serverUrl, $licenseKey, $apiToken);
        $client->setTransport(new WpTransport());
        $client->setLogger(new WpLogger());
        return $client;
    }

    /**
     * Set a custom HTTP transport (e.g., WpTransport for WordPress).
     *
     * @param TransportInterface $transport
     * @return void
     */
    public function setTransport(TransportInterface $transport): void
    {
        $this->transport = $transport;
    }

    /**
     * Set a PSR-3 logger for SDK debug output.
     *
     * @param LoggerInterface $logger
     * @return void
     */
    public function setLogger(LoggerInterface $logger): void
    {
        $this->logger = $logger;
    }

    /**
     * Normalize a domain string to match the server's Domain.ts rules exactly.
     *
     * Steps:
     * 1. Lowercase and trim
     * 2. Strip https?:// protocol
     * 3. Strip www. prefix
     * 4. Strip trailing slashes and paths
     * 5. Strip port numbers
     *
     * @param string $input The raw domain input
     * @return string The normalized domain
     */
    private function normalizeDomain(string $input): string
    {
        $normalized = strtolower(trim($input));

        // Strip protocol
        $normalized = preg_replace('/^https?:\/\//', '', $normalized);

        // Strip www prefix
        $normalized = preg_replace('/^www\./', '', $normalized);

        // Strip trailing slashes and paths
        $normalized = preg_replace('/\/.*$/', '', $normalized);

        // Strip port numbers
        $normalized = preg_replace('/:\d+$/', '', $normalized);

        return $normalized;
    }

    /**
     * Detect the current domain from server variables.
     *
     * In the core SDK, reads from $_SERVER. The WordPress layer
     * overrides this via WpTransport or direct domain setting.
     *
     * @return string
     */
    private function detectDomain(): string
    {
        $domain = 'localhost';
        if (isset($_SERVER['HTTP_HOST'])) {
            $domain = $_SERVER['HTTP_HOST'];
        } elseif (isset($_SERVER['SERVER_NAME'])) {
            $domain = $_SERVER['SERVER_NAME'];
        }

        return $this->normalizeDomain($domain);
    }

    /**
     * Make an API call to the ConversionFlow server.
     *
     * Handles response parsing and HTTP status code classification.
     * - HTTP 5xx: throws SdkException
     * - Connection failure: throws SdkException (caller handles cache fallback)
     * - HTTP 4xx: returns error data without throwing
     * - HTTP 200: returns parsed data
     *
     * @param string $endpoint The API endpoint path (e.g., /api/v1/license/validate)
     * @param array $body The request body
     * @return array{status: int, data: array}
     *
     * @throws SdkException On connection failure or HTTP 5xx
     */
    private function callApi(string $endpoint, array $body): array
    {
        $url = $this->serverUrl . $endpoint;

        $this->logger->debug('ConversionFlow SDK: API call', [
            'endpoint' => $endpoint,
        ]);

        try {
            $response = $this->transport->post($url, $body);
        } catch (SdkException $e) {
            $this->logger->error('ConversionFlow SDK: Connection failure', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        $status = $response['status'];
        $data = json_decode($response['body'], true);

        if (!is_array($data)) {
            throw new SdkException(
                'Invalid JSON response from server',
                0,
                ['endpoint' => $endpoint, 'status' => $status, 'body' => $response['body']]
            );
        }

        $this->logger->debug('ConversionFlow SDK: API response', [
            'endpoint' => $endpoint,
            'status' => $status,
        ]);

        // HTTP 5xx -- server error
        if ($status >= 500) {
            throw new SdkException(
                'Server error: HTTP ' . $status,
                $status,
                ['endpoint' => $endpoint, 'status' => $status]
            );
        }

        return [
            'status' => $status,
            'data' => $data,
        ];
    }

    /**
     * Retrieve cached validation data if within TTL.
     *
     * Checks in-memory cache first, then WordPress options if available.
     *
     * @return array|null Cached data or null if expired/missing
     */
    private function getFromCache(): ?array
    {
        // Check in-memory cache first
        if ($this->cachedValidation !== null && $this->cacheExpiresAt !== null && time() < $this->cacheExpiresAt) {
            return $this->cachedValidation;
        }

        // Check WordPress options if function_exists
        if (function_exists('get_option')) {
            $cached = get_option(self::OPTION_CACHE, null);
            $expires = get_option(self::OPTION_CACHE_EXPIRES, null);
            if ($cached && $expires && time() < (int) $expires) {
                $this->cachedValidation = is_string($cached) ? json_decode($cached, true) : $cached;
                $this->cacheExpiresAt = (int) $expires;
                return $this->cachedValidation;
            }
        }

        return null;
    }

    /**
     * Store validation data in cache with 24h TTL.
     *
     * Stores in memory and in WordPress options if available.
     *
     * @param array $data The validation response data to cache
     * @return void
     */
    private function storeCache(array $data): void
    {
        $this->cachedValidation = $data;
        $this->cacheExpiresAt = time() + self::CACHE_TTL;

        // Store in WordPress options if available
        if (function_exists('update_option')) {
            update_option(self::OPTION_CACHE, json_encode($data));
            update_option(self::OPTION_CACHE_EXPIRES, (string) $this->cacheExpiresAt);
        }
    }
}
