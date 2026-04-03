/**
 * Error Tracker - Tracks and reports application errors
 * Integrates with Logger service for persistent error logs
 */

import { logger, type LogLevel } from './logger'

export interface ErrorReport {
  id: string
  timestamp: string
  message: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  path?: string
  userAgent?: string
  userId?: string | number
  stack?: string
  context?: Record<string, unknown>
  resolved: boolean
  resolvedAt?: string
}

class ErrorTracker {
  private errors: Map<string, ErrorReport> = new Map()
  private maxErrors = 100
  private errorThresholds = {
    low: 10,
    medium: 5,
    high: 2,
    critical: 1,
  }

  /**
   * Track an error
   */
  trackError(
    message: string,
    error?: Error | unknown,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, unknown>,
  ): ErrorReport {
    const report: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message,
      type: error instanceof Error ? error.name : 'UnknownError',
      severity,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent:
        typeof navigator !== 'undefined'
          ? navigator.userAgent
          : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      context,
      resolved: false,
    }

    this.errors.set(report.id, report)

    // Keep map size manageable
    if (this.errors.size > this.maxErrors) {
      const oldestId = Array.from(this.errors.keys())[0]
      this.errors.delete(oldestId)
    }

    // Log the error
    this.logError(report)

    // Check if error threshold exceeded
    this.checkErrorThreshold(severity)

    return report
  }

  /**
   * Track a network error
   */
  trackNetworkError(
    method: string,
    url: string,
    status: number,
    error?: Error,
    context?: Record<string, unknown>,
  ): ErrorReport {
    const message = `Network Error: ${method} ${url} (${status})`
    return this.trackError(message, error, this.getSeverity(status), {
      method,
      url,
      status,
      ...context,
    })
  }

  /**
   * Track a validation error
   */
  trackValidationError(
    field: string,
    message: string,
    context?: Record<string, unknown>,
  ): ErrorReport {
    return this.trackError(`Validation Error: ${field}`, undefined, 'low', {
      field,
      message,
      ...context,
    })
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): void {
    const error = this.errors.get(errorId)
    if (error) {
      error.resolved = true
      error.resolvedAt = new Date().toISOString()
    }
  }

  /**
   * Get all errors
   */
  getErrors(resolved?: boolean): ErrorReport[] {
    return Array.from(this.errors.values()).filter((e) =>
      resolved !== undefined ? e.resolved === resolved : true,
    )
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: string): ErrorReport[] {
    return this.getErrors().filter((e) => e.severity === severity)
  }

  /**
   * Get error count by severity
   */
  getErrorCount(severity?: string): Record<string, number> | number {
    const errors = this.getErrors()

    if (severity) {
      return errors.filter((e) => e.severity === severity).length
    }

    return {
      low: errors.filter((e) => e.severity === 'low').length,
      medium: errors.filter((e) => e.severity === 'medium').length,
      high: errors.filter((e) => e.severity === 'high').length,
      critical: errors.filter((e) => e.severity === 'critical').length,
    }
  }

  /**
   * Clear errors
   */
  clear(): void {
    this.errors.clear()
  }

  /**
   * Export errors as JSON
   */
  export(): string {
    return JSON.stringify(Array.from(this.errors.values()), null, 2)
  }

  /**
   * Import errors from JSON
   */
  import(json: string): void {
    try {
      const errors = JSON.parse(json) as ErrorReport[]
      this.errors.clear()
      errors.forEach((error) => {
        this.errors.set(error.id, error)
      })
    } catch (error) {
      logger.error('Failed to import errors', error)
    }
  }

  /**
   * Send errors to backend
   */
  async sendToBackend(endpoint = '/api/errors'): Promise<void> {
    try {
      const unresolved = this.getErrors(false)
      if (unresolved.length === 0) return

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unresolved),
      })

      if (response.ok) {
        unresolved.forEach((error) => {
          this.resolveError(error.id)
        })
      }
    } catch (error) {
      logger.error('Failed to send errors to backend', error)
    }
  }

  /**
   * Generate unique error ID
   */
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Determine severity from HTTP status
   */
  private getSeverity(
    status: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (status >= 500) return 'critical'
    if (status >= 400) return 'high'
    if (status >= 300) return 'medium'
    return 'low'
  }

  /**
   * Log error using logger service
   */
  private logError(report: ErrorReport): void {
    const logLevel: LogLevel =
      report.severity === 'critical'
        ? 'critical'
        : report.severity === 'high'
          ? 'error'
          : report.severity === 'medium'
            ? 'warn'
            : 'info'

    logger[logLevel](report.message, {
      errorId: report.id,
      type: report.type,
      severity: report.severity,
      ...report.context,
    })
  }

  /**
   * Check if error threshold exceeded
   */
  private checkErrorThreshold(severity: string): void {
    const severityKey = severity as keyof typeof this.errorThresholds
    const count = this.getErrorCount(severity) as number
    const threshold = this.errorThresholds[severityKey]

    if (count >= threshold) {
      logger.warn(`Error threshold exceeded for ${severity} errors`, {
        severity,
        count,
        threshold,
      })

      // Could trigger alerts here if desired
    }
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker()

export default ErrorTracker
