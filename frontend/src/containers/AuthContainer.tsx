/**
 * Auth Container
 * Gère la logique d'authentification
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/store'

interface AuthContainerProps {
  children: (props: {
    user: any
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    error: string | null
  }) => React.ReactNode
}

export default function AuthContainer({ children }: AuthContainerProps) {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth()
  const [isReady, setIsReady] = useState(false)

  // Vérifier l'authentification au montage
  useEffect(() => {
    // Ici, tu pourrais vérifier si un token existe en localStorage
    // et recharger l'utilisateur
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Fetch current user
      // await fetchCurrentUser()
    }
    setIsReady(true)
  }, [])

  // Effacer les erreurs après 5 secondes
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timeout)
    }
  }, [error, clearError])

  if (!isReady) return <div>Chargement...</div>

  return (
    <>
      {children({
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        error,
      })}
    </>
  )
}
