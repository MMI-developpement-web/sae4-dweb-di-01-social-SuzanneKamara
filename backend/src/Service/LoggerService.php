<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Centralized Logging Service
 * Provides structured logging with context and severity levels
 */
class LoggerService
{
    public function __construct(private LoggerInterface $logger) {}

    /**
     * Log debug information
     * @param string $message Log message
     * @param array $context Additional context
     */
    public function debug(string $message, array $context = []): void
    {
        $this->logger->debug($message, $context);
    }

    /**
     * Log informational message
     */
    public function info(string $message, array $context = []): void
    {
        $this->logger->info($message, $context);
    }

    /**
     * Log warning
     */
    public function warning(string $message, array $context = []): void
    {
        $this->logger->warning($message, $context);
    }

    /**
     * Log error with optional exception
     */
    public function error(string $message, \Throwable $exception = null, array $context = []): void
    {
        if ($exception) {
            $context['exception'] = $exception;
        }
        $this->logger->error($message, $context);
    }

    /**
     * Log critical error
     */
    public function critical(string $message, \Throwable $exception = null, array $context = []): void
    {
        if ($exception) {
            $context['exception'] = $exception;
        }
        $this->logger->critical($message, $context);
    }

    /**
     * Log API request
     * @param Request $request
     * @param array $additionalContext
     */
    public function logRequest(Request $request, array $additionalContext = []): void
    {
        $context = [
            'method' => $request->getMethod(),
            'path' => $request->getPathInfo(),
            'ip' => $request->getClientIp(),
            'user_agent' => $request->headers->get('User-Agent', 'Unknown'),
            ...$additionalContext,
        ];

        $this->info('API Request', $context);
    }

    /**
     * Log API response
     * @param int $statusCode
     * @param string $path
     * @param float $executionTime Time in milliseconds
     * @param array $additionalContext
     */
    public function logResponse(
        int $statusCode,
        string $path,
        float $executionTime = 0,
        array $additionalContext = []
    ): void {
        $context = [
            'status' => $statusCode,
            'path' => $path,
            'execution_time_ms' => $executionTime,
            ...$additionalContext,
        ];

        if ($statusCode >= 500) {
            $this->error('API Response Error', null, $context);
        } elseif ($statusCode >= 400) {
            $this->warning('API Response Warning', $context);
        } else {
            $this->info('API Response', $context);
        }
    }

    /**
     * Log user action with context
     */
    public function logUserAction(
        string $action,
        int $userId,
        array $context = []
    ): void {
        $this->info("User Action: {$action}", [
            'user_id' => $userId,
            ...$context,
        ]);
    }

    /**
     * Log authentication event
     */
    public function logAuth(string $event, string $email, bool $success, string $reason = ''): void
    {
        $context = [
            'event' => $event,
            'email' => $email,
            'success' => $success,
        ];

        if ($reason) {
            $context['reason'] = $reason;
        }

        $this->info('Authentication Event', $context);
    }

    /**
     * Log database operation
     */
    public function logDatabase(
        string $operation,
        string $entity,
        int $id = null,
        array $context = []
    ): void {
        $this->debug("Database Operation: {$operation}", [
            'entity' => $entity,
            'id' => $id,
            ...$context,
        ]);
    }

    /**
     * Log validation error
     */
    public function logValidationError(
        string $entity,
        array $errors,
        array $context = []
    ): void {
        $this->warning("Validation Error: {$entity}", [
            'entity' => $entity,
            'errors' => $errors,
            ...$context,
        ]);
    }

    /**
     * Log security event
     */
    public function logSecurityEvent(
        string $event,
        string $severity = 'warning',
        array $context = []
    ): void {
        $logLevel = match ($severity) {
            'critical' => $this->critical(...),
            'error' => $this->error(...),
            default => $this->warning(...),
        };

        $logLevel("Security Event: {$event}", null, $context);
    }

    /**
     * Log cache operation
     */
    public function logCache(string $operation, string $key, bool $success, array $context = []): void
    {
        $level = $success ? 'debug' : 'warning';
        $this->$level("Cache Operation: {$operation}", [
            'key' => $key,
            'success' => $success,
            ...$context,
        ]);
    }
}
