import { apiFetchJson } from './api'
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
