# API Response Standard

## Overview

This document describes the standardized API response format used across all endpoints. This format was implemented to ensure consistency, better error handling, and improved client-side integration.

## Standard Response Structure

### Success Response

```json
{
    "success": true,
    "message": "Success",
    "data": {
        /* any response data */
    },
    "errors": []
}
```

**HTTP Status Codes:**

- `200 OK` - Successful GET/POST
- `201 Created` - Successful resource creation
- `204 No Content` - Successful operation with no response body

### Error Response

```json
{
    "success": false,
    "message": "Error message describing what went wrong",
    "code": "ERROR_CODE",
    "data": null,
    "errors": [],
    "details": {
        /* optional additional context */
    }
}
```

**HTTP Status Codes:**

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (duplicate, etc.)
- `500 Internal Server Error` - Server error

### Validation Error Response

```json
{
    "success": false,
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "data": null,
    "errors": {
        "username": "Username must be at least 3 characters",
        "email": "Invalid email format",
        "password": "Password must contain uppercase, lowercase, number, and special character"
    },
    "details": []
}
```

## Error Codes

Common error codes used throughout the API:

| Code               | Status | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| `UNKNOWN_ERROR`    | 400    | Default error code                           |
| `VALIDATION_ERROR` | 400    | Validation failed                            |
| `NOT_FOUND`        | 404    | Resource not found                           |
| `UNAUTHORIZED`     | 401    | Authentication required                      |
| `FORBIDDEN`        | 403    | User doesn't have permission                 |
| `CONFLICT`         | 409    | Resource already exists or conflicting state |

## Usage in Controllers

### Using the ApiResponseTrait

Controllers should use the `ApiResponseTrait` to access helper methods:

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

class MyController extends AbstractController
{
    use ApiResponseTrait;

    public function myAction(): JsonResponse
    {
        // Success response
        return $this->jsonSuccess($data, 'Resource created', 201);

        // Error response
        return $this->jsonError('Something went wrong', 400, 'MY_ERROR_CODE');

        // Specific error types
        return $this->jsonNotFound('User');
        return $this->jsonUnauthorized();
        return $this->jsonForbidden();
        return $this->jsonConflict('Email already exists', 'email');

        // Validation errors
        return $this->jsonValidationError([
            'username' => 'Username already exists',
            'email' => 'Invalid email format'
        ]);
    }
}
```

## Examples

### Example: Get User

**Request:**

```
GET /api/users/123
Authorization: Bearer token
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Success",
    "data": {
        "id": 123,
        "username": "john_doe",
        "email": "john@example.com"
    },
    "errors": []
}
```

**Error Response (404):**

```json
{
    "success": false,
    "message": "User not found",
    "code": "NOT_FOUND",
    "data": null,
    "errors": [],
    "details": {
        "resource": "User"
    }
}
```

### Example: Create User

**Request:**

```
POST /api/users
Content-Type: application/json

{
  "username": "jane",
  "email": "jane@example.com",
  "password": "InvalidPass"
}
```

**Validation Error Response (400):**

```json
{
    "success": false,
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "data": null,
    "errors": {
        "username": "Username must be at least 3 characters",
        "password": "Password must contain at least one uppercase letter"
    },
    "details": []
}
```

## Migration Guide

### For Existing Controllers

To migrate an existing controller to use the new standard:

1. **Add the trait:**

    ```php
    use ApiResponseTrait;
    ```

2. **Replace error responses:**

    ```php
    // Old way
    return $this->json(['error' => 'Not authorized'], 403);

    // New way
    return $this->jsonForbidden();
    ```

3. **Replace validation errors:**

    ```php
    // Old way
    return $this->json(['errors' => $errorMessages], 400);

    // New way
    return $this->jsonValidationError($errorMessages);
    ```

4. **Replace success responses:**

    ```php
    // Old way
    return $this->json(['data' => $data]);

    // New way
    return $this->jsonSuccess($data);
    ```

## Frontend Integration

The frontend can now rely on a consistent response structure:

```typescript
interface ApiResponse<T> {
    success: boolean;
    message: string;
    code?: string;
    data?: T;
    errors?: Record<string, string>;
    details?: Record<string, any>;
}

// Usage
try {
    const response = await fetch("/api/users");
    const json: ApiResponse<User> = await response.json();

    if (json.success) {
        console.log("User:", json.data);
    } else {
        console.error("Error:", json.message);
        if (json.errors) {
            // Handle validation errors
            showFieldErrors(json.errors);
        }
    }
} catch (err) {
    // Network error
}
```

## Implementation Progress

Controllers updated with new response standard:

- [ ] TweetController
- [ ] UserController
- [ ] AuthController
- [ ] MediaController
- [ ] LikeController
- [ ] FollowController
- [ ] BlockController
- [ ] Others

**Note:** This is a gradual rollout. New response standard is optional but recommended for consistency.
