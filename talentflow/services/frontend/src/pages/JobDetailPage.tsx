import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { jobsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { MapPin, Briefcase, DollarSign, Building2, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  const { data: job, isLoading } = useQuery(
    ['job', id],
    () => jobsApi.get(id!).then(r => r.data),
    { enabled: !!id }
  )

  const handleApply = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setApplying(true); setError('')
    try {
      await jobsApi.apply(id!, coverLetter)
      setApplied(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply. You may have already applied.')
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) return <div className="spinner" />
  if (!job) return <p style={{ color: '#f87171', textAlign: 'center' }}>Job not found.</p>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> Back to Jobs
      </button>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>{job.title}</h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6366f1', fontWeight: 600 }}>
              <Building2 size={16} /> {job.company}
            </span>
            <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
              <MapPin size={15} /> {job.location}
            </span>
            <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
              <Briefcase size={15} /> {job.jobType.replace('_', ' ')}
            </span>
            {job.salaryMin && (
              <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                <DollarSign size={15} /> ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </p>
        </div>

        <hr style={{ borderColor: '#334155', marginBottom: '1.25rem' }} />

        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Job Description</h2>
        <div style={{ color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>

      {/* Apply Section */}
      {job.status === 'OPEN' && user?.role === 'job_seeker' && (
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Apply for this Position</h2>

          {applied ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '1rem', color: '#4ade80', textAlign: 'center' }}>
              ✅ Application submitted successfully! We'll notify you of any updates.
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Cover Letter (optional)</label>
                <textarea className="form-input" rows={5} placeholder="Tell them why you're a great fit..."
                  style={{ resize: 'vertical' }}
                  value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Login to apply for this job</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Apply</button>
        </div>
      )}
    </div>
  )
}
