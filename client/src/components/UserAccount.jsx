import { useState, useEffect } from 'react'

const API      = 'http://localhost:3001/api/users-account'
const PROF_API = 'http://localhost:3001/api/user-profiles'

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PW_RE    = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

function validate(field, value, optional = false) {
  if (field === 'email') {
    if (!value && optional) return null
    if (!value) return 'Email is required'
    if (!EMAIL_RE.test(value)) return 'Invalid email format'
    return null
  }
  if (field === 'password') {
    if (!value && optional) return null
    if (!value) return 'Password is required'
    if (value.length < 8) return 'At least 8 characters'
    if (!PW_RE.test(value)) return 'Must include uppercase, lowercase, number & symbol'
    return null
  }
  return null
}

function useProfiles() {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    fetch(`${PROF_API}/search?query=`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setProfiles(d.data.filter(p => p.isActive)) })
      .catch(err => console.error('Failed to fetch profiles:', err))
  }, [])

  const defaultProfileId = profiles[0]?._id || ''

  return { profiles, defaultProfileId }
}

const blankForm = (defaultProfileId = '') => ({
  username: '', email: '', password: '',
  userProfile: defaultProfileId,
  dateOfBirth: '', phone: '', address: ''
})

function Field({ label, error, children }) {
  return (
    <div className="ua-field">
      <label className="ua-label">{label}</label>
      {children}
      {error && <p className="ua-err-text">{error}</p>}
    </div>
  )
}

