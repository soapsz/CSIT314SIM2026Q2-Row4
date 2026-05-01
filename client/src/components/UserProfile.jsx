import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api/user-profiles'

const PERMISSIONS = [
  { value: 'user_management', label: 'User Management', desc: 'Can manage users and profiles' },
  { value: 'fundraising', label: 'Fundraising', desc: 'Can create and manage FRA' },
  { value: 'donating', label: 'Donating', desc: 'Can browse, save, and donate to FRA' },
  { value: 'platform_management', label: 'Platform Management', desc: 'Can manage categories and generate reports' },
]

function PermissionCheckboxes({ selected, onChange }) {
  const toggle = (val) => {
    onChange(
      selected.includes(val)
        ? selected.filter(p => p !== val)
        : [...selected, val]
    )
  }

  return (
    <div className="ua-field">
      <label className="ua-label">
        Permissions <span className="ua-required">*</span>
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PERMISSIONS.map(p => (
          <label
            key={p.value}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={selected.includes(p.value)}
              onChange={() => toggle(p.value)}
              style={{ accentColor: 'var(--ua-accent)', width: '14px', height: '14px' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--ua-text)' }}>{p.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--ua-muted)' }}>{p.desc}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function UserProfile() {
  const [tab, setTab] = useState('search')

  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">User Profiles</h2>
        <p className="ua-subtitle">Manage roles available on the platform</p>
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

      {tab === 'search' && <ViewProfiles />}
      {tab === 'create' && <CreateProfile />}
      {tab === 'update' && <UpdateProfile />}
    </div>
  )
}

function ViewProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')

  const fetch_ = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/search?query=`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setProfiles(data.data)
      else setError(data.message)
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearch(query)
    if (!query.trim()) { fetch_(); return }
    try {
      const res = await fetch(`${API}/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setProfiles(data.data)
      else setProfiles([])
    } catch (err) {
      console.error(err)
    }
  }

  const suspendProfile = async (id) => {
    try {
      const res = await fetch(`${API}/${id}/suspend`, { method: 'PATCH', credentials: 'include' })
      const data = await res.json()
      if (data.success) search.trim() ? handleSearch({ target: { value: search } }) : fetch_()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <span className="ua-card-title">All profiles</span>
        <button className="ua-btn ua-btn-sm" onClick={fetch_}>Refresh</button>
      </div>

      <div className="ua-field">
        <input className="ua-input" placeholder="Search profiles..." value={search} onChange={handleSearch} />
      </div>

      {loading && <p className="ua-muted">Loading…</p>}
      {error && <div className="ua-msg ua-msg-error">{error}</div>}
      {!loading && !error && profiles.length === 0 && <p className="ua-muted">No profiles found</p>}

      <div className="ua-list">
        {profiles.map(p => {
          const isExpanded = expandedId === p._id
          return (
            <div key={p._id} className="ua-row ua-row-expandable">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setExpandedId(isExpanded ? null : p._id)}
              >
                <div className="ua-row-dot" style={{ background: p.isActive ? '#4fffb0' : '#e24b4a' }} />
                <div className="ua-row-body">
                  <p className="ua-row-name">{p.profileName}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {isExpanded && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem' }}>
                  <p className="ua-muted" style={{ fontSize: '0.72rem' }}>ID: {p._id}</p>
                  <p className="ua-row-name">{p.profileName}</p>
                  {p.description && <p className="ua-row-desc">{p.description}</p>}

                  {p.permissions?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {p.permissions.map(perm => (
                        <span key={perm} className="ua-perm-badge">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="ua-row-actions" style={{ marginTop: '0.75rem' }}>
                    <span className={`ua-badge ${p.isActive ? 'ua-badge-active' : 'ua-badge-inactive'}`}>
                      {p.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <button className="ua-btn-ghost" onClick={(e) => { e.stopPropagation(); suspendProfile(p._id) }}>
                      {p.isActive ? 'Suspend' : 'Activate'}
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

function CreateProfile() {
  const [form, setForm] = useState({ profileName: '', description: '', permissions: [] })
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!form.profileName.trim()) { setMessage({ type: 'error', text: 'Profile name is required' }); return }
    if (!form.permissions.length) { setMessage({ type: 'error', text: 'At least one permission is required' }); return }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Profile "${data.data.profileName}" created!` })
        setForm({ profileName: '', description: '', permissions: [] })
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">New profile</p>

      <div className="ua-field">
        <label className="ua-label">Profile name</label>
        <input className="ua-input" name="profileName" value={form.profileName} onChange={handleChange} />
      </div>

      <div className="ua-field">
        <label className="ua-label">Description <span className="ua-optional">(optional)</span></label>
        <textarea className="ua-input ua-textarea" name="description" value={form.description} onChange={handleChange} rows={3} />
      </div>

      <PermissionCheckboxes
        selected={form.permissions}
        onChange={perms => { setForm(prev => ({ ...prev, permissions: perms })); setMessage(null) }}
      />

      <button className="ua-btn" onClick={handleSubmit}>Create profile</button>

      {message && (
        <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}

function UpdateProfile() {
  const [profileId, setProfileId] = useState('')
  const [form, setForm] = useState({ profileName: '', description: '', permissions: [] })
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    if (!profileId.trim()) { setMessage({ type: 'error', text: 'Profile ID is required' }); return }
    if (!form.permissions.length) { setMessage({ type: 'error', text: 'At least one permission is required' }); return }

    const body = {}
    if (form.profileName.trim()) body.profileName = form.profileName.trim()
    if (form.description.trim()) body.description = form.description.trim()
    body.permissions = form.permissions

    try {
      const res = await fetch(`${API}/${profileId.trim()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) setMessage({ type: 'success', text: 'Profile updated!' })
      else setMessage({ type: 'error', text: data.message })
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">Update profile</p>

      <div className="ua-field">
        <label className="ua-label">Profile ID <span className="ua-required">*</span></label>
        <input className="ua-input" value={profileId} onChange={e => { setProfileId(e.target.value); setMessage(null) }} />
      </div>

      <div className="ua-divider" />
      <p className="ua-hint">Leave fields blank to keep existing values</p>

      <div className="ua-field">
        <label className="ua-label">Profile name</label>
        <input className="ua-input" value={form.profileName} onChange={e => { setForm(p => ({ ...p, profileName: e.target.value })); setMessage(null) }} />
      </div>

      <div className="ua-field">
        <label className="ua-label">Description</label>
        <textarea className="ua-input ua-textarea" rows={3} value={form.description} onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setMessage(null) }} />
      </div>

      <PermissionCheckboxes
        selected={form.permissions}
        onChange={perms => { setForm(prev => ({ ...prev, permissions: perms })); setMessage(null) }}
      />

      <button className="ua-btn" onClick={handleSubmit}>Save changes</button>

      {message && (
        <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}