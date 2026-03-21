export const TOKEN_COOKIE_KEY = 'auth_token'

export function setSessionCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

export function getCookie(name: string): string | null {
  const encodedName = `${encodeURIComponent(name)}=`
  const cookies = document.cookie ? document.cookie.split('; ') : []

  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length))
    }
  }

  return null
}

export function clearCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; Max-Age=0; SameSite=Lax`
}

export function getSessionToken() {
  return getCookie(TOKEN_COOKIE_KEY)
}
