import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

export interface RefreshPreferences {
  autoRefreshEnabled: boolean
  autoRefreshInterval: number // in seconds
}

interface RefreshPreferencesContextType {
  preferences: RefreshPreferences
  updatePreferences: (prefs: Partial<RefreshPreferences>) => void
}

const defaultPreferences: RefreshPreferences = {
  autoRefreshEnabled: false,
  autoRefreshInterval: 30,
}

const RefreshPreferencesContext = createContext<RefreshPreferencesContextType | undefined>(undefined)

export function RefreshPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<RefreshPreferences>(defaultPreferences)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('refreshPreferences')
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences(parsed)
      }
    } catch {
      // Silently ignore storage errors
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const updatePreferences = useCallback((prefs: Partial<RefreshPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...prefs }
      try {
        localStorage.setItem('refreshPreferences', JSON.stringify(updated))
      } catch {
        // Silently ignore storage errors
      }
      return updated
    })
  }, [])

  // Don't render children until preferences are loaded to avoid hydration mismatch
  if (!isLoaded) {
    return null
  }

  return (
    <RefreshPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </RefreshPreferencesContext.Provider>
  )
}

export function useRefreshPreferences() {
  const context = useContext(RefreshPreferencesContext)
  if (context === undefined) {
    throw new Error('useRefreshPreferences must be used within RefreshPreferencesProvider')
  }
  return context
}
