import { createContext } from 'react'

export type LoginPayload = {
  identifier: string
  password: string
}

export type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
