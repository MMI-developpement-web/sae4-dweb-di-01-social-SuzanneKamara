/**
 * API Client Helper
 * Wrapper autour de fetch pour automatiser l'envoi du token
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers || {})

  // Ajouter le Content-Type par défaut
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  // Ajouter le token Authorization si disponible et non skip
  if (!skipAuth) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  return response
}

/**
 * Parse la réponse JSON et gère les erreurs
 */
export async function apiCall<T>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  const response = await apiFetch(endpoint, options)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `API Error: ${response.status}`)
  }

  return response.json()
}
