import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BarChart3, TrendingUp, Activity, Calendar, Brain, Heart, ArrowUpRight } from 'lucide-react'

const MODULE_COLORS = {
    symptom: '#ef4444', firstaid: '#f97316', medicine: '#8b5cf6',
    wellness: '#10b981', mentalhealth: '#06b6d4', nutrition: '#22c55e',
    chat: '#3b82f6', druginteraction: '#eab308',
}

const MODULE_LABELS = {
    symptom: 'Symptoms', firstaid: 'First Aid', medicine: 'Medicine',
    wellness: 'Wellness', mentalhealth: 'Mental Health', nutrition: 'Nutrition',
    chat: 'Chatbot', druginteraction: 'Drug Check',
}

export default function Analytics() {
    const { isAuthenticated, authFetch } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        fetchData()
    }, [isAuthenticated])

    const fetchData = async () => {
        try {
            const res = await authFetch('/api/analytics/overview')
            if (res.ok) {
                const d = await res.json()
                setData(d)
            }
        } catch (err) {
            console.error('Analytics fetch error:', err)
        }
        setLoading(false)
    }

    if (loading) return <div className="analytics-page"><div className="loading-spinner">Loading analytics...</div></div>

    const maxModuleCount = data?.moduleUsage?.length ? Math.max(...data.moduleUsage.map(m => m.count)) : 1
    const maxDailyCount = data?.dailyActivity?.length ? Math.max(...data.dailyActivity.map(d => d.count)) : 1

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <BarChart3 size={28} />
                <div>
                    <h1>Health Analytics Dashboard</h1>
                    <p>Track your health journey and interaction patterns</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="analytics-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}><Activity size={22} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{data?.totalQueries || 0}</span>
                        <span className="stat-label">Total Queries</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><Brain size={22} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{MODULE_LABELS[data?.favoriteModule] || 'None'}</span>
                        <span className="stat-label">Most Used Module</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}><TrendingUp size={22} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{data?.moduleUsage?.length || 0}</span>
                        <span className="stat-label">Active Modules</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}><Heart size={22} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{data?.recentMetrics?.length || 0}</span>
                        <span className="stat-label">Health Readings</span>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Module Usage Chart */}
                <div className="analytics-card">
                    <h3><BarChart3 size={18} /> Module Usage Breakdown</h3>
                    {data?.moduleUsage?.length ? (
                        <div className="bar-chart">
                            {data.moduleUsage.map(m => (
                                <div key={m.module} className="bar-row">
                                    <span className="bar-label">{MODULE_LABELS[m.module] || m.module}</span>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{
                                            width: `${(m.count / maxModuleCount) * 100}%`,
                                            background: MODULE_COLORS[m.module] || '#6b7280',
                                        }}></div>
                                    </div>
                                    <span className="bar-count">{m.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <Activity size={40} />
                            <p>No data yet. Start using MediGuide modules to see your usage patterns!</p>
                        </div>
                    )}
                </div>

                {/* Daily Activity */}
                <div className="analytics-card">
                    <h3><Calendar size={18} /> Daily Activity (Last 30 Days)</h3>
                    {data?.dailyActivity?.length ? (
                        <div className="activity-grid">
                            {data.dailyActivity.slice(0, 14).map(d => (
                                <div key={d.day} className="activity-day">
                                    <div className="activity-bar-wrap">
                                        <div className="activity-bar" style={{
                                            height: `${(d.count / maxDailyCount) * 100}%`,
                                        }}></div>
                                    </div>
                                    <span className="activity-date">{new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <Calendar size={40} />
                            <p>No activity data yet. Your daily usage will appear here.</p>
                        </div>
                    )}
                </div>

                {/* Symptom Stats */}
                <div className="analytics-card full-width">
                    <h3><TrendingUp size={18} /> Symptom Analysis Trends</h3>
                    {data?.symptomStats?.length ? (
                        <div className="symptom-stats-grid">
                            {data.symptomStats.map(s => (
                                <div key={s.module} className="symptom-stat-item">
                                    <div className="sstat-header">
                                        <span>{MODULE_LABELS[s.module] || s.module}</span>
                                        <ArrowUpRight size={14} />
                                    </div>
                                    <div className="sstat-value">{s.count} queries</div>
                                    <div className="sstat-sub">Avg severity: {s.avg_severity?.toFixed(1) || 'N/A'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <TrendingUp size={40} />
                            <p>No symptom logs yet. Your health trends will be visualized here over time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
