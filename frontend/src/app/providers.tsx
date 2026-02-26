import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { AuthContext } from '../features/auth/services/authContext'
import type { AuthUser } from '../features/auth/services/authContext'
import { loginRequest, logoutRequest, meRequest } from '../features/auth/services/authApi'

export function AppProviders({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await meRequest()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    await loginRequest(email, password)
    await refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    setLoading(true)
    await logoutRequest()
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
