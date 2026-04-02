import { getSessionToken } from './sessionCookie'


export class ApiHttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
  }
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getSessionToken()
  const headers = new Headers(init.headers ?? {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  })

  return response
}

export async function apiFetchJson<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(input, init)

  if (!response.ok) {
    throw new ApiHttpError(response.status, `API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function apiFetchPublic(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {})

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  })

  return response
}

export async function apiFetchJsonPublic<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const response = await apiFetchPublic(input, init)

  if (!response.ok) {
    throw new ApiHttpError(response.status, `API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}
