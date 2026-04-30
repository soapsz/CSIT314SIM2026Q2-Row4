import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api/fra-categories'

function Field({ label, error, children }) {
  return (
    <div className="ua-field">
      <label className="ua-label">{label}</label>
      {children}
      {error && <p className="ua-err-text">{error}</p>}
    </div>
  )
}

function StatusBadge({ isActive }) {
  return (
    <span className={`ua-badge ${isActive ? 'ua-badge-active' : 'ua-badge-inactive'}`}>
      {isActive ? 'active' : 'suspended'}
    </span>
  )
}

const blankForm = () => ({ name: '', description: '' })

export default function FRACategory() {
  const [tab, setTab] = useState('search')
  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">FRA Categories</h2>
        <p className="ua-subtitle">Manage fundraising activity categories</p>
      </div>
      <div className="ua-tabs">
        {['search', 'create', 'update'].map(t => (
          <button
            key={t}
            className={`ua-tab ${tab === t ? 'ua-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'search' && <SearchTab />}
      {tab === 'create' && <CreateTab />}
      {tab === 'update' && <UpdateTab />}
    </div>
  )
}

function SearchTab() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [expandedId, setExpanded]   = useState(null)

  const fetchAll = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch(`${API}/search?query=`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setCategories(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearch(query)
    try {
      const res  = await fetch(`${API}/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setCategories(data.data)
      else setCategories([])
    } catch { /* ignore */ }
  }

  const suspend = async (id, e) => {
    e.stopPropagation()
    try {
      const res  = await fetch(`${API}/${id}/suspend`, { method: 'PATCH', credentials: 'include' })
      const data = await res.json()
      if (data.success) fetchAll()
    } catch { /* ignore */ }
  }

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <span className="ua-card-title">All categories</span>
        <button className="ua-btn ua-btn-sm" onClick={fetchAll}>Refresh</button>
      </div>

      <div className="ua-field">
        <input className="ua-input" placeholder="Search categories..." value={search} onChange={handleSearch} />
      </div>

      {loading && <p className="ua-muted">Loading…</p>}
      {error   && <div className="ua-msg ua-msg-error">{error}</div>}
      {!loading && !error && categories.length === 0 && <p className="ua-muted">No categories found</p>}

      <div className="ua-list">
        {categories.map(cat => {
          const isExpanded = expandedId === cat._id
          return (
            <div key={cat._id} className="ua-row ua-row-expandable" onClick={() => setExpanded(isExpanded ? null : cat._id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="ua-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                  {cat.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="ua-row-body">
                  <p className="ua-row-name">{cat.name}</p>
                  <p className="ua-row-desc">{cat.description || '-'}</p>
                </div>
                <StatusBadge isActive={cat.isActive} />
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--ua-border-2)', marginTop: '0.5rem' }}>
                  <p className="ua-muted" style={{ fontSize: '0.72rem', marginBottom: '0.25rem' }}>ID: {cat._id}</p>
                  <p className="ua-row-desc">Created: {new Date(cat.createdAt).toLocaleDateString()}</p>
                  <div className="ua-row-actions" style={{ marginTop: '0.75rem' }}>
                    <StatusBadge isActive={cat.isActive} />
                    <button className="ua-btn-ghost" onClick={(e) => suspend(cat._id, e)}>
                      {cat.isActive ? 'Suspend' : 'Activate'}
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
    if (!form.name.trim()) errs.name = 'Category name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Category created! ID: ${data.data._id}` })
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
      <p className="ua-card-title">New category</p>

      <Field label="Name *" error={errors.name}>
        <input className={`ua-input ${errors.name ? 'ua-input-err' : ''}`} name="name" placeholder="Category name" value={form.name} onChange={handleChange} />
      </Field>

      <Field label={<>Description <span className="ua-optional">(optional)</span></>}>
        <textarea className="ua-input" name="description" placeholder="Describe this category..." value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
      </Field>

      <button className="ua-btn" onClick={handleSubmit}>Create category</button>
      {message && <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>{message.text}</div>}
    </div>
  )
}

function UpdateTab() {
  const [categoryId, setCategoryId] = useState('')
  const [form, setForm]             = useState(blankForm())
  const [errors, setErrors]         = useState({})
  const [message, setMessage]       = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!categoryId.trim()) { setMessage({ type: 'error', text: 'Category ID is required' }); return }

    const body = {}
    if (form.name.trim())        body.name        = form.name.trim()
    if (form.description.trim()) body.description = form.description.trim()

    if (!Object.keys(body).length) { setMessage({ type: 'error', text: 'No fields to update' }); return }

    try {
      const res  = await fetch(`${API}/${categoryId.trim()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) setMessage({ type: 'success', text: 'Category updated successfully!' })
      else setMessage({ type: 'error', text: data.message })
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">Update category</p>

      <Field label="Category ID *">
        <input className="ua-input" placeholder="MongoDB ObjectId" value={categoryId} onChange={e => { setCategoryId(e.target.value); setMessage(null) }} />
      </Field>

      <div className="ua-divider" />
      <p className="ua-hint">Leave fields blank to keep existing values</p>

      <Field label="Name" error={errors.name}>
        <input className="ua-input" name="name" placeholder="New name (optional)" value={form.name} onChange={handleChange} />
      </Field>

      <Field label="Description">
        <textarea className="ua-input" name="description" placeholder="New description (optional)" value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
      </Field>

      <button className="ua-btn" onClick={handleSubmit}>Save changes</button>
      {message && <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>{message.text}</div>}
    </div>
  )
}