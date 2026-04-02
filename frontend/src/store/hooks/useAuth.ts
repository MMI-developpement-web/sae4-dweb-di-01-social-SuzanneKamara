/**
 * useAuth Hook
 * Accès simplifié au store d'authentification
 * Utilise le système de token API simple de Symfony Security
 */

import { useAuthStore } from '../slices/authSlice'

export const useAuth = () => {
  return useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
    setToken: state.setToken,
    setError: state.setError,
    clearError: state.clearError,
  }))
}
