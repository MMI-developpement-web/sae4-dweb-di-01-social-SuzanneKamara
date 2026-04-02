import { apiFetchJson, apiFetch } from './api'
import { buildApiUrl } from './apiConfig'

export interface CurrentUser {
  id: number
  username: string
  email: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  location?: string
  website_url?: string
  is_verified?: boolean
  is_blocked?: boolean
}

export interface UpdateProfileData {
  bio?: string | null
  avatar_url?: string | null
  banner_url?: string | null
  location?: string | null
  website_url?: string | null
}

const ME_ENDPOINT = '/api/users/me'

/**
 * Get the currently authenticated user
 * @returns The current user object
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiFetchJson<CurrentUser>(buildApiUrl(ME_ENDPOINT), {
    method: 'GET',
  })

  return response
}

/**
 * Update the current user's profile
 * @param userId The user ID to update
 * @param data Partial user data to update
 * @returns The updated user object
 * @throws Error if not authenticated, not authorized, or validation fails
 */
export async function updateUserProfile(userId: number, data: UpdateProfileData): Promise<CurrentUser> {
  const url = buildApiUrl(`/api/users/${userId}`)

  const response = await apiFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // Handle 403 - Not authorized
    if (response.status === 403) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce profil')
    }

    // Handle 401 - Not authenticated
    if (response.status === 401) {
      throw new Error('Authentification requise')
    }

    // Handle 400 - Validation errors
    if (response.status === 400) {
      if (errorData.errors && typeof errorData.errors === 'object') {
        // Format field-specific errors for display
        const fieldErrors = Object.entries(errorData.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ')
        throw new Error(fieldErrors || (errorData.error ?? 'Erreur de validation'))
      }
      throw new Error(errorData.error ?? 'Erreur de validation')
    }

    // Handle 404 - User not found
    if (response.status === 404) {
      throw new Error('Utilisateur introuvable')
    }

    throw new Error(errorData.error ?? 'Une erreur est survenue lors de la mise à jour du profil')
  }

  return response.json()
}