function Avatar({ name, size = 34 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase()
  return (
    <div className="ua-avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

export default function UserAccount() {
  const [tab, setTab] = useState('search')

  return (
    <div className="ua-container">
      <div className="ua-header">
        <h2 className="ua-title">User Management</h2>
        <p className="ua-subtitle">Manage user accounts on the platform</p>
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

      {tab === 'search'   && <ViewAccounts />}
      {tab === 'create' && <CreateAccount />}
      {tab === 'update' && <UpdateAccount />}
    </div>
  )
}

function ViewAccounts() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch]         = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/search?query=`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setUsers(data.data)
      else setError(data.message)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const searchAccount = async (e) => {
    const query = e.target.value
    setSearch(query)
    if (!query.trim()) { fetchUsers(); return }
    try {
      const res  = await fetch(`${API}/search?query=${encodeURIComponent(query)}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) setUsers(data.data)
      else setUsers([])
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const suspendAccount = async (id) => {
    try {
      const res  = await fetch(`${API}/${id}/suspend`, { method: 'PATCH', credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        if (search.trim()) searchAccount({ target: { value: search } })
        else fetchUsers()
      }
    } catch (err) {
      console.error('Suspend failed:', err)
    }
  }

  return (
    <div className="ua-card">
      <div className="ua-card-header">
        <span className="ua-card-title">All users</span>
        <button className="ua-btn ua-btn-sm" onClick={fetchUsers}>Refresh</button>
      </div>

      <div className="ua-field">
        <input
          className="ua-input"
          placeholder="Search users..."
          value={search}
          onChange={searchAccount}
        />
      </div>

      {loading && <p className="ua-muted">Loading…</p>}
      {error   && <div className="ua-msg ua-msg-error">{error}</div>}
      {!loading && !error && users.length === 0 && <p className="ua-muted">No users found</p>}

      <div className="ua-list">
        {users.map(u => {
          const isExpanded  = expandedId === u._id
          const profileName = u.userProfile?.profileName || '-'

          return (
            <div key={u._id} className="ua-row ua-row-expandable">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setExpandedId(isExpanded ? null : u._id)}
              >
                <Avatar name={u.username} />
                <div className="ua-row-body">
                  <p className="ua-row-name">{u.username}</p>
                  <p className="ua-row-desc">{u.email}</p>
                </div>
                <span className="ua-role-badge">{profileName}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--ua-border)', marginTop: '0.5rem' }}>
                  <p className="ua-muted" style={{ fontSize: '0.72rem', marginBottom: '0.25rem' }}>ID: {u._id}</p>
                  <p className="ua-row-name">{u.username}</p>
                  <p className="ua-row-desc">{u.email}</p>
                  {u.phone       && <p className="ua-row-desc">Phone: {u.phone}</p>}
                  {u.address     && <p className="ua-row-desc">Address: {u.address}</p>}
                  {u.dateOfBirth && <p className="ua-row-desc">DOB: {new Date(u.dateOfBirth).toLocaleDateString()}</p>}
                  <p className="ua-row-desc">Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</p>

                  <div className="ua-row-actions" style={{ marginTop: '0.75rem' }}>
                    <span className={`ua-badge ${u.isActive ? 'ua-badge-active' : 'ua-badge-inactive'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <button
                      className="ua-btn-ghost"
                      onClick={(e) => { e.stopPropagation(); suspendAccount(u._id) }}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
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

function CreateAccount() {
  const { profiles, defaultProfileId } = useProfiles()
  const [form, setForm]                = useState(() => blankForm())
  const [errors, setErrors]            = useState({})
  const [message, setMessage]          = useState(null)

  const effectiveProfile = form.userProfile || defaultProfileId

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'email' || name === 'password') {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }))
    }
    setMessage(null)
  }

  const handleSubmit = async () => {
    const emailErr = validate('email', form.email)
    const pwErr    = validate('password', form.password)
    if (!form.username.trim()) { setErrors({ username: 'Username is required', email: emailErr, password: pwErr }); return }
    if (emailErr || pwErr)     { setErrors({ email: emailErr, password: pwErr }); return }
    if (!effectiveProfile)     { setErrors({ userProfile: 'Profile is required' }); return }

    const body = {
      username:    form.username.trim(),
      email:       form.email.trim(),
      password:    form.password,
      userProfile: effectiveProfile,
    }
    if (form.dateOfBirth)    body.dateOfBirth = form.dateOfBirth
    if (form.phone.trim())   body.phone       = form.phone.trim()
    if (form.address.trim()) body.address     = form.address.trim()

    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `User created! ID: ${data.data._id}` })
        setForm(blankForm())
        setErrors({})
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (err) {
      console.error('Create user failed:', err)
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">New user</p>

      <Field label="Username" error={errors.username}>
        <input className={`ua-input ${errors.username ? 'ua-input-err' : ''}`} name="username" placeholder="e.g. johndoe" value={form.username} onChange={handleChange} />
      </Field>

      <Field label="Email" error={errors.email}>
        <input className={`ua-input ${errors.email ? 'ua-input-err' : ''}`} name="email" placeholder="user@example.com" value={form.email} onChange={handleChange} />
      </Field>

      <Field label="Password" error={errors.password}>
        <input className={`ua-input ${errors.password ? 'ua-input-err' : ''}`} name="password" type="password" placeholder="Min 8 chars, upper, lower, number, symbol" value={form.password} onChange={handleChange} />
      </Field>

      <Field label="User Profile" error={errors.userProfile}>
        <select className="ua-input" name="userProfile" value={effectiveProfile} onChange={handleChange}>
          {profiles.map(p => <option key={p._id} value={p._id}>{p.profileName}</option>)}
        </select>
      </Field>

      <Field label={<>Date of Birth <span className="ua-optional">(optional)</span></>}>
        <input className="ua-input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
      </Field>

      <Field label={<>Phone <span className="ua-optional">(optional)</span></>}>
        <input className="ua-input" name="phone" placeholder="+65 9123 4567" value={form.phone} onChange={handleChange} />
      </Field>

      <Field label={<>Address <span className="ua-optional">(optional)</span></>}>
        <input className="ua-input" name="address" placeholder="123 Street, City" value={form.address} onChange={handleChange} />
      </Field>

      <button className="ua-btn" onClick={handleSubmit}>Create user</button>
      {message && <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>{message.text}</div>}
    </div>
  )
}

function UpdateAccount() {
  const { profiles }            = useProfiles()
  const [userId, setUserId]     = useState('')
  const [form, setForm]         = useState(blankForm)
  const [errors, setErrors]     = useState({})
  const [message, setMessage]   = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'email' || name === 'password') {
      setErrors(prev => ({ ...prev, [name]: validate(name, value, true) }))
    }
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!userId.trim()) { setMessage({ type: 'error', text: 'User ID is required' }); return }
    const emailErr = validate('email', form.email, true)
    const pwErr    = validate('password', form.password, true)
    if (emailErr || pwErr) { setErrors({ email: emailErr, password: pwErr }); return }

    const body = {}
    if (form.username.trim())    body.username    = form.username.trim()
    if (form.email.trim())       body.email       = form.email.trim()
    if (form.password)           body.password    = form.password
    if (form.userProfile)        body.userProfile = form.userProfile
    if (form.dateOfBirth)        body.dateOfBirth = form.dateOfBirth
    if (form.phone.trim())       body.phone       = form.phone.trim()
    if (form.address.trim())     body.address     = form.address.trim()

    if (!Object.keys(body).length) { setMessage({ type: 'error', text: 'No fields to update' }); return }

    try {
      const res  = await fetch(`${API}/${userId.trim()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) setMessage({ type: 'success', text: 'User updated successfully!' })
      else setMessage({ type: 'error', text: data.message })
    } catch (err) {
      console.error('Update user failed:', err)
      setMessage({ type: 'error', text: 'Error connecting to server' })
    }
  }

  return (
    <div className="ua-card">
      <p className="ua-card-title">Update existing user</p>

      <Field label={<>User ID <span className="ua-required">*</span></>}>
        <input className="ua-input" placeholder="MongoDB ObjectId" value={userId} onChange={e => { setUserId(e.target.value); setMessage(null) }} />
      </Field>

      <div className="ua-divider" />
      <p className="ua-hint">Leave fields blank to keep existing values</p>

      <Field label="Username">
        <input className="ua-input" name="username" placeholder="New username (optional)" value={form.username} onChange={handleChange} />
      </Field>

      <Field label="Email" error={errors.email}>
        <input className={`ua-input ${errors.email ? 'ua-input-err' : ''}`} name="email" placeholder="New email (optional)" value={form.email} onChange={handleChange} />
      </Field>

      <Field label="Password" error={errors.password}>
        <input className={`ua-input ${errors.password ? 'ua-input-err' : ''}`} name="password" type="password" placeholder="New password (optional)" value={form.password} onChange={handleChange} />
      </Field>

      <Field label="User Profile">
        <select className="ua-input" name="userProfile" value={form.userProfile} onChange={handleChange}>
          <option value="">- no change -</option>
          {profiles.map(p => <option key={p._id} value={p._id}>{p.profileName}</option>)}
        </select>
      </Field>

      <Field label="Date of Birth">
        <input className="ua-input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
      </Field>

      <Field label="Phone">
        <input className="ua-input" name="phone" placeholder="New phone (optional)" value={form.phone} onChange={handleChange} />
      </Field>

      <Field label="Address">
        <input className="ua-input" name="address" placeholder="New address (optional)" value={form.address} onChange={handleChange} />
      </Field>

      <button className="ua-btn" onClick={handleSubmit}>Save changes</button>
      {message && <div className={`ua-msg ${message.type === 'success' ? 'ua-msg-success' : 'ua-msg-error'}`}>{message.text}</div>}
    </div>
  )
}