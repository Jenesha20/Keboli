import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6">Loading…</div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
