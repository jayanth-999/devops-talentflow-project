import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '', role: 'job_seeker' as const })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create account</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Join TalentFlow and find your next opportunity</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="John Doe"
                value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input type="text" className="form-input" placeholder="johndoe" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" placeholder="Min 8 characters" required minLength={8}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })}>
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-muted text-center mt-2" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
