import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Heart, Shield, Pill, Droplets, Save, Plus, X, AlertCircle } from 'lucide-react'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function Profile() {
    const { user, updateProfile, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', age: '', gender: '', blood_type: '',
        allergies: [], conditions: [], medications: [],
    })
    const [newAllergy, setNewAllergy] = useState('')
    const [newCondition, setNewCondition] = useState('')
    const [newMed, setNewMed] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        if (user) {
            setForm({
                name: user.name || '', age: user.age || '', gender: user.gender || '',
                blood_type: user.blood_type || '',
                allergies: user.allergies || [], conditions: user.conditions || [], medications: user.medications || [],
            })
        }
    }, [user, isAuthenticated])

    const addItem = (field, value, setter) => {
        if (value.trim() && !form[field].includes(value.trim())) {
            setForm({ ...form, [field]: [...form[field], value.trim()] })
            setter('')
        }
    }

    const removeItem = (field, idx) => {
        setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) })
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage('')
        try {
            await updateProfile(form)
            setMessage('Profile saved successfully! ✅')
        } catch (err) {
            setMessage(err.message)
        }
        setSaving(false)
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <User size={40} />
                </div>
                <div>
                    <h1>Health Profile</h1>
                    <p>{user?.email}</p>
                </div>
            </div>

            {message && <div className={`profile-msg ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

            <div className="profile-grid">
                <div className="profile-section">
                    <h3><User size={18} /> Personal Information</h3>
                    <div className="profile-form">
                        <div className="pf-field">
                            <label>Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="pf-row">
                            <div className="pf-field">
                                <label>Age</label>
                                <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} min="0" max="150" />
                            </div>
                            <div className="pf-field">
                                <label>Gender</label>
                                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    <option value="">Select...</option>
                                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="pf-field">
                            <label>Blood Type</label>
                            <select value={form.blood_type} onChange={e => setForm({ ...form, blood_type: e.target.value })}>
                                <option value="">Select...</option>
                                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h3><AlertCircle size={18} /> Allergies</h3>
                    <div className="pf-tags">
                        {form.allergies.map((a, i) => (
                            <span key={i} className="pf-tag">{a} <X size={14} onClick={() => removeItem('allergies', i)} /></span>
                        ))}
                    </div>
                    <div className="pf-add-row">
                        <input placeholder="Add allergy..." value={newAllergy} onChange={e => setNewAllergy(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addItem('allergies', newAllergy, setNewAllergy)} />
                        <button onClick={() => addItem('allergies', newAllergy, setNewAllergy)}><Plus size={16} /></button>
                    </div>
                </div>

                <div className="profile-section">
                    <h3><Heart size={18} /> Chronic Conditions</h3>
                    <div className="pf-tags">
                        {form.conditions.map((c, i) => (
                            <span key={i} className="pf-tag condition">{c} <X size={14} onClick={() => removeItem('conditions', i)} /></span>
                        ))}
                    </div>
                    <div className="pf-add-row">
                        <input placeholder="Add condition..." value={newCondition} onChange={e => setNewCondition(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addItem('conditions', newCondition, setNewCondition)} />
                        <button onClick={() => addItem('conditions', newCondition, setNewCondition)}><Plus size={16} /></button>
                    </div>
                </div>

                <div className="profile-section">
                    <h3><Pill size={18} /> Current Medications</h3>
                    <div className="pf-tags">
                        {form.medications.map((m, i) => (
                            <span key={i} className="pf-tag med">{m} <X size={14} onClick={() => removeItem('medications', i)} /></span>
                        ))}
                    </div>
                    <div className="pf-add-row">
                        <input placeholder="Add medication..." value={newMed} onChange={e => setNewMed(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addItem('medications', newMed, setNewMed)} />
                        <button onClick={() => addItem('medications', newMed, setNewMed)}><Plus size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="profile-actions">
                <button className="save-profile-btn" onClick={handleSave} disabled={saving}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <button className="logout-btn" onClick={() => { logout(); navigate('/') }}>
                    Logout
                </button>
            </div>
        </div>
    )
}
