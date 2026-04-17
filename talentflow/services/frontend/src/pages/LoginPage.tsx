import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data: tokens } = await authApi.login(form)
      setTokens(tokens.access_token, tokens.refresh_token)
      const { data: user } = await authApi.getMe()
      setUser(user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Sign in to your TalentFlow account</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="login-email" type="email" className="form-input" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" type="password" className="form-input" placeholder="••••••••" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted text-center mt-2" style={{ fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
