import { useState } from 'react'

const API = 'http://localhost:3001/api/reports'

function StatusBadge({ status }) {
  const map = {
    active:    'ua-badge-active',
    suspended: 'ua-badge-inactive',
    completed: 'ua-badge-completed',
  }
  return <span className={`ua-badge ${map[status] || ''}`}>{status}</span>
}

export default function Reports() {
  const [tab, setTab] = useState('daily')
  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">Reports</h2>
        <p className="ua-subtitle">Generate platform activity reports</p>
      </div>
      <div className="ua-tabs">
        {['daily', 'weekly', 'monthly'].map(t => (
          <button
            key={t}
            className={`ua-tab ${tab === t ? 'ua-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'daily'   && <ReportTab type="daily"   label="Daily Report"   description="Fundraising activities created today" />}
      {tab === 'weekly'  && <ReportTab type="weekly"  label="Weekly Report"  description="Fundraising activities from the last 7 days" />}
      {tab === 'monthly' && <ReportTab type="monthly" label="Monthly Report" description="Fundraising activities from the last 30 days" />}
    </div>
  )
}

function ReportTab({ type, label, description }) {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [expandedId, setExpanded] = useState(null)

  const generate = async () => {
    setLoading(true); setError(null); setData(null)
    try {
      const res  = await fetch(`${API}/${type}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const totalActive    = data?.filter(f => f.status === 'active').length    || 0
  const totalSuspended = data?.filter(f => f.status === 'suspended').length || 0
  const totalCompleted = data?.filter(f => f.status === 'completed').length || 0
  const totalTarget    = data?.reduce((sum, f) => sum + (f.targetAmount || 0), 0) || 0

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <div>
          <span className="ua-card-title" style={{ margin: 0 }}>{label}</span>
          <p className="ua-muted" style={{ fontSize: '12px', marginTop: '2px' }}>{description}</p>
        </div>
        <button className="ua-btn ua-btn-sm" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {error && <div className="ua-msg ua-msg-error">{error}</div>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1.5rem' }}>
            {[
              { label: 'TOTAL',     value: data.length,    color: 'var(--ua-text)' },
              { label: 'ACTIVE',    value: totalActive,    color: 'var(--ua-accent)' },
              { label: 'SUSPENDED', value: totalSuspended, color: '#e24b4a' },
              { label: 'COMPLETED', value: totalCompleted, color: '#64a0ff' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '12px', background: 'var(--ua-bg-deep)', borderRadius: '8px', border: '1px solid var(--ua-border-2)', textAlign: 'center' }}>
                <p className="ua-muted" style={{ fontSize: '10px', letterSpacing: '0.08em', marginBottom: '6px' }}>{stat.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px', background: 'var(--ua-bg-deep)', borderRadius: '8px', border: '1px solid var(--ua-border-2)', marginBottom: '1rem' }}>
            <p className="ua-muted" style={{ fontSize: '11px', letterSpacing: '0.08em', marginBottom: '4px' }}>TOTAL TARGET AMOUNT</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ua-accent)', margin: 0 }}>${totalTarget.toLocaleString()}</p>
          </div>

          {data.length === 0 && <p className="ua-muted">No campaigns found for this period</p>}

          <div className="ua-list">
            {data.map(fra => {
              const isExpanded   = expandedId === fra._id
              const initials     = (fra.title ?? '??').slice(0, 2).toUpperCase()
              const categoryName = fra.category?.name ?? fra.category ?? '-'

              return (
                <div key={fra._id} className="ua-row ua-row-expandable" onClick={() => setExpanded(isExpanded ? null : fra._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="ua-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                      {initials}
                    </div>
                    <div className="ua-row-body">
                      <p className="ua-row-name">{fra.title ?? '(no title)'}</p>
                      <p className="ua-row-desc">{categoryName} · ${fra.targetAmount?.toLocaleString() ?? '0'}</p>
                    </div>
                    <StatusBadge status={fra.status} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--ua-border-2)', marginTop: '0.5rem' }}>
                      <p className="ua-muted" style={{ fontSize: '0.72rem', marginBottom: '0.25rem' }}>ID: {fra._id}</p>
                      {fra.description && <p className="ua-row-desc">{fra.description}</p>}
                      <p className="ua-row-desc">Category: {categoryName}</p>
                      <p className="ua-row-desc">Created by: {fra.createdBy?.username ?? fra.createdBy ?? '-'}</p>
                      <p className="ua-row-desc">Created: {fra.createdAt ? new Date(fra.createdAt).toLocaleDateString() : '-'}</p>
                      <div style={{ display: 'flex', gap: '16px', margin: '0.5rem 0', fontSize: '0.8rem', color: 'var(--ua-muted)' }}>
                        <span>👁 {fra.viewCount ?? 0} views</span>
                        <span>🔖 {fra.shortlistCount ?? 0} shortlists</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <p className="ua-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
          Click Generate to load the {type} report
        </p>
      )}
    </div>
  )
}