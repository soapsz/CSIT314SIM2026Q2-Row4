import { useState, useEffect } from 'react'

const API     = 'http://localhost:3001/api/fra'
const DON_API = 'http://localhost:3001/api/fra/donations'
const FAV_API = 'http://localhost:3001/api/favourites'

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

function DonateModal({ fra, onClose, onSuccess }) {
  const [amount, setAmount]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleDonate = async () => {
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setLoading(true); setError(null)
    try {
      const res  = await fetch(DON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fraId: fra._id, amount: Number(amount) }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess(fra._id, Number(amount))
      } else {
        setError(data.message)
      }
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ua-bg)', border: '1px solid var(--ua-border)',
        borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '360px',
      }} onClick={e => e.stopPropagation()}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--ua-text)', marginBottom: '4px' }}>
          Donate to campaign
        </p>
        <p className="ua-row-desc" style={{ marginBottom: '20px' }}>{fra.title}</p>

        <div className="ua-field">
          <label className="ua-label">Amount (SGD)</label>
          <input
            className="ua-input"
            type="number"
            placeholder="e.g. 50"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(null) }}
            autoFocus
          />
        </div>

        {error && <div className="ua-msg ua-msg-error" style={{ marginBottom: '12px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="ua-btn" style={{ flex: 1 }} onClick={handleDonate} disabled={loading}>
            {loading ? 'Processing…' : 'Confirm Donation'}
          </button>
          <button className="ua-btn-ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BrowseCampaigns() {
  const [tab, setTab]               = useState('active')
  const [fras, setFras]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [expandedId, setExpanded]   = useState(null)
  const [search, setSearch]         = useState('')
  const [savedIds, setSavedIds]     = useState(new Set())
  const [favLoading, setFavLoading] = useState(new Set())
  const [donateTarget, setDonateTarget] = useState(null)

  const fetchActive = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(`${API}/all`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFras(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompleted = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(`${API}/all/completed`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFras(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavourites = async () => {
    try {
      const res  = await fetch(FAV_API, { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        const ids = new Set(data.data.map(fav => fav.fra?._id?.toString() ?? fav.fra?.toString()))
        setSavedIds(ids)
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    setSearch('')
    setExpanded(null)
    tab === 'active' ? fetchActive() : fetchCompleted()
  }, [tab])

  useEffect(() => { fetchFavourites() }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearch(query)
    if (!query.trim()) {
      tab === 'active' ? fetchActive() : fetchCompleted()
      return
    }
    try {
      const res  = await fetch(`${API}/all/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFras(data.data)
      else setFras([])
    } catch { /* ignore */ }
  }

  const handleExpand = async (fra) => {
    const opening = expandedId !== fra._id
    setExpanded(opening ? fra._id : null)
    if (opening) {
      try {
        const res  = await fetch(`${API}/${fra._id}/view`, { method: 'POST', credentials: 'include' })
        const data = await res.json()
        if (data.incremented) {
          setFras(prev => prev.map(f =>
            f._id === fra._id ? { ...f, viewCount: (f.viewCount ?? 0) + 1 } : f
          ))
        }
      } catch { /* ignore */ }
    }
  }

  const handleFavourite = async (e, fraId) => {
    e.stopPropagation()
    if (favLoading.has(fraId)) return
    const alreadySaved = savedIds.has(fraId)

    setFavLoading(prev => new Set([...prev, fraId]))
    try {
      const res  = await fetch(`${FAV_API}/${fraId}`, {
        method: alreadySaved ? 'DELETE' : 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setSavedIds(prev => {
          const next = new Set(prev)
          alreadySaved ? next.delete(fraId) : next.add(fraId)
          return next
        })
        setFras(prev => prev.map(f =>
          f._id === fraId
            ? { ...f, shortlistCount: (f.shortlistCount ?? 0) + (alreadySaved ? -1 : 1) }
            : f
        ))
      }
    } catch { /* ignore */ }
    finally {
      setFavLoading(prev => {
        const next = new Set(prev)
        next.delete(fraId)
        return next
      })
    }
  }

  const handleDonateSuccess = (fraId, amount) => {
    setDonateTarget(null)
    setFras(prev => prev.map(f =>
      f._id === fraId ? { ...f, totalRaised: (f.totalRaised ?? 0) + amount } : f
    ))
  }

  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">Browse Campaigns</h2>
        <p className="ua-subtitle">Discover and support fundraising campaigns</p>
      </div>

      <div className="ua-tabs" style={{ marginBottom: '24px' }}>
        {['active', 'completed'].map(t => (
          <button
            key={t}
            className={`ua-tab ${tab === t ? 'ua-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="ua-card">
        <div className="ua-card-header">
          <span className="ua-card-title">{tab === 'active' ? 'Active campaigns' : 'Completed campaigns'}</span>
          <button className="ua-btn ua-btn-sm" onClick={() => tab === 'active' ? fetchActive() : fetchCompleted()}>Refresh</button>
        </div>

        <div className="ua-field">
          <input
            className="ua-input"
            placeholder="Search campaigns..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {loading && <p className="ua-muted">Loading…</p>}
        {error   && <div className="ua-msg ua-msg-error">{error}</div>}
        {!loading && !error && fras.length === 0 && <p className="ua-muted">No campaigns found</p>}

        <div className="ua-list">
          {fras.map(fra => {
            const isExpanded   = expandedId === fra._id
            const categoryName = fra.category?.name ?? fra.category ?? '-'
            const isSaved      = savedIds.has(fra._id)
            const isFavLoading = favLoading.has(fra._id)

            return (
              <div key={fra._id} className="ua-row ua-row-expandable">
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  onClick={() => handleExpand(fra)}
                >
                  <div className="ua-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                    {fra.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="ua-row-body">
                    <p className="ua-row-name">{fra.title}</p>
                    <p className="ua-row-desc">{categoryName} · ${fra.targetAmount?.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StatusBadge status={fra.status} />
                    {fra.status === 'active' && (
                      <button
                        className="ua-btn-ghost"
                        style={{
                          padding: '2px 8px', fontSize: '16px',
                          color: isSaved ? '#e53e3e' : 'inherit',
                          border: 'none', background: 'none',
                          cursor: isFavLoading ? 'not-allowed' : 'pointer',
                          opacity: isFavLoading ? 0.5 : 1,
                        }}
                        onClick={(e) => handleFavourite(e, fra._id)}
                        disabled={isFavLoading}
                        title={isSaved ? 'Remove from favourites' : 'Save to favourites'}
                      >
                        {isSaved ? '♥' : '♡'}
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--ua-border-2)', marginTop: '12px', paddingTop: '14px' }}>
                    <p className="ua-muted" style={{ fontSize: '0.72rem', marginBottom: '0.5rem' }}>ID: {fra._id}</p>

                    {fra.description && (
                      <p className="ua-row-desc" style={{ marginBottom: '0.75rem' }}>{fra.description}</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>TARGET AMOUNT</p>
                        <p style={{ color: 'var(--ua-accent)', fontWeight: 600 }}>${fra.targetAmount?.toLocaleString()}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>TOTAL RAISED</p>
                        <p style={{ color: 'var(--ua-accent)', fontWeight: 600 }}>${(fra.totalRaised ?? 0).toLocaleString()}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>VIEWS</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>👁 {fra.viewCount}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>SHORTLISTS</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>🔖 {fra.shortlistCount}</p>
                      </div>
                      <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                        <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>CREATED</p>
                        <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>{new Date(fra.createdAt).toLocaleDateString()}</p>
                      </div>
                      {fra.completedAt && (
                        <div style={{ padding: '10px', background: 'var(--ua-bg)', borderRadius: '6px', border: '1px solid var(--ua-border)' }}>
                          <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>COMPLETED</p>
                          <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>{new Date(fra.completedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    <ProgressBar totalRaised={fra.totalRaised ?? 0} targetAmount={fra.targetAmount ?? 0} />

                    {fra.status === 'active' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          className="ua-btn ua-btn-sm"
                          onClick={(e) => { e.stopPropagation(); setDonateTarget(fra) }}
                        >
                          💳 Donate
                        </button>
                        <button
                          className="ua-btn-ghost"
                          style={{
                            color: isSaved ? '#e53e3e' : 'inherit',
                            opacity: isFavLoading ? 0.5 : 1,
                            cursor: isFavLoading ? 'not-allowed' : 'pointer',
                          }}
                          onClick={(e) => handleFavourite(e, fra._id)}
                          disabled={isFavLoading}
                        >
                          {isFavLoading ? '…' : isSaved ? '♥ Saved' : '♡ Save'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {donateTarget && (
        <DonateModal
          fra={donateTarget}
          onClose={() => setDonateTarget(null)}
          onSuccess={handleDonateSuccess}
        />
      )}
    </div>
  )
}