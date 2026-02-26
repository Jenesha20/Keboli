import { useContext } from 'react'
import { AuthContext } from '../services/authContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
