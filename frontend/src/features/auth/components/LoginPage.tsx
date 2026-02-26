import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Hiring Manager Login</h1>
        <label className="block text-sm font-medium">Email</label>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <label className="block text-sm font-medium mt-4">Password</label>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
        <button
          className="mt-5 w-full bg-black text-white rounded px-3 py-2 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
