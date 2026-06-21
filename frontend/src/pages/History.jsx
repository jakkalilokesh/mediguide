import { useState, useEffect } from 'react'
import { Clock, Trash2, ChevronRight, ArrowLeft, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api'

export default function History() {
    const { authFetch } = useAuth()
    const [sessions, setSessions] = useState([])
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            const res = await authFetch(`${API_BASE}/history`)
            const data = await res.json()
            setSessions(data.sessions || [])
        } catch {
            /* ignore */
        }
        setLoading(false)
    }

    const fetchSession = async (id) => {
        try {
            const res = await authFetch(`${API_BASE}/history/${id}`)
            const data = await res.json()
            setSelected(data.session)
        } catch {
            /* ignore */
        }
    }

    const deleteSession = async (id, e) => {
        e.stopPropagation()
        try {
            await authFetch(`${API_BASE}/history/${id}`, { method: 'DELETE' })
            setSessions(prev => prev.filter(s => s.id !== id))
            if (selected?.id === id) setSelected(null)
        } catch {
            /* ignore */
        }
    }

    const formatDate = (d) => {
        try { return new Date(d).toLocaleString() } catch { return d }
    }

    const parseContent = (content) => {
        try {
            const parsed = JSON.parse(content)
            if (parsed.whatToDoNow) return parsed.whatToDoNow.join('. ').slice(0, 200) + '...'
            if (parsed.guidance) return parsed.guidance.join('. ').slice(0, 200) + '...'
            if (parsed.message) return parsed.message.slice(0, 200) + '...'
            return content.slice(0, 200) + '...'
        } catch {
            return content.slice(0, 200)
        }
    }

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock size={26} color="var(--text-sec)" />
                    Session History
                </h1>
                <p>Review your previous health consultations and guidance.</p>
            </div>

            {/* Session Detail */}
            {selected ? (
                <div>
                    <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginBottom: 16 }}
                        onClick={() => setSelected(null)}
                    >
                        <ArrowLeft size={14} /> Back to list
                    </button>

                    <div style={{ marginBottom: 16 }}>
                        <p className="history-card-time">{formatDate(selected.createdAt)}</p>
                        {selected.modules && (
                            <div className="history-card-modules" style={{ marginTop: 6 }}>
                                {selected.modules.map(m => (
                                    <span key={m} className="history-module-tag">{m}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(selected.messages || []).map((msg, i) => (
                            <div key={i} style={{ paddingLeft: 14, borderLeft: `2px solid ${msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)'}` }}>
                                <p style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>
                                    {msg.role === 'user' ? 'You' : 'MediGuide'}{msg.module ? ` · ${msg.module}` : ''}
                                </p>
                                <p style={{ fontSize: '.82rem', lineHeight: 1.6, color: 'var(--text)' }}>
                                    {msg.role === 'assistant' ? parseContent(msg.content) : msg.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {loading && <p style={{ color: 'var(--text-dim)', fontSize: '.82rem' }}>Loading...</p>}

                    {!loading && sessions.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <FileText size={24} />
                            </div>
                            <h3>No sessions yet</h3>
                            <p>Your health consultation history will appear here.</p>
                        </div>
                    )}

                    <div className="history-list">
                        {sessions.map(session => (
                            <div key={session.id} className="history-card" onClick={() => fetchSession(session.id)}>
                                <div style={{ flex: 1 }}>
                                    <p className="history-card-time">{formatDate(session.lastUpdated)}</p>
                                    <p className="history-card-preview">{session.preview}</p>
                                    <div className="history-card-modules">
                                        {(session.modules || []).map(m => (
                                            <span key={m} className="history-module-tag">{m}</span>
                                        ))}
                                        <span style={{ fontSize: '.68rem', color: 'var(--text-dim)' }}>
                                            {session.messageCount} messages
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <button
                                        className="btn btn-sm"
                                        style={{ color: 'var(--alert)', background: 'none', border: 'none', padding: 6 }}
                                        onClick={(e) => deleteSession(session.id, e)}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    <ChevronRight size={16} color="var(--text-dim)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
