import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type LoginPayload } from './AuthContextValue'
import { clearCookie, getSessionToken, setSessionCookie, TOKEN_COOKIE_KEY } from '../lib/sessionCookie'
import { buildApiUrl } from '../lib/apiConfig'
import { apiFetchJson } from '../lib/api'

const LOGIN_API_URL = buildApiUrl('/login_check')

function extractToken(responseData: unknown): string | null {
  if (!responseData || typeof responseData !== 'object') {
    return null
  }

  const data = responseData as Record<string, unknown>
  const token = data.token ?? data.jwt ?? data.access_token
  return typeof token === 'string' && token.length > 0 ? token : null
}

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const data = payload as Record<string, unknown>
  const message = data.message ?? data.error
  return typeof message === 'string' ? message : ''
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getSessionToken())
  const [userId, setUserId] = useState<number | null>(null)

  const login = async ({ identifier, password }: LoginPayload) => {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: identifier,
        username: identifier,
        password,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const backendMessage = extractErrorMessage(payload).toLowerCase()

      if (backendMessage.includes('confirmer votre email') || backendMessage.includes('email')) {
        throw new Error('Vous n\'avez pas valide votre email. Veuillez consulter votre boite mail pour le faire.')
      }

      throw new Error('Identifiants invalides.')
    }

    const responseData = (await response.json()) as unknown
    const extractedToken = extractToken(responseData)

    if (!extractedToken) {
      throw new Error('Réponse serveur invalide: token absent.')
    }

    setSessionCookie(TOKEN_COOKIE_KEY, extractedToken)
    setToken(extractedToken)

    // Fetch current user data to get userId
    try {
      const userResponse = await apiFetchJson<{ id: number }>(buildApiUrl('/users/me'))
      setUserId(userResponse.id)
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      setUserId(null)
    }
  }

  const logout = () => {
    clearCookie(TOKEN_COOKIE_KEY)
    setToken(null)
    setUserId(null)
  }

  const cookieToken = getSessionToken()
  const isAuthenticated = Boolean(token) && token === cookieToken

  const value = useMemo(
    () => ({
      token,
      userId,
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, token, userId]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
