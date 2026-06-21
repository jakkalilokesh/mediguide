import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Phone, Plus, Trash2, Shield, User, Star, MapPin, AlertTriangle } from 'lucide-react'

export default function EmergencySetup() {
    const { isAuthenticated, authFetch } = useAuth()
    const navigate = useNavigate()
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', phone: '', relationship: '', is_primary: false })

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        fetchContacts()
    }, [isAuthenticated])

    const fetchContacts = async () => {
        try {
            const res = await authFetch('/api/emergency')
            if (res.ok) {
                const data = await res.json()
                setContacts(data.contacts)
            }
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            const res = await authFetch('/api/emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (res.ok) {
                setShowForm(false)
                setForm({ name: '', phone: '', relationship: '', is_primary: false })
                fetchContacts()
            }
        } catch (err) { console.error(err) }
    }

    const handleDelete = async (id) => {
        try {
            await authFetch(`/api/emergency/${id}`, { method: 'DELETE' })
            setContacts(contacts.filter(c => c.id !== id))
        } catch (err) { console.error(err) }
    }

    if (loading) return <div className="emergency-page"><div className="loading-spinner">Loading...</div></div>

    return (
        <div className="emergency-page">
            <div className="emg-header">
                <Shield size={28} />
                <div>
                    <h1>Emergency Setup</h1>
                    <p>Configure your emergency contacts and SOS settings</p>
                </div>
            </div>

            {/* Emergency Info Card */}
            <div className="emg-info-card">
                <AlertTriangle size={24} />
                <div>
                    <h3>How Emergency SOS Works</h3>
                    <ul>
                        <li>Tap the red SOS button (bottom-left corner of any page)</li>
                        <li>Your current GPS location is captured</li>
                        <li>Emergency contacts are notified (shown to you to call/share)</li>
                        <li>Local emergency numbers are displayed</li>
                    </ul>
                </div>
            </div>

            {/* Contact List */}
            <div className="emg-contacts">
                <div className="emg-contacts-header">
                    <h3>Emergency Contacts ({contacts.length})</h3>
                    <button className="emg-add-btn" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} /> Add Contact
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleAdd} className="emg-form">
                        <div className="emg-form-grid">
                            <input type="text" placeholder="Contact Name" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                            <input type="tel" placeholder="Phone Number" value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            <input type="text" placeholder="Relationship (e.g., Mother)" value={form.relationship}
                                onChange={e => setForm({ ...form, relationship: e.target.value })} />
                            <label className="emg-checkbox">
                                <input type="checkbox" checked={form.is_primary}
                                    onChange={e => setForm({ ...form, is_primary: e.target.checked })} />
                                <Star size={14} /> Primary Contact
                            </label>
                        </div>
                        <div className="emg-form-actions">
                            <button type="submit">Save Contact</button>
                            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                )}

                {contacts.length > 0 ? (
                    <div className="emg-contact-list">
                        {contacts.map(c => (
                            <div key={c.id} className={`emg-contact-card ${c.is_primary ? 'primary' : ''}`}>
                                <div className="emg-cc-avatar">
                                    <User size={20} />
                                    {c.is_primary ? <Star size={12} className="star-badge" /> : null}
                                </div>
                                <div className="emg-cc-info">
                                    <span className="emg-cc-name">{c.name}</span>
                                    <span className="emg-cc-phone"><Phone size={12} /> {c.phone}</span>
                                    {c.relationship && <span className="emg-cc-rel">{c.relationship}</span>}
                                </div>
                                <div className="emg-cc-actions">
                                    <a href={`tel:${c.phone}`} className="emg-call-btn"><Phone size={14} /></a>
                                    <button className="emg-del-btn" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="emg-empty">
                        <Phone size={40} />
                        <p>No emergency contacts added yet.</p>
                    </div>
                )}
            </div>

            {/* Emergency Numbers */}
            <div className="emg-numbers">
                <h3><MapPin size={18} /> Emergency Numbers (India)</h3>
                <div className="emg-num-grid">
                    <a href="tel:112" className="emg-num-card"><span>🚨</span><strong>112</strong><small>All Emergencies</small></a>
                    <a href="tel:102" className="emg-num-card"><span>🚑</span><strong>102</strong><small>Ambulance</small></a>
                    <a href="tel:100" className="emg-num-card"><span>👮</span><strong>100</strong><small>Police</small></a>
                    <a href="tel:108" className="emg-num-card"><span>🏥</span><strong>108</strong><small>Emergency Medical</small></a>
                </div>
            </div>
        </div>
    )
}
