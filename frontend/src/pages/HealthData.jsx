import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Activity, Heart, Footprints, Moon, Droplets, Thermometer, Wind, Zap, Plus, Trash2, TrendingUp, Download } from 'lucide-react'

const METRIC_CONFIG = {
    heart_rate: { label: 'Heart Rate', icon: Heart, unit: 'bpm', color: '#ef4444', min: 40, max: 200 },
    blood_pressure_sys: { label: 'Blood Pressure (Sys)', icon: Activity, unit: 'mmHg', color: '#f97316', min: 80, max: 200 },
    blood_pressure_dia: { label: 'Blood Pressure (Dia)', icon: Activity, unit: 'mmHg', color: '#f59e0b', min: 40, max: 130 },
    weight: { label: 'Weight', icon: TrendingUp, unit: 'kg', color: '#8b5cf6', min: 20, max: 300 },
    steps: { label: 'Steps', icon: Footprints, unit: 'steps', color: '#10b981', min: 0, max: 50000 },
    sleep_hours: { label: 'Sleep', icon: Moon, unit: 'hours', color: '#6366f1', min: 0, max: 24 },
    water_intake: { label: 'Water Intake', icon: Droplets, unit: 'ml', color: '#06b6d4', min: 0, max: 10000 },
    calories: { label: 'Calories', icon: Zap, unit: 'kcal', color: '#f97316', min: 0, max: 10000 },
    temperature: { label: 'Temperature', icon: Thermometer, unit: '°C', color: '#ef4444', min: 35, max: 42 },
    oxygen_saturation: { label: 'O₂ Saturation', icon: Wind, unit: '%', color: '#3b82f6', min: 70, max: 100 },
}

export default function HealthData() {
    const { isAuthenticated, authFetch } = useAuth()
    const navigate = useNavigate()
    const [metrics, setMetrics] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ metric_type: 'heart_rate', value: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        fetchMetrics()
    }, [isAuthenticated])

    const fetchMetrics = async () => {
        try {
            const res = await authFetch('/api/health-data')
            if (res.ok) {
                const data = await res.json()
                setMetrics(data.metrics)
            }
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await authFetch('/api/health-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (res.ok) {
                setShowForm(false)
                setForm({ metric_type: 'heart_rate', value: '', notes: '' })
                fetchMetrics()
            }
        } catch (err) { console.error(err) }
        setSaving(false)
    }

    const handleExportCSV = async () => {
        setExporting(true)
        try {
            const res = await authFetch('/api/health-data/export/csv')
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `mediguide-health-data-${new Date().toISOString().slice(0, 10)}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            } else {
                alert('Failed to export data')
            }
        } catch (err) {
            console.error(err)
            alert('Error exporting data')
        }
        setExporting(false)
    }

    const handleDelete = async (id) => {
        try {
            await authFetch(`/api/health-data/${id}`, { method: 'DELETE' })
            setMetrics(metrics.filter(m => m.id !== id))
        } catch (err) { console.error(err) }
    }

    // Group metrics by type for summary cards
    const grouped = {}
    metrics.forEach(m => {
        if (!grouped[m.metric_type]) grouped[m.metric_type] = []
        grouped[m.metric_type].push(m)
    })

    if (loading) return <div className="health-data-page"><div className="loading-spinner">Loading health data...</div></div>

    return (
        <div className="health-data-page">
            <div className="hd-header">
                <Activity size={28} />
                <div>
                    <h1>Health Data Tracker</h1>
                    <p>Track your vitals, activity, and health metrics</p>
                </div>
                <div className="hd-header-actions">
                    <button className="hd-export-btn" onClick={handleExportCSV} disabled={exporting || metrics.length === 0}>
                        <Download size={18} /> {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button className="hd-add-btn" onClick={() => setShowForm(!showForm)}>
                        <Plus size={18} /> Add Reading
                    </button>
                </div>
            </div>

            {/* Add Metric Form */}
            {showForm && (
                <div className="hd-form-card">
                    <form onSubmit={handleAdd}>
                        <div className="hd-form-grid">
                            <div className="hd-form-field">
                                <label>Metric Type</label>
                                <select value={form.metric_type} onChange={e => setForm({ ...form, metric_type: e.target.value })}>
                                    {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="hd-form-field">
                                <label>Value ({METRIC_CONFIG[form.metric_type]?.unit})</label>
                                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                                    min={METRIC_CONFIG[form.metric_type]?.min} max={METRIC_CONFIG[form.metric_type]?.max}
                                    required step="any" placeholder={`e.g. ${METRIC_CONFIG[form.metric_type]?.min}`} />
                            </div>
                            <div className="hd-form-field">
                                <label>Notes (optional)</label>
                                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                    placeholder="After exercise, morning reading..." />
                            </div>
                        </div>
                        <div className="hd-form-actions">
                            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Reading'}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="hd-summary-grid">
                {Object.entries(grouped).map(([type, vals]) => {
                    const cfg = METRIC_CONFIG[type] || {}
                    const latest = vals[0]
                    const Icon = cfg.icon || Activity
                    return (
                        <div key={type} className="hd-summary-card" style={{ '--accent': cfg.color }}>
                            <div className="hd-sc-icon"><Icon size={22} /></div>
                            <div className="hd-sc-info">
                                <span className="hd-sc-label">{cfg.label || type}</span>
                                <span className="hd-sc-value">{latest.value} <small>{cfg.unit}</small></span>
                                <span className="hd-sc-time">{new Date(latest.recorded_at).toLocaleDateString()}</span>
                            </div>
                            <span className="hd-sc-count">{vals.length} readings</span>
                        </div>
                    )
                })}
            </div>

            {/* All Readings */}
            {metrics.length > 0 ? (
                <div className="hd-readings">
                    <h3>Recent Readings</h3>
                    <div className="hd-readings-list">
                        {metrics.slice(0, 30).map(m => {
                            const cfg = METRIC_CONFIG[m.metric_type] || {}
                            return (
                                <div key={m.id} className="hd-reading-item">
                                    <div className="hd-ri-dot" style={{ background: cfg.color }}></div>
                                    <div className="hd-ri-info">
                                        <span className="hd-ri-type">{cfg.label || m.metric_type}</span>
                                        <span className="hd-ri-time">{new Date(m.recorded_at).toLocaleString()}</span>
                                    </div>
                                    <span className="hd-ri-value">{m.value} {cfg.unit}</span>
                                    {m.notes && <span className="hd-ri-notes">{m.notes}</span>}
                                    <button className="hd-ri-delete" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="hd-empty">
                    <Activity size={48} />
                    <h3>No health data yet</h3>
                    <p>Start tracking your vitals by clicking "Add Reading" above!</p>
                </div>
            )}
        </div>
    )
}
