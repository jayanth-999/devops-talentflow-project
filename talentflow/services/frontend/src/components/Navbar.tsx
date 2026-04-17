import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '0 1.5rem',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>TalentFlow</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/jobs" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            Browse Jobs
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                Dashboard
              </Link>
              <span style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 600 }}>
                {user?.username}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
