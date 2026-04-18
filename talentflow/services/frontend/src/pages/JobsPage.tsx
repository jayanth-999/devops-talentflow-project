import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { jobsApi, type Job, type JobFilters } from '../services/api'
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const JOB_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP']

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({ status: 'OPEN', page: 0, size: 20 })
  const [keyword, setKeyword] = useState('')

  const { data, isLoading, isError } = useQuery(
    ['jobs', filters],
    () => jobsApi.list(filters).then(r => r.data),
    { keepPreviousData: true }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(f => ({ ...f, keyword, page: 0 }))
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.1))',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16,
        padding: '2.5rem', marginBottom: '2rem', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Find Your <span style={{ color: '#6366f1' }}>Dream Job</span>
        </h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Thousands of opportunities from top companies
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: 600, margin: '0 auto' }}>
          <input className="form-input" placeholder="Job title, skill, or company..."
            value={keyword} onChange={e => setKeyword(e.target.value)} />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Search</button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {JOB_TYPES.map(type => (
          <button key={type} onClick={() => setFilters(f => ({ ...f, jobType: type || undefined, page: 0 }))}
            className={`btn btn-sm ${filters.jobType === type || (!filters.jobType && !type) ? 'btn-primary' : 'btn-secondary'}`}>
            {type ? type.replace('_', ' ') : 'All Types'}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading && <div className="spinner" />}
      {isError && <p style={{ color: '#f87171', textAlign: 'center' }}>Failed to load jobs. Is the job service running?</p>}

      {data && (
        <>
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            {data.totalElements} jobs found
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.content.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button className="btn btn-secondary btn-sm" disabled={filters.page === 0}
              onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}>← Prev</button>
            <span className="text-muted" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
              Page {(filters.page ?? 0) + 1} of {data.totalPages}
            </span>
            <button className="btn btn-secondary btn-sm"
              disabled={(filters.page ?? 0) + 1 >= data.totalPages}
              onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) + 1 }))}>Next →</button>
          </div>
        </>
      )}
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const jobTypeBadge: Record<string, string> = {
    FULL_TIME: 'badge-full-time', REMOTE: 'badge-remote', CONTRACT: 'badge-contract',
  }

  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f1f5f9' }}>{job.title}</h2>
              <span className={`badge ${jobTypeBadge[job.jobType] || 'badge-full-time'}`}>
                {job.jobType.replace('_', ' ')}
              </span>
              <span className="badge badge-open">{job.status}</span>
            </div>
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{job.company}</p>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <MapPin size={13} /> {job.location}
              </span>
              {job.salaryMin && (
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <DollarSign size={13} /> ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()}
                </span>
              )}
              <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <Clock size={13} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {job.description.replace(/<[^>]*>?/gm, '')}
        </p>
      </div>
    </Link>
  )
}
