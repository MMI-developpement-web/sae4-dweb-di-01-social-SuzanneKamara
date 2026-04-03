<?php

namespace App\Service;

/**
 * Standardized API Response Service
 * Provides consistent response structures across all API endpoints
 */
class ApiResponseService
{
    /**
     * Success response structure
     * @param mixed $data The response data
     * @param string $message Optional success message
     * @return array
     */
    public static function success($data = null, string $message = 'Success'): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => [],
        ];
    }

    /**
     * Error response structure
     * @param string $message Error message
     * @param string $code Error code/identifier
     * @param array $details Additional error details
     * @return array
     */
    public static function error(
        string $message,
        string $code = 'UNKNOWN_ERROR',
        array $details = []
    ): array {
        return [
            'success' => false,
            'message' => $message,
            'code' => $code,
            'data' => null,
            'errors' => [],
            'details' => $details,
        ];
    }

    /**
     * Validation error response (multiple field errors)
     * @param array $fieldErrors Array of field => error message pairs
     * @param string $message Optional overall message
     * @return array
     */
    public static function validationError(
        array $fieldErrors,
        string $message = 'Validation failed'
    ): array {
        return [
            'success' => false,
            'message' => $message,
            'code' => 'VALIDATION_ERROR',
            'data' => null,
            'errors' => $fieldErrors,
            'details' => [],
        ];
    }

    /**
     * Not found error
     * @param string $resource Resource type (e.g., 'User', 'Tweet')
     * @return array
     */
    public static function notFound(string $resource = 'Resource'): array
    {
        return self::error(
            "{$resource} not found",
            'NOT_FOUND',
            ['resource' => $resource]
        );
    }

    /**
     * Unauthorized error
     * @param string $message Optional custom message
     * @return array
     */
    public static function unauthorized(string $message = 'Authentication required'): array
    {
        return self::error($message, 'UNAUTHORIZED');
    }

    /**
     * Forbidden error
     * @param string $message Optional custom message
     * @return array
     */
    public static function forbidden(string $message = 'Not authorized'): array
    {
        return self::error($message, 'FORBIDDEN');
    }

    /**
     * Conflict error (e.g., duplicate entry)
     * @param string $message Conflict description
     * @param string $field Field that has the conflict
     * @return array
     */
    public static function conflict(string $message, string $field = null): array
    {
        return self::error(
            $message,
            'CONFLICT',
            $field ? ['field' => $field] : []
        );
    }

    /**
     * Convert legacy error format to new format
     * For backwards compatibility during migration
     */
    public static function legacyErrorToNew(array $legacyError): array
    {
        $message = $legacyError['error'] ?? $legacyError['message'] ?? 'Unknown error';
        return self::error($message);
    }
}
