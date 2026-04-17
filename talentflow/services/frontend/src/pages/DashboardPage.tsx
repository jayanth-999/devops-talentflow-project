import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { jobsApi } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, User2, PlusCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: applications } = useQuery(
    'my-applications',
    () => jobsApi.getMyApplications().then(r => r.data),
    { enabled: user?.role === 'job_seeker' }
  )

  const statusColor: Record<string, string> = {
    APPLIED: '#94a3b8', REVIEWED: '#60a5fa', SHORTLISTED: '#4ade80',
    REJECTED: '#f87171', HIRED: '#facc15',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Welcome back, <span style={{ color: '#6366f1' }}>{user?.username}</span> 👋
        </h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          {user?.role === 'job_seeker' ? 'Track your job applications' : 'Manage your posted jobs'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Applications', value: applications?.totalElements ?? '—', icon: <Briefcase size={20} /> },
          { label: 'Active Applications', value: applications?.content?.filter(a => a.status === 'APPLIED').length ?? '—', icon: <User2 size={20} /> },
          { label: 'Shortlisted', value: applications?.content?.filter(a => a.status === 'SHORTLISTED').length ?? '—', icon: <PlusCircle size={20} /> },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: '#6366f1', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9' }}>{stat.value}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Applications List */}
      {user?.role === 'job_seeker' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 600 }}>My Applications</h2>
            <Link to="/jobs" className="btn btn-primary btn-sm">Browse More Jobs</Link>
          </div>

          {applications?.content.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="text-muted">No applications yet. <Link to="/jobs" style={{ color: '#6366f1' }}>Start applying!</Link></p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applications?.content.map(app => (
              <Link key={app.id} to={`/jobs/${app.jobId}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9', marginBottom: '0.25rem' }}>
                      Job Application
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.75rem', borderRadius: 999,
                    fontSize: '0.75rem', fontWeight: 600,
                    background: `${statusColor[app.status]}20`,
                    color: statusColor[app.status],
                  }}>
                    {app.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'employer' && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Post a New Job</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Reach thousands of qualified candidates</p>
          <button className="btn btn-primary">Post Job via API</button>
          <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
            Use POST /api/v1/jobs with your employer token
          </p>
        </div>
      )}
    </div>
  )
}
