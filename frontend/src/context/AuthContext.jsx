import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AuthContext = createContext(null)

const API_BASE = '/api'

// Decode JWT payload to read expiry time without a library
function decodeTokenPayload(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('mediguide-token'))
    const [loading, setLoading] = useState(true)
    const logoutTimerRef = useRef(null)

    // Schedule auto-logout when token is about to expire
    const scheduleAutoLogout = useCallback((jwt) => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)

        const payload = decodeTokenPayload(jwt)
        if (!payload?.exp) return

        const expiresIn = payload.exp * 1000 - Date.now()
        const warningBuffer = 60 * 1000 // 1 minute before expiry

        if (expiresIn <= 0) {
            logout()
            return
        }

        logoutTimerRef.current = setTimeout(() => {
            logout()
        }, Math.max(expiresIn - warningBuffer, 0))
    }, [])

    useEffect(() => {
        if (token) {
            scheduleAutoLogout(token)
            fetchProfile()
        } else {
            setLoading(false)
        }

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
        }
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            } else if (res.status === 401) {
                logout()
            } else {
                logout()
            }
        } catch {
            // Server not reachable, keep token for retry
        }
        setLoading(false)
    }

    const register = async (email, password, name) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        localStorage.setItem('mediguide-token', data.token)
        setToken(data.token)
        setUser(data.user)
        scheduleAutoLogout(data.token)
        return data
    }

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        localStorage.setItem('mediguide-token', data.token)
        setToken(data.token)
        setUser(data.user)
        scheduleAutoLogout(data.token)
        return data
    }

    const logout = () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
        localStorage.removeItem('mediguide-token')
        setToken(null)
        setUser(null)
    }

    const updateProfile = async (profileData) => {
        const res = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setUser(data.user)
        return data
    }

    // Authenticated fetch wrapper that auto-logouts on 401
    const authFetch = async (url, options = {}) => {
        const headers = { ...options.headers }
        if (token) headers.Authorization = `Bearer ${token}`
        const res = await fetch(url, { ...options, headers })
        if (res.status === 401) {
            logout()
        }
        return res
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, authFetch, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
