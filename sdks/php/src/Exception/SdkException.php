<?php

declare(strict_types=1);

namespace ConversionFlow\Sdk\Exception;

/**
 * Base exception for ConversionFlow SDK errors.
 *
 * Carries an optional context array for debugging information
 * that should not be exposed to end users.
 */
class SdkException extends \Exception
{
    /** @var array */
    private $context;

    /**
     * @param string $message Human-readable error description
     * @param int $code Error code (defaults to 0)
     * @param array $context Additional debugging context
     * @param \Throwable|null $previous Previous exception if chaining
     */
    public function __construct(
        string $message,
        int $code = 0,
        array $context = [],
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
    }

    /**
     * Returns additional debugging context for this error.
     *
     * @return array
     */
    public function getContext(): array
    {
        return $this->context;
    }
}
