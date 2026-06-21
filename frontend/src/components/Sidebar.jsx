import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
    HeartPulse, Sun, Moon, Menu, X, User, LogIn,
    Home, Stethoscope, ShieldPlus, Pill, Leaf,
    Brain, Apple, Calculator, FlaskConical,
    BarChart3, Database, AlertTriangle, Clock,
    ChevronLeft, ChevronRight, UserRound, Search
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const mainLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/symptoms', label: 'Symptoms', icon: Stethoscope },
    { to: '/firstaid', label: 'First Aid', icon: ShieldPlus },
    { to: '/medicine', label: 'Medicine', icon: Pill },
    { to: '/wellness', label: 'Wellness', icon: Leaf },
    { to: '/mentalhealth', label: 'Mental Health', icon: Brain },
    { to: '/nutrition', label: 'Nutrition', icon: Apple },
    { to: '/calculators', label: 'Calculators', icon: Calculator },
    { to: '/druginteraction', label: 'Drug Check', icon: FlaskConical },
    { to: '/consultation', label: 'AI Clinic', icon: UserRound },
    { to: '/analytics', label: 'Dashboard', icon: BarChart3 },
    { to: '/health-data', label: 'Health Data', icon: Database },
    { to: '/emergency', label: 'Emergency', icon: AlertTriangle },
    { to: '/history', label: 'History', icon: Clock },
]

/* ── Global Search Component ── */
function GlobalSearch() {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const wrapperRef = useRef(null)

    const filtered = query.trim()
        ? mainLinks.filter(l =>
            l.label.toLowerCase().includes(query.toLowerCase())
        )
        : []

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (to) => {
        navigate(to)
        setQuery('')
        setOpen(false)
    }

    return (
        <div className="topbar-search" ref={wrapperRef}>
            <Search size={14} className="topbar-search-icon" />
            <input
                className="topbar-search-input"
                placeholder="Search modules..."
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => query && setOpen(true)}
            />
            {open && filtered.length > 0 && (
                <div className="search-results-dropdown">
                    {filtered.map(link => {
                        const Icon = link.icon
                        return (
                            <button
                                key={link.to}
                                className="search-result-item"
                                onClick={() => handleSelect(link.to)}
                            >
                                <Icon size={16} />
                                <span>{link.label}</span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function Navbar({ darkMode, setDarkMode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { isAuthenticated, user } = useAuth()

    const closeSidebar = () => setSidebarOpen(false)

    return (
        <>
            {/* ── Top Bar ── */}
            <nav className="topbar">
                <button
                    className="topbar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <Link to="/" className="topbar-logo">
                    <HeartPulse size={20} color="var(--primary)" />
                    <span>MediGuide</span>
                </Link>

                <GlobalSearch />

                <div className="topbar-actions">
                    <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    {isAuthenticated ? (
                        <NavLink to="/profile" className="nav-avatar-btn" title={user?.name}>
                            <User size={16} />
                        </NavLink>
                    ) : (
                        <NavLink to="/login" className="nav-login-btn">
                            <LogIn size={15} /> <span>Login</span>
                        </NavLink>
                    )}
                </div>
            </nav>

            {/* ── Sidebar Overlay (mobile) ── */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-brand" onClick={closeSidebar}>
                        <HeartPulse size={22} color="var(--primary)" />
                        <span className="sidebar-brand-text">MediGuide</span>
                    </Link>
                    <button className="sidebar-close" onClick={closeSidebar}>
                        <ChevronLeft size={18} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">Navigation</div>
                    {mainLinks.map(link => {
                        const Icon = link.icon
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === '/'}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                                onClick={closeSidebar}
                            >
                                <Icon size={18} className="sidebar-link-icon" />
                                <span className="sidebar-link-label">{link.label}</span>
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    {isAuthenticated ? (
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={closeSidebar}
                        >
                            <User size={18} className="sidebar-link-icon" />
                            <span className="sidebar-link-label">Profile</span>
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/login" className="sidebar-link" onClick={closeSidebar}>
                                <LogIn size={18} className="sidebar-link-icon" />
                                <span className="sidebar-link-label">Login</span>
                            </NavLink>
                            <NavLink to="/register" className="sidebar-link" onClick={closeSidebar}>
                                <User size={18} className="sidebar-link-icon" />
                                <span className="sidebar-link-label">Sign Up</span>
                            </NavLink>
                        </>
                    )}
                </div>
            </aside>
        </>
    )
}
