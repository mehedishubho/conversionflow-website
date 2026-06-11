<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Tests;

use ConversionFlow\Sdk\Client;
use ConversionFlow\Sdk\Exception\SdkException;
use ConversionFlow\Sdk\Tests\Transport\MockTransport;
use PHPUnit\Framework\TestCase;

/**
 * Tests for the ConversionFlow SDK Client.
 *
 * Uses MockTransport to simulate API responses without network calls.
 */
class ClientTest extends TestCase
{
    /**
     * Create a Client instance with MockTransport.
     *
     * @param MockTransport $transport
     * @return Client
     */
    private function createClient(MockTransport $transport): Client
    {
        $client = new Client(
            'https://api.example.com',
            'CF-TEST-1234-5678-ABCD-EFGH-IJKL',
            'test-api-token'
        );
        $client->setTransport($transport);
        return $client;
    }

    /**
     * Create a mock response array.
     *
     * @param int $status HTTP status code
     * @param array $body Response body to be JSON-encoded
     * @return array
     */
    private function mockResponse(int $status, array $body): array
    {
        return [
            'status' => $status,
            'body' => json_encode($body),
            'headers' => [],
        ];
    }

    // -------------------------------------------------------
    // validate() tests
    // -------------------------------------------------------

    public function testValidateReturnsSuccessfulResponse(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'grace_period_expires_at' => null,
            'max_activations' => 5,
            'current_activations' => 2,
            'error' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->validate();

        $this->assertTrue($response->isSuccessful());
        $this->assertEquals('lic_abc123', $response->getLicenseId());
        $this->assertEquals('professional', $response->getPlan());
        $this->assertEquals(5, $response->getMaxActivations());
        $this->assertEquals(2, $response->getCurrentActivations());
        $this->assertNull($response->getError());
    }

    public function testValidateReturnsErrorOnInvalidLicense(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(404, [
            'valid' => false,
            'license_id' => null,
            'plan' => null,
            'expires_at' => null,
            'max_activations' => null,
            'current_activations' => null,
            'error' => 'INVALID_LICENSE',
        ]));

        $client = $this->createClient($transport);
        $response = $client->validate();

