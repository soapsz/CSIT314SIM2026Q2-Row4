import { useState, useEffect } from 'react'

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

export default function Favourites() {
  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">My Favourites</h2>
        <p className="ua-subtitle">Fundraising activities you have saved</p>
      </div>
      <FavouriteListTab />
    </div>
  )
}

function FavouriteListTab() {
  const [favourites, setFavourites] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [expandedId, setExpanded]   = useState(null)
  const [search, setSearch]         = useState('')
  const [favLoading, setFavLoading] = useState(new Set())

  const fetchFavourites = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(FAV_API, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFavourites(data.data.filter(fav => fav.fra?.status === 'active'))
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFavourites() }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearch(query)
    if (!query.trim()) { fetchFavourites(); return }
    try {
      const res  = await fetch(`${FAV_API}/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFavourites(data.data.filter(fav => fav.fra?.status === 'active'))
      else setFavourites([])
    } catch { /* ignore */ }
  }

  const handleUnfavourite = async (e, fraId, favId) => {
    e.stopPropagation()
    if (favLoading.has(favId)) return

    setFavLoading(prev => new Set([...prev, favId]))
    try {
      const res  = await fetch(`${FAV_API}/${fraId}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setFavourites(prev => prev.filter(f => f._id !== favId))
      }
    } catch { /* ignore */ }
    finally {
      setFavLoading(prev => {
        const next = new Set(prev)
        next.delete(favId)
        return next
      })
    }
  }

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <span className="ua-card-title">Saved campaigns</span>
        <button className="ua-btn ua-btn-sm" onClick={fetchFavourites}>Refresh</button>
      </div>

      <div className="ua-field">
        <input className="ua-input" placeholder="Search favourites..." value={search} onChange={handleSearch} />
      </div>

      {loading && <p className="ua-muted">Loading…</p>}
      {error   && <div className="ua-msg ua-msg-error">{error}</div>}
      {!loading && !error && favourites.length === 0 && <p className="ua-muted">No favourites saved yet</p>}

      <div className="ua-list">
        {favourites.map(fav => {
          const fra          = fav.fra
          const isExpanded   = expandedId === fav._id
          const isLoading    = favLoading.has(fav._id)
          const categoryName = fra?.category?.name ?? fra?.category ?? '-'
          if (!fra) return null

          return (
            <div key={fav._id} className="ua-row ua-row-expandable">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setExpanded(isExpanded ? null : fav._id)}
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
                  <button
                    className="ua-btn-ghost"
                    style={{
                      padding: '2px 8px', fontSize: '16px',
                      color: '#e53e3e',
                      border: 'none', background: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                    }}
                    onClick={(e) => handleUnfavourite(e, fra._id, fav._id)}
                    disabled={isLoading}
                    title="Remove from favourites"
                  >
                    ♥
                  </button>
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
                      <p className="ua-muted" style={{ fontSize: '11px', marginBottom: '4px' }}>SAVED ON</p>
                      <p style={{ color: 'var(--ua-text)', fontWeight: 600 }}>{new Date(fav.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <ProgressBar totalRaised={fra.totalRaised ?? 0} targetAmount={fra.targetAmount ?? 0} />

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      className="ua-btn-ghost"
                      style={{
                        color: '#e53e3e',
                        opacity: isLoading ? 0.5 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                      }}
                      onClick={(e) => handleUnfavourite(e, fra._id, fav._id)}
                      disabled={isLoading}
                    >
                      {isLoading ? '…' : '♥ Remove from favourites'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}