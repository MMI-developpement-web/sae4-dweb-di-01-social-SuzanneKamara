function getLocalBackendBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol || 'http:'
    return `${protocol}//${window.location.hostname}:8080`
  }

  return 'http://localhost:8080'
}

const FALLBACK_SERVER_URL = getLocalBackendBaseUrl()

const configuredBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_SERVER_URL as string | undefined) ??
  FALLBACK_SERVER_URL

function removeTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function ensureApiPrefix(path: string) {
  if (path === '/api' || path.startsWith('/api/')) {
    return path
  }
  return `/api${path.startsWith('/') ? path : `/${path}`}`
}

export const API_BASE_URL = removeTrailingSlash(configuredBaseUrl)

export function buildApiUrl(path: string) {
  const normalizedPath = ensureApiPrefix(path)
  return `${API_BASE_URL}${normalizedPath}`
}
