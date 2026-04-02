/**
 * Store Index
 * Exports centralisées pour accéder à tous les stores et hooks
 * Utilise le système de token API simple de Symfony Security (pas JWT)
 */

// Types
export type {
  User,
  Post,
  PostCreatePayload,
  AuthState,
  PostState,
  UserState,
  UIState,
} from './types'

// Slices
export { useAuthStore } from './slices/authSlice'
export { usePostStore } from './slices/postSlice'
export { useUserStore } from './slices/userSlice'
export { useUIStore } from './slices/uiSlice'

// Hooks
export { useAuth, usePosts, useUsers, useUI } from './hooks'

// API Client
export { apiCall, apiFetch } from './api-client'
