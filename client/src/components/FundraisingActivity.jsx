import { useState, useEffect } from 'react'

const API     = 'http://localhost:3001/api/fra'
const CAT_API = 'http://localhost:3001/api/fra-categories'

function Field({ label, error, children }) {
  return (
    <div className="ua-field">
      <label className="ua-label">{label}</label>
      {children}
      {error && <p className="ua-err-text">{error}</p>}
    </div>
  )
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

function FRADetailCard({ fra, categoryName, showActions, onSuspend, onComplete }) {
  return (
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

      {showActions && (
        <div className="ua-row-actions" style={{ marginTop: '0.75rem' }}>
          {fra.status !== 'completed' && (
            <button
              className="ua-btn-ghost"
              onClick={(e) => { e.stopPropagation(); onSuspend(fra._id) }}
            >
              {fra.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          )}
          {fra.status === 'active' && (
            <button
              className="ua-btn-ghost"
              style={{ color: '#64a0ff', borderColor: '#64a0ff' }}
              onClick={(e) => { e.stopPropagation(); onComplete(fra._id) }}
            >
              Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const blankForm = () => ({
  title: '', description: '', targetAmount: '', category: ''
})

function useCategories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(CAT_API, { credentials: 'include' })
        const data = await res.json()
        if (data.success) {
          setCategories((data.data ?? []).filter(c => c.isActive === true))
        }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  return categories
}

function CategorySelect({ name, value, onChange, includeBlank = true, blankLabel = 'Select category (optional)' }) {
  const categories = useCategories()
  return (
    <select className="ua-input" name={name} value={value} onChange={onChange}>
      {includeBlank && <option value="">{blankLabel}</option>}
      {categories.map(c => (
        <option key={c._id} value={c._id}>{c.name}</option>
      ))}
    </select>
  )
}

export default function FundraisingActivity() {
  const [tab, setTab] = useState('search')
  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">My Fundraising Activities</h2>
        <p className="ua-subtitle">Create and manage your fundraising campaigns</p>
      </div>
      <div className="ua-tabs">
        {['search', 'create', 'update', 'history'].map(t => (
          <button
            key={t}
            className={`ua-tab ${tab === t ? 'ua-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'search'  && <ViewTab />}
      {tab === 'create'  && <CreateTab />}
      {tab === 'update'  && <UpdateTab />}
      {tab === 'history' && <HistoryTab />}
    </div>
  )
}

function ViewTab() {
  const [fras, setFras]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [expandedId, setExpanded] = useState(null)
  const [search, setSearch]       = useState('')

  const fetchFRAs = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(`${API}/mine`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFras(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFRAs() }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearch(query)
    if (!query.trim()) { fetchFRAs(); return }
    try {
      const res  = await fetch(`${API}/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFras(data.data)
      else setFras([])
    } catch { /* ignore */ }
  }

  const suspend = async (id) => {
    try {
      const res  = await fetch(`${API}/${id}/suspend`, { method: 'PATCH', credentials: 'include' })
      const data = await res.json()
      if (data.success) search.trim() ? handleSearch({ target: { value: search } }) : fetchFRAs()
    } catch { /* ignore */ }
  }

  const complete = async (id) => {
    try {
      const res  = await fetch(`${API}/${id}/complete`, { method: 'PATCH', credentials: 'include' })
      const data = await res.json()
      if (data.success) search.trim() ? handleSearch({ target: { value: search } }) : fetchFRAs()
    } catch { /* ignore */ }
  }

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <span className="ua-card-title">My campaigns</span>
        <button className="ua-btn ua-btn-sm" onClick={fetchFRAs}>Refresh</button>
      </div>

      <div className="ua-field">
        <input className="ua-input" placeholder="Search campaigns..." value={search} onChange={handleSearch} />
      </div>

      {loading && <p className="ua-muted">Loading…</p>}
      {error   && <div className="ua-msg ua-msg-error">{error}</div>}
      {!loading && !error && fras.length === 0 && <p className="ua-muted">No campaigns found</p>}

      <div className="ua-list">
        {fras.map(fra => {
          const isExpanded   = expandedId === fra._id
          const categoryName = fra.category?.name ?? '-'

          return (
            <div key={fra._id} className="ua-row ua-row-expandable">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setExpanded(isExpanded ? null : fra._id)}
              >
                <div className="ua-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                  {fra.title.slice(0, 2).toUpperCase()}
                </div>
                <div className="ua-row-body">
                  <p className="ua-row-name">{fra.title}</p>
                  <p className="ua-row-desc">{categoryName} · ${fra.targetAmount?.toLocaleString()}</p>
                </div>
                <StatusBadge status={fra.status} />
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <FRADetailCard
                  fra={fra}
                  categoryName={categoryName}
                  showActions={true}
                  onSuspend={suspend}
                  onComplete={complete}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CreateTab() {
  const [form, setForm]       = useState(blankForm())
  const [errors, setErrors]   = useState({})
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
    setMessage(null)
  }

  const handleSubmit = async () => {
    const errs = {}
    if (!form.title.trim())             errs.title        = 'Title is required'
    if (!form.targetAmount)             errs.targetAmount = 'Target amount is required'
    if (Number(form.targetAmount) <= 0) errs.targetAmount = 'Target amount must be greater than 0'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const body = {
      title:        form.title.trim(),
      description:  form.description.trim(),
      targetAmount: Number(form.targetAmount),
    }

    if (form.category) body.category = form.category

    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Campaign created! ID: ${data.data._id}` })
        setForm(blankForm())
        setErrors({})
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">New campaign</p>

      <Field label="Title" error={errors.title}>
        <input className={`ua-input ${errors.title ? 'ua-input-err' : ''}`} name="title" placeholder="Campaign title" value={form.title} onChange={handleChange} />
      </Field>

      <Field label="Description">
        <textarea className="ua-input" name="description" placeholder="Describe your campaign..." value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
      </Field>

      <Field label="Target Amount (SGD)" error={errors.targetAmount}>
        <input className={`ua-input ${errors.targetAmount ? 'ua-input-err' : ''}`} name="targetAmount" type="number" placeholder="e.g. 10000" value={form.targetAmount} onChange={handleChange} />
      </Field>

      <Field label={<>Category <span className="ua-optional">(optional)</span></>}>
        <CategorySelect name="category" value={form.category} onChange={handleChange} />
      </Field>

      <button className="ua-btn" onClick={handleSubmit}>Create campaign</button>
      {message && <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>{message.text}</div>}
    </div>
  )
}

function UpdateTab() {
  const [fraId, setFraId]     = useState('')
  const [form, setForm]       = useState(blankForm())
  const [errors, setErrors]   = useState({})
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!fraId.trim()) { setMessage({ type: 'error', text: 'Campaign ID is required' }); return }

    const body = {}
    if (form.title.trim())       body.title        = form.title.trim()
    if (form.description.trim()) body.description  = form.description.trim()
    if (form.targetAmount)       body.targetAmount = Number(form.targetAmount)
    if (form.category)           body.category     = form.category

    if (!Object.keys(body).length)  { setMessage({ type: 'error', text: 'No fields to update' }); return }
    if (body.targetAmount <= 0)     { setErrors({ targetAmount: 'Must be greater than 0' }); return }

    try {
      const res  = await fetch(`${API}/${fraId.trim()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) setMessage({ type: 'success', text: 'Campaign updated successfully!' })
      else setMessage({ type: 'error', text: data.message })
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">Update campaign</p>

      <Field label="Campaign ID *">
        <input className="ua-input" placeholder="MongoDB ObjectId" value={fraId} onChange={e => { setFraId(e.target.value); setMessage(null) }} />
      </Field>

      <div className="ua-divider" />
      <p className="ua-hint">Leave fields blank to keep existing values</p>

      <Field label="Title" error={errors.title}>
        <input className="ua-input" name="title" placeholder="New title (optional)" value={form.title} onChange={handleChange} />
      </Field>

      <Field label="Description">
        <textarea className="ua-input" name="description" placeholder="New description (optional)" value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
      </Field>

      <Field label="Target Amount" error={errors.targetAmount}>
        <input className="ua-input" name="targetAmount" type="number" placeholder="New amount (optional)" value={form.targetAmount} onChange={handleChange} />
      </Field>

      <Field label="Category">
        <CategorySelect
          name="category"
          value={form.category}
          onChange={handleChange}
          blankLabel="— keep existing —"
        />
      </Field>

      <button className="ua-btn" onClick={handleSubmit}>Save changes</button>
      {message && <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>{message.text}</div>}
    </div>
  )
}

function HistoryTab() {
  const [fras, setFras]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [expandedId, setExpanded] = useState(null)
  const [filters, setFilters]     = useState({ category: '', from: '', to: '' })
  const categories                = useCategories()

  const fetchCompleted = async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.from)     params.set('from', filters.from)
      if (filters.to)       params.set('to', filters.to)
      const res  = await fetch(`${API}/completed?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setFras(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCompleted() }, [])

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <span className="ua-card-title">Completed campaigns</span>
        <button className="ua-btn ua-btn-sm" onClick={fetchCompleted}>Search</button>
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

        <input className="ua-input" style={{ flex: 1, minWidth: '120px' }} name="from" type="date" value={filters.from} onChange={handleFilterChange} />
        <input className="ua-input" style={{ flex: 1, minWidth: '120px' }} name="to"   type="date" value={filters.to}   onChange={handleFilterChange} />
      </div>

      {loading && <p className="ua-muted">Loading…</p>}
      {error   && <div className="ua-msg ua-msg-error">{error}</div>}
      {!loading && !error && fras.length === 0 && <p className="ua-muted">No completed campaigns found</p>}

      <div className="ua-list">
        {fras.map(fra => {
          const isExpanded   = expandedId === fra._id
          const categoryName = fra.category?.name ?? '-'

          return (
            <div key={fra._id} className="ua-row ua-row-expandable">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setExpanded(isExpanded ? null : fra._id)}
              >
                <div className="ua-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                  {fra.title.slice(0, 2).toUpperCase()}
                </div>
                <div className="ua-row-body">
                  <p className="ua-row-name">{fra.title}</p>
                  <p className="ua-row-desc">{categoryName} · Completed {fra.completedAt ? new Date(fra.completedAt).toLocaleDateString() : '-'}</p>
                </div>
                <StatusBadge status={fra.status} />
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <FRADetailCard
                  fra={fra}
                  categoryName={categoryName}
                  showActions={false}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}