import { createContext } from 'react'

export type AuthUser = {
  id: string
  email: string
  org_id: string
}

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
