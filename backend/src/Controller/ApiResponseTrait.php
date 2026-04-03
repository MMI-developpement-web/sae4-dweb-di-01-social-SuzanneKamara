<?php

namespace App\Controller;

use App\Service\ApiResponseService;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Trait for standardized API responses in controllers
 * Usage: Use ApiResponseTrait in your controller class
 */
trait ApiResponseTrait
{
    /**
     * Return a success response
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code (default 200)
     */
    protected function jsonSuccess(
        $data = null,
        string $message = 'Success',
        int $statusCode = 200
    ): JsonResponse {
        return $this->json(
            ApiResponseService::success($data, $message),
            $statusCode
        );
    }

    /**
     * Return an error response
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param string $code Error code identifier
     */
    protected function jsonError(
        string $message,
        int $statusCode = 400,
        string $code = 'UNKNOWN_ERROR'
    ): JsonResponse {
        return $this->json(
            ApiResponseService::error($message, $code),
            $statusCode
        );
    }

    /**
     * Return a not found response
     */
    protected function jsonNotFound(string $resource = 'Resource'): JsonResponse
    {
        return $this->json(
            ApiResponseService::notFound($resource),
            404
        );
    }

    /**
     * Return an unauthorized response
     */
    protected function jsonUnauthorized(string $message = 'Authentication required'): JsonResponse
    {
        return $this->json(
            ApiResponseService::unauthorized($message),
            401
        );
    }

    /**
     * Return a forbidden response
     */
    protected function jsonForbidden(string $message = 'Not authorized'): JsonResponse
    {
        return $this->json(
            ApiResponseService::forbidden($message),
            403
        );
    }

    /**
     * Return validation error response
     * @param array $fieldErrors Array of field => error message
     */
    protected function jsonValidationError(
        array $fieldErrors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return $this->json(
            ApiResponseService::validationError($fieldErrors, $message),
            400
        );
    }

    /**
     * Return a conflict response
     */
    protected function jsonConflict(
        string $message,
        string $field = null
    ): JsonResponse {
        return $this->json(
            ApiResponseService::conflict($message, $field),
            409
        );
    }
}
