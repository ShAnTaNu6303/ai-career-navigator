import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage({ mode }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = isLogin
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form)
      setAuth(data.user, data.token)
      toast.success(`Welcome${isLogin ? ' back' : ''}, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <span className="text-3xl">🧭</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-accent">AI CAREER NAVIGATOR</h1>
          <p className="text-slate-500 text-sm mt-1">Your AI-powered career co-pilot</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Full Name</label>
                <input name="name" className="input" placeholder="Your full name" value={form.name} onChange={handle} required />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Email</label>
              <input name="email" type="email" className="input" placeholder="you@email.com" value={form.email} onChange={handle} required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters" value={form.password} onChange={handle} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} className="text-accent hover:underline font-medium">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by Claude AI (Anthropic) · Built with React + Node.js + MongoDB
        </p>
      </div>
    </div>
  )
}
