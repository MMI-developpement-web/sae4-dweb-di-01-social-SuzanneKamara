/**
 * Auth Store Slice
 * Gère l'authentification et l'utilisateur connecté
 * Utilise le système de token API simple de Symfony Security
 */

import { create } from 'zustand'
import type { AuthState } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // Étape 1: Authentification avec Symfony Security
      const response = await fetch(`${API_BASE}/login_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Identifiants invalides')
      }

      const { user, token } = await response.json()

      // Sauvegarder le token en localStorage
      localStorage.setItem('auth_token', token)

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: user !== null,
    })
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
    set({ token, isAuthenticated: !!token })
  },

  setError: (error) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },
}))
