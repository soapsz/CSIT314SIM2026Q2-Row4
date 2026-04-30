import { useState, useEffect } from 'react'

const API     = 'http://localhost:3001/api/fra'
const CAT_API = 'http://localhost:3001/api/fra-categories'

function useCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(CAT_API, { credentials: 'include' })
        const data = await res.json()
        if (data.success) setCategories((data.data ?? []).filter(c => c.isActive === true))
      } catch { /* ignore */ }
    }
    load()
  }, [])
  return categories
}

function StatusBadge({ status }) {
  const map = {
    active:    'ua-badge-active',
    suspended: 'ua-badge-inactive',
    completed: 'ua-badge-completed',
  }
  return <span className={`ua-badge ${map[status] || ''}`}>{status}</span>
}

function ProgressBar({ totalRaised = 0, targetAmount = 0 }) {
  const pct = targetAmount > 0 ? Math.min(100, (totalRaised / targetAmount) * 100) : 0
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
        <span style={{ color: 'var(--ua-muted)' }}>Raised</span>
        <span style={{ color: 'var(--ua-accent)', fontWeight: 600 }}>
          ${totalRaised.toLocaleString()} / ${targetAmount.toLocaleString()}
        </span>
      </div>
      <div style={{ background: 'var(--ua-border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: '999px',
          background: 'var(--ua-accent)',
          width: `${pct}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--ua-muted)', marginTop: '3px' }}>
        {pct.toFixed(1)}% funded
      </p>
    </div>
  )
}

export default function DonationHistory() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [expandedId, setExpanded] = useState(null)
  const [filters, setFilters]     = useState({ category: '', from: '', to: '' })
  const categories                = useCategories()

  const fetchDonations = async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.from)     params.set('from', filters.from)
      if (filters.to)       params.set('to', filters.to)
      const res  = await fetch(`${API}/donations?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setDonations(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDonations() }, [])

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">Donation History</h2>
        <p className="ua-subtitle">View and search your past donations</p>
      </div>

      <div className="ua-card">
        <div className="ua-card-header">
          <span className="ua-card-title">My donations</span>
          <button className="ua-btn ua-btn-sm" onClick={fetchDonations}>Search</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <select
            className="ua-input"
            style={{ flex: 1, minWidth: '140px' }}
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input
            className="ua-input"
            style={{ flex: 1, minWidth: '120px' }}
            name="from"
            type="date"
            value={filters.from}
            onChange={handleFilterChange}
          />
          <input
            className="ua-input"
            style={{ flex: 1, minWidth: '120px' }}
            name="to"
            type="date"
            value={filters.to}
            onChange={handleFilterChange}
          />
        </div>

        {loading && <p className="ua-muted">Loading…</p>}
        {error   && <div className="ua-msg ua-msg-error">{error}</div>}
        {!loading && !error && donations.length === 0 && <p className="ua-muted">No donation records found</p>}

        <div className="ua-list">
          {donations.map(donation => {
            const fra        = donation.fra
            const isExpanded = expandedId === donation._id
            const catName    = fra?.category?.name ?? fra?.category ?? '-'

            return (
              <div key={donation._id} className="ua-row ua-row-expandable">
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  onClick={() => setExpanded(isExpanded ? null : donation._id)}
                >
                  <div className="ua-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                    {fra?.title?.slice(0, 2).toUpperCase() || 'NA'}
                  </div>
                  <div className="ua-row-body">
                    <p className="ua-row-name">{fra?.title || 'Unknown Campaign'}</p>
                    <p className="ua-row-desc">{catName} · {new Date(donation.donatedAt).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ua-accent)', flexShrink: 0 }}>
                    ${donation.amount?.toLocaleString()}
                  </span>
                  {fra?.status && <StatusBadge status={fra.status} />}
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--ua-border-2)', marginTop: '12px', paddingTop: '14px' }}>
                    <p className="ua-muted" style={{ fontSize: '0.72rem', marginBottom: '0.5rem' }}>Donation ID: {donation._id}</p>

                    {fra?.description && (
                      <p className="ua-row-desc" style={{ marginBottom: '0.75rem' }}>{fra.description}</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>AMOUNT DONATED</p>
                        <p style={{ color: 'var(--ua-accent)', fontWeight: 600 }}>${donation.amount?.toLocaleString()}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>DATE</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>{new Date(donation.donatedAt).toLocaleDateString()}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>CATEGORY</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>{catName}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>TARGET AMOUNT</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>${fra?.targetAmount?.toLocaleString() || '-'}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>TOTAL RAISED</p>
                        <p style={{ color: 'var(--ua-accent)', fontWeight: 600 }}>${(fra?.totalRaised ?? 0).toLocaleString()}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>CAMPAIGN STATUS</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>{fra?.status || '-'}</p>
                      </div>
                    </div>

                    <ProgressBar totalRaised={fra?.totalRaised ?? 0} targetAmount={fra?.targetAmount ?? 0} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}