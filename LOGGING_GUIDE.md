# Logging & Error Tracking Guide

## Overview

The application includes comprehensive logging and error tracking systems for both frontend and backend:

- **Backend**: `LoggerService` for structured logging via Monolog
- **Frontend**: `Logger` service for client-side logging + `ErrorTracker` for error reporting

## Backend Logging

### LoggerService

Injected via dependency injection in any service or controller:

```php
<?php

namespace App\Controller;

use App\Service\LoggerService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MyController extends AbstractController
{
    public function __construct(private LoggerService $logger)
    {
    }

    public function someAction()
    {
        // Different log levels
        $this->logger->debug('Debug message', ['user_id' => 123]);
        $this->logger->info('User action completed');
        $this->logger->warning('Unusual behavior detected');
        $this->logger->error('Operation failed', $exception);
        $this->logger->critical('System failure', $exception);

        // Specialized logging
        $this->logger->logRequest($request);
        $this->logger->logAuth('login', 'user@example.com', true);
        $this->logger->logValidationError('User', $errors);
        $this->logger->logSecurityEvent('Unauthorized access attempt', 'warning');
    }
}
```

### Log Output Location

Logs are stored in:

- **Development**: `/var/log/dev.log`
- **Production**: `/var/log/prod.log`

View logs in real-time:

```bash
docker compose exec sae-backend tail -f var/log/dev.log
```

## Frontend Logging

### Logger Service

```typescript
import { logger } from "@/services/logger";

// Basic logging
logger.debug("Debug message", { details: "here" });
logger.info("User logged in");
logger.warn("API request slow", { duration_ms: 5000 });
logger.error("Failed to load tweets", error, { endpoint: "/api/tweets" });
logger.critical("Critical system failure", error);

// Specialized logging
logger.logRequest("GET", "/api/tweets");
logger.logResponse("GET", "/api/tweets", 200, 234, { cached: true });
logger.logUserAction("follow_user", { user_id: 123 });
logger.logComponent("TweetCard", "mounted", { tweet_id: 456 });
logger.logNavigation("/feed", "/explore");
logger.logStateChange("store", "loadTweets");

// Access logs
const allLogs = logger.getLogs();
const errors = logger.getLogsByLevel("error");

// Export logs
const json = logger.export();
await logger.exportToFile("logs.json");
await logger.sendToBackend("/api/logs");
```

## Error Tracking

### ErrorTracker Service

```typescript
import { errorTracker } from "@/services/errorTracker";

// Track errors
const report = errorTracker.trackError(
  "Failed to load user profile",
  error,
  "high",
  { userId: 123 },
);

// Track specific error types
errorTracker.trackNetworkError("GET", "/api/users/123", 404, error);
errorTracker.trackValidationError("email", "Invalid email format");

// Query errors
const allErrors = errorTracker.getErrors();
const unresolvedErrors = errorTracker.getErrors(false); // Not resolved
const criticalErrors = errorTracker.getErrorsBySeverity("critical");
const errorCounts = errorTracker.getErrorCount(); // By severity
const mediumErrorCount = errorTracker.getErrorCount("medium");

// Manage errors
errorTracker.resolveError(report.id);
errorTracker.clear();

// Export/Import
const json = errorTracker.export();
errorTracker.import(json);

// Send to backend for analysis
await errorTracker.sendToBackend("/api/errors");
```

## Integration Examples

### In API Calls

```typescript
import { logger } from "@/services/logger";
import { errorTracker } from "@/services/errorTracker";

async function fetchTweets() {
  logger.logRequest("GET", "/api/tweets/explore");
  const start = performance.now();

  try {
    const response = await fetch("/api/tweets/explore");
    const duration = performance.now() - start;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    logger.logResponse("GET", "/api/tweets/explore", response.status, duration);
    return await response.json();
  } catch (error) {
    const duration = performance.now() - start;
    logger.logResponse("GET", "/api/tweets/explore", 500, duration);
    errorTracker.trackNetworkError("GET", "/api/tweets/explore", 500, error);
    throw error;
  }
}
```

### In Components (React)

```typescript
import { useEffect } from 'react'
import { logger } from '@/services/logger'

export function TweetCard({ tweet }) {
  useEffect(() => {
    logger.logComponent('TweetCard', 'mounted', { tweet_id: tweet.id })

    return () => {
      logger.logComponent('TweetCard', 'unmounted', { tweet_id: tweet.id })
    }
  }, [tweet.id])

  async function handleDelete() {
    try {
      logger.logUserAction('delete_tweet', { tweet_id: tweet.id })
      await deleteTweet(tweet.id)
      logger.info('Tweet deleted successfully', { tweet_id: tweet.id })
    } catch (error) {
      logger.error('Failed to delete tweet', error, { tweet_id: tweet.id })
      errorTracker.trackError('Failed to delete tweet', error, 'high')
    }
  }

  return (
    <div>
      {/* Component content */}
      <button onClick={handleDelete}>Delete</button>
    </div>
  )
}
```

### In Error Boundary

```typescript
import { Component } from "react";
import { logger } from "@/services/logger";
import { errorTracker } from "@/services/errorTracker";

class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    logger.critical("React Error Caught", error, {
      componentStack: errorInfo.componentStack,
    });

    errorTracker.trackError("React component error", error, "critical", {
      componentStack: errorInfo.componentStack,
    });
  }
}
```

## Log Levels

| Level      | Usage                     | Color    |
| ---------- | ------------------------- | -------- |
| `debug`    | Detailed development info | Gray     |
| `info`     | General informational     | Blue     |
| `warn`     | Warning condition         | Yellow   |
| `error`    | Error condition           | Red      |
| `critical` | Critical failure          | Bold Red |

## Error Severity

| Severity   | HTTP Code    | Use Case                        |
| ---------- | ------------ | ------------------------------- |
| `low`      | 2xx, 3xx     | Minor validation, non-blocking  |
| `medium`   | 4xx          | User action failures, conflicts |
| `high`     | 4xx critical | Auth failures, data loss        |
| `critical` | 5xx          | Server errors, system failures  |

## Accessing Logs in Browser Console

```javascript
// Access logger
window.$logger.getLogs();
window.$logger.export();

// Access error tracker
window.$errorTracker.getErrors();
window.$errorTracker.export();
```

## Monitoring Guidelines

### What to Log

✅ **DO log:**

- User actions (login, post creation, follows)
- HTTP requests/responses
- Validation failures
- Errors and exceptions
- State changes (in development)
- Component lifecycle (in development)

### What NOT to Log

❌ **DON'T log:**

- Passwords or sensitive tokens
- Personal user data (emails, IP addresses)
- Large data objects (serialize instead)
- Redundant debugging info

### Log Retention

- Frontend logs kept in memory (max 1000 entries)
- Backend logs rotate daily
- Old logs automatically archived
- Export logs before clearing

## Performance Tips

1. **Use appropriate log levels** - Debug logs are only visible in development
2. **Include context** - Use objects instead of string concatenation
3. **Batch exports** - Don't send individual logs, batch them
4. **Clear old logs** - Use `logger.clear()` or `errorTracker.clear()`
5. **Monitor thresholds** - ErrorTracker alerts when error counts exceed limits

## Future Enhancements

- [ ] Integration with Sentry for error reporting
- [ ] Real-time log streaming dashboard
- [ ] Automated error alerting system
- [ ] Performance metrics tracking
- [ ] User session tracking
- [ ] A/B test logging
