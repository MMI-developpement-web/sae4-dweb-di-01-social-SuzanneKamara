import { useEffect, useCallback, useRef } from 'react'
import { getCurrentUser } from '../lib/userService'
import { useAuth } from '../auth/useAuth'

/**
 * Hook to monitor if the current user gets blocked during their session.
 * Polls getCurrentUser every 30 seconds to check if is_blocked changed.
 * @param onBlocked - Callback fired if user becomes blocked during session
 */
export function useBlockedStatus(onBlocked?: () => void) {
  const { isAuthenticated } = useAuth()
  const wasBlockedRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkBlockedStatus = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      const user = await getCurrentUser()

      // If user just became blocked
      if (user.is_blocked && !wasBlockedRef.current) {
        wasBlockedRef.current = true
        onBlocked?.()
      }

      // If user was blocked but now unblocked (unlikely but possible)
      if (!user.is_blocked && wasBlockedRef.current) {
        wasBlockedRef.current = false
      }
    } catch (err) {
      // Silently fail - user might be logged out or have network issues
      console.error('Failed to check blocked status:', err)
    }
  }, [isAuthenticated, onBlocked])

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Check immediately on mount
    checkBlockedStatus()

    // Then check every 30 seconds
    intervalRef.current = setInterval(checkBlockedStatus, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, checkBlockedStatus])
}