        $this->assertFalse($response->isSuccessful());
        $this->assertEquals('INVALID_LICENSE', $response->getError());
        $this->assertNull($response->getLicenseId());
    }

    public function testValidateHandlesRateLimiting(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(429, [
            'valid' => false,
            'license_id' => null,
            'plan' => null,
            'expires_at' => null,
            'max_activations' => null,
            'current_activations' => null,
            'error' => 'RATE_LIMITED',
        ]));

        $client = $this->createClient($transport);
        $response = $client->validate();

        $this->assertFalse($response->isSuccessful());
        $this->assertEquals('RATE_LIMITED', $response->getError());
    }

    // -------------------------------------------------------
    // activate() tests
    // -------------------------------------------------------

    public function testActivateSendsVerificationTokenAndMetaMethod(): void
    {
        $transport = new MockTransport();

        // First response: verification token
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'token' => 'abc123def456',
        ]));

        // Second response: activation result
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 3,
            'error' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->activate('example.com');

        // Verify activation request contains verification_method and token
        $requests = $transport->getRequests();
        $this->assertCount(2, $requests);

        // Second request is the activate call
        $activateRequest = $requests[1];
        $this->assertEquals('meta', $activateRequest['body']['verification_method']);
        $this->assertEquals('abc123def456', $activateRequest['body']['verification_token']);
        $this->assertEquals('example.com', $activateRequest['body']['domain']);
    }

    public function testActivateReturnsSuccessfulResponse(): void
    {
        $transport = new MockTransport();

        // Verification token response
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'token' => 'test-token-32hexchars000000000000',
        ]));

        // Activation response
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 3,
            'error' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->activate('example.com');

        $this->assertTrue($response->isSuccessful());
        $this->assertEquals('lic_abc123', $response->getLicenseId());
        $this->assertEquals('professional', $response->getPlan());
        $this->assertEquals(3, $response->getCurrentActivations());
    }

    // -------------------------------------------------------
    // deactivate() tests
    // -------------------------------------------------------

    public function testDeactivateSendsCorrectRequest(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 2,
            'error' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->deactivate('example.com');

        $this->assertTrue($response->isSuccessful());

        // Verify request body
        $lastRequest = $transport->getLastRequest();
        $this->assertEquals('CF-TEST-1234-5678-ABCD-EFGH-IJKL', $lastRequest['body']['license_key']);
        $this->assertEquals('test-api-token', $lastRequest['body']['api_token']);
        $this->assertEquals('example.com', $lastRequest['body']['domain']);
    }

    // -------------------------------------------------------
    // checkUpdate() tests
    // -------------------------------------------------------

    public function testCheckUpdateReturnsUpdateAvailable(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'update_available' => true,
            'slug' => 'conversionflow',
            'new_version' => '2.0.0',
            'url' => 'https://conversionflow.com/changelog',
            'package' => 'https://api.example.com/api/v1/update/download?token=signed123',
            'download_url' => 'https://api.example.com/api/v1/update/download?token=signed123',
            'last_updated' => '2026-06-01',
            'sections' => ['description' => 'Test update'],
            'requires' => '5.0',
            'tested' => '6.5',
            'requires_php' => '7.4',
        ]));

        $client = $this->createClient($transport);
        $response = $client->checkUpdate('1.0.0', 'conversionflow');

        $this->assertTrue($response->isSuccessful());
        $this->assertTrue($response->hasUpdate());
        $this->assertEquals('2.0.0', $response->getNewVersion());
        $this->assertEquals('7.4', $response->getRequiresPhp());
    }

    public function testCheckUpdateReturnsNoUpdate(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'update_available' => false,
        ]));

        $client = $this->createClient($transport);
        $response = $client->checkUpdate('2.0.0', 'conversionflow');

        $this->assertTrue($response->isSuccessful());
        $this->assertFalse($response->hasUpdate());
    }

    // -------------------------------------------------------
    // getStatus() tests
    // -------------------------------------------------------

    public function testGetStatusReturnsFeaturesAndActivations(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'status' => 'active',
            'plan' => ['name' => 'Professional', 'slug' => 'professional'],
            'product' => ['name' => 'ConversionFlow', 'slug' => 'conversionflow'],
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'grace_period_expires_at' => null,
            'max_activations' => 5,
            'current_activations' => 2,
            'activations' => [
                ['domain' => 'example.com', 'activated_at' => '2026-01-15T10:30:00.000Z'],
                ['domain' => 'test.store', 'activated_at' => '2026-03-20T14:00:00.000Z'],
            ],
            'features' => [
                'courier_sync' => true,
                'fraud_shield' => true,
                'analytics' => false,
            ],
            'license_type' => 'subscription',
            'error' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->getStatus();

        $this->assertTrue($response->isSuccessful());
        $this->assertEquals('active', $response->getStatus());

        $features = $response->getFeatures();
        $this->assertTrue($features['courier_sync']);
        $this->assertTrue($features['fraud_shield']);
        $this->assertFalse($features['analytics']);

        $activations = $response->getActivations();
        $this->assertCount(2, $activations);
        $this->assertEquals('example.com', $activations[0]['domain']);
    }

    // -------------------------------------------------------
    // hasFeature() tests
    // -------------------------------------------------------

    public function testHasFeatureReturnsTrueForCachedFeature(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 1,
            'error' => null,
            'features' => ['courier_sync' => true, 'analytics' => true],
        ]));

        $client = $this->createClient($transport);
        $client->validate(); // Populates features cache

        $this->assertTrue($client->hasFeature('courier_sync'));
        $this->assertTrue($client->hasFeature('analytics'));
    }

    public function testHasFeatureReturnsFalseForMissingFeature(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'starter',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 1,
            'current_activations' => 1,
            'error' => null,
            'features' => ['courier_sync' => true],
        ]));

        $client = $this->createClient($transport);
        $client->validate(); // Populates features cache

        $this->assertTrue($client->hasFeature('courier_sync'));
        $this->assertFalse($client->hasFeature('premium_analytics'));
    }

    // -------------------------------------------------------
    // Domain normalization tests
    // -------------------------------------------------------

    public function testDomainNormalizationMatchesServer(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 1,
            'error' => null,
        ]));

        $client = $this->createClient($transport);

        // Call validate to trigger a request, then check the domain sent
        $client->validate();

        // Now test via reflection to verify normalizeDomain directly
        $reflection = new \ReflectionClass($client);
        $method = $reflection->getMethod('normalizeDomain');
        $method->setAccessible(true);

        // Test: "https://www.example.com/" -> "example.com"
        $this->assertEquals('example.com', $method->invoke($client, 'https://www.example.com/'));
        // Test: "http://test.store" -> "test.store"
        $this->assertEquals('test.store', $method->invoke($client, 'http://test.store'));
        // Test: "www.mysite.com/path/to/page" -> "mysite.com"
        $this->assertEquals('mysite.com', $method->invoke($client, 'www.mysite.com/path/to/page'));
    }

    public function testDomainNormalizationStripsPort(): void
    {
        $transport = new MockTransport();
        $client = $this->createClient($transport);

        $reflection = new \ReflectionClass($client);
        $method = $reflection->getMethod('normalizeDomain');
        $method->setAccessible(true);

        // "www.test.store:8080" -> "test.store"
        $this->assertEquals('test.store', $method->invoke($client, 'www.test.store:8080'));
        // "https://example.com:443" -> "example.com"
        $this->assertEquals('example.com', $method->invoke($client, 'https://example.com:443'));
    }

    public function testDomainNormalizationLowercases(): void
    {
        $transport = new MockTransport();
        $client = $this->createClient($transport);

        $reflection = new \ReflectionClass($client);
        $method = $reflection->getMethod('normalizeDomain');
        $method->setAccessible(true);

        // "HTTPS://WWW.MY-SITE.COM/" -> "my-site.com"
        $this->assertEquals('my-site.com', $method->invoke($client, 'HTTPS://WWW.MY-SITE.COM/'));
    }

    // -------------------------------------------------------
    // Offline cache tests
    // -------------------------------------------------------

    public function testOfflineCacheReturnsLastValidationOnFailure(): void
    {
        $transport = new MockTransport();

        // First call: successful validation
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 1,
            'error' => null,
        ]));

        $client = $this->createClient($transport);

        // First call succeeds and caches
        $response1 = $client->validate();
        $this->assertTrue($response1->isSuccessful());
        $this->assertEquals('lic_abc123', $response1->getLicenseId());

        // Second call: connection failure
        $transport->setException(new SdkException('Connection refused', 0, []));

        // Should return cached response
        $response2 = $client->validate();
        $this->assertTrue($response2->isSuccessful());
        $this->assertEquals('lic_abc123', $response2->getLicenseId());
    }

    public function testOfflineCacheExpiresAfter24Hours(): void
    {
        $transport = new MockTransport();

        // Successful validation
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'license_id' => 'lic_abc123',
            'plan' => 'professional',
            'expires_at' => '2027-01-01T00:00:00.000Z',
            'max_activations' => 5,
            'current_activations' => 1,
            'error' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->validate();
        $this->assertTrue($response->isSuccessful());

        // Manipulate cache timestamp to simulate expiry
        // Use reflection to set cacheExpiresAt to the past
        $reflection = new \ReflectionClass($client);
        $prop = $reflection->getProperty('cacheExpiresAt');
        $prop->setAccessible(true);
        $prop->setValue($client, time() - 1); // Already expired

        // Connection failure
        $transport->setException(new SdkException('Connection refused', 0, []));

        // Should throw because cache is expired
        $this->expectException(SdkException::class);
        $client->validate();
    }

    // -------------------------------------------------------
    // requestVerificationToken() tests
    // -------------------------------------------------------

    public function testRequestVerificationTokenReturnsToken(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(200, [
            'valid' => true,
            'token' => 'abc123def456789012345678901234ab',
        ]));

        $client = $this->createClient($transport);
        $response = $client->requestVerificationToken('example.com');

        $this->assertTrue($response->isSuccessful());
        $this->assertEquals('abc123def456789012345678901234ab', $response->getToken());
        $this->assertNull($response->getError());
    }

    public function testRequestVerificationTokenReturnsErrorOnInvalidLicense(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(404, [
            'valid' => false,
            'error' => 'INVALID_LICENSE',
            'token' => null,
        ]));

        $client = $this->createClient($transport);
        $response = $client->requestVerificationToken('example.com');

        $this->assertFalse($response->isSuccessful());
        $this->assertEquals('INVALID_LICENSE', $response->getError());
        $this->assertNull($response->getToken());
    }

    // -------------------------------------------------------
    // Server error tests
    // -------------------------------------------------------

    public function testServerErrorThrowsSdkException(): void
    {
        $transport = new MockTransport();
        $transport->setResponse($this->mockResponse(500, [
            'error' => 'Internal Server Error',
        ]));

        $client = $this->createClient($transport);

        $this->expectException(SdkException::class);
        $client->validate();
    }
}
