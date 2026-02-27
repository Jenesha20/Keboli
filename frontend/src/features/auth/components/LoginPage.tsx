import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Carousel from '../../../components/carousel/Carousel'

const loginSlides = [
  {
    title: "Welcome Back",
    description: "Continue your journey in discovering the best talent with our evolved AI-driven insights.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Seamless Integration",
    description: "Connect your existing HR workflow with Keboli AI for a unified hiring experience.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Data Driven Decisions",
    description: "Leverage advanced analytics to make biased-free, objective hiring choices.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
  }
]

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="font-display bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Keboli</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-[1000px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-slate-200">
          <div className="hidden md:flex md:w-1/2 bg-indigo-50/50 flex-col justify-center items-center">
            <Carousel slides={loginSlides} accentColor="bg-indigo-600" />
          </div>

          <div className="w-full md:w-1/2 p-10 lg:p-14">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900">Sign In</h2>
              <p className="text-slate-500 mt-3 text-lg">Good to see you again!</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                <input
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <Link className="text-sm text-primary hover:underline font-semibold" to="#">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-primary transition-colors select-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <input className="rounded-md border-slate-300 text-primary focus:ring-primary/20 h-5 w-5 transition-all" id="remember" type="checkbox" />
                <label className="text-sm text-slate-600 font-medium cursor-pointer" htmlFor="remember">Keep me signed in</label>
              </div>

              <button
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all mt-4 disabled:opacity-70 active:scale-[0.98]"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500">
                Don't have an account? <Link className="text-primary font-bold hover:underline ml-1" to="/register">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center text-sm text-slate-400 border-t border-slate-100 mt-auto">
        <p>© 2026 Keboli Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
