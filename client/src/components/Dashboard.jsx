import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserAccount       from './UserAccount'
import UserProfile       from './UserProfile'
import FundraisingActivity from './FundraisingActivity'
import BrowseCampaigns   from './BrowseCampaigns'
import ViewCampaigns     from './ViewCampaigns'
import FRACategory       from './FRACategory'
import Favourites        from './Favourites'
import DonationHistory   from './DonationHistory'
import Reports           from './Reports'

const NAV_ITEMS = [
  { id: 'accounts',      label: 'User Accounts',    icon: '👤', permission: 'user_management' },
  { id: 'profiles',      label: 'User Profiles',    icon: '🏷️', permission: 'user_management' },
  { id: 'campaigns',     label: 'My Campaigns',     icon: '📢', permission: 'fundraising' },
  { id: 'viewcampaigns', label: 'All Campaigns',    icon: '🔍', permission: 'fundraising' },
  { id: 'browse',        label: 'Browse',           icon: '🔍', permission: 'donating' },
  { id: 'favourites',    label: 'Favourites',       icon: '❤️', permission: 'donating' },
  { id: 'donations',     label: 'Donation History', icon: '💰', permission: 'donating' },
  { id: 'categories',    label: 'FRA Categories',   icon: '🗂️', permission: 'platform_management' },
  { id: 'reports',       label: 'Reports',          icon: '📊', permission: 'platform_management' },
]

function NoPermission() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', opacity: 0.6 }}>
      <span style={{ fontSize: '2rem' }}>🔒</span>
      <p style={{ fontSize: '1rem', color: 'var(--dash-text-muted)' }}>You don't have permission to view this page.</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('dark')

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const isProfileActive = user?.userProfile?.isActive ?? true
  const userPermissions = user?.userProfile?.permissions || []
  const visibleNavItems = (user?.userProfile && !isProfileActive)
    ? []
    : NAV_ITEMS.filter(item => userPermissions.includes(item.permission))

  const [active, setActive] = useState(visibleNavItems[0]?.id || '')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const hasPermission = (id) => {
    if (user?.userProfile && !isProfileActive) return false
    const item = NAV_ITEMS.find(n => n.id === id)
    return item ? userPermissions.includes(item.permission) : false
  }

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-icon">◈</span>
          <span className="dash-brand-name">FundFlow</span>
        </div>
        <nav className="dash-nav">
          {visibleNavItems.map(item => (
            <button
              key={item.id}
              className={`dash-nav-item ${active === item.id ? 'dash-nav-active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <div className="dash-user-info">
            <div className="dash-avatar">
              {String(user?.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="dash-username">{user?.username || 'Admin'}</p>
              <p className="dash-role">{user?.userProfile?.profileName || 'Administrator'}</p>
            </div>
          </div>
          <button className="dash-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
          </button>
          <button className="dash-logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="dash-main">
        {active === 'accounts'      && (hasPermission('accounts')      ? <UserAccount />         : <NoPermission />)}
        {active === 'profiles'      && (hasPermission('profiles')      ? <UserProfile />         : <NoPermission />)}
        {active === 'campaigns'     && (hasPermission('campaigns')     ? <FundraisingActivity /> : <NoPermission />)}
        {active === 'viewcampaigns' && (hasPermission('viewcampaigns') ? <ViewCampaigns />       : <NoPermission />)}
        {active === 'browse'        && (hasPermission('browse')        ? <BrowseCampaigns />     : <NoPermission />)}
        {active === 'favourites'    && (hasPermission('favourites')    ? <Favourites />          : <NoPermission />)}
        {active === 'donations'     && (hasPermission('donations')     ? <DonationHistory />     : <NoPermission />)}
        {active === 'categories'    && (hasPermission('categories')    ? <FRACategory />         : <NoPermission />)}
        {active === 'reports'       && (hasPermission('reports')       ? <Reports />             : <NoPermission />)}
        {!active && <NoPermission />}
      </main>
    </div>
  )
}
