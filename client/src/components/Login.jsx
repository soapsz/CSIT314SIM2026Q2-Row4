import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      login(data)
      navigate('/dashboard')
    } catch {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="login-root">

      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-icon">◈</span>
          <span className="login-brand-name">CSIT314</span>
        </div>

        <div className="login-tagline">
          <h1>
            Online Fundraising<br />
            System
          </h1>
          <p>CSIT314 - Software Development Methodology</p>
        </div>

        <div className="login-deco" aria-hidden="true">
          <div className="deco-ring deco-ring-1" />
          <div className="deco-ring deco-ring-2" />
          <div className="deco-ring deco-ring-3" />
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <p className="login-eyebrow">Welcome back</p>
          <h2 className="login-heading">Sign in</h2>

          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              className={`login-input ${error ? 'login-input-err' : ''}`}
              name="username"
              placeholder="your_username"
              value={form.username}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className={`login-input ${error ? 'login-input-err' : ''}`}
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className={`login-btn ${loading ? 'login-btn-loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="login-spinner" /> : 'Sign in'}
          </button>

        </div>
      </div>

    </div>
  )
}