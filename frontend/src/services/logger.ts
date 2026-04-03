/**
 * Centralized Logging Service for Frontend
 * Provides structured logging with different severity levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  stack?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs
  private isDevelopment = import.meta.env.DEV

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  /**
   * Log informational message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  /**
   * Log warning
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  /**
   * Log error
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const stack = error instanceof Error ? error.stack : undefined
    const errorContext = {
      ...context,
      ...(error instanceof Error && { errorName: error.name, errorMessage: error.message }),
    }
    this.log('error', message, errorContext, stack)
  }

  /**
   * Log critical error
   */
  critical(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const stack = error instanceof Error ? error.stack : undefined
    const errorContext = {
      ...context,
      ...(error instanceof Error && { errorName: error.name, errorMessage: error.message }),
    }
    this.log('critical', message, errorContext, stack)
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, context?: Record<string, unknown>): void {
    this.info('API Request', {
      method,
      path,
      ...context,
    })
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    const message = status >= 400 ? 'API Response Error' : 'API Response'
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    this.log(level, message, {
      method,
      path,
      status,
      duration_ms: duration,
      ...context,
    })
  }

  /**
   * Log user action
   */
  logUserAction(action: string, context?: Record<string, unknown>): void {
    this.info(`User Action: ${action}`, context)
  }

  /**
   * Log component lifecycle
   */
  logComponent(componentName: string, event: string, context?: Record<string, unknown>): void {
    this.debug(`Component: ${componentName} - ${event}`, context)
  }

  /**
   * Log navigation
   */
  logNavigation(from: string, to: string, context?: Record<string, unknown>): void {
    this.info('Navigation', {
      from,
      to,
      ...context,
    })
  }

  /**
   * Log state change
   */
  logStateChange(storeName: string, action: string, context?: Record<string, unknown>): void {
    this.debug(`State Change: ${storeName}.${action}`, context)
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Export logs to file (browser only)
   */
  async exportToFile(filename = 'logs.json'): Promise<void> {
    const content = this.export()
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Send logs to backend for persistence
   */
  async sendToBackend(endpoint = '/api/logs'): Promise<void> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: this.export(),
      })

      if (!response.ok) {
        console.warn('Failed to send logs to backend', response.status)
      }
    } catch (error) {
      console.error('Error sending logs to backend:', error)
    }
  }

  /**
   * Internal logging function
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    stack?: string,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(stack && { stack }),
    }

    this.logs.push(entry)

    // Keep array size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'critical' ? 'error' : level === 'warn' ? 'warn' : 'log'
      console[consoleMethod](
        `[${level.toUpperCase()}] ${message}`,
        context || '',
        stack ? `\nStack: ${stack}` : '',
      )
    }
  }
}

// Export singleton instance
export const logger = new Logger()

export default Logger
