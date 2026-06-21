import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Mail, Lock, User, ArrowRight, Heart } from 'lucide-react'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            await register(form.email, form.password, form.name)
            navigate('/profile')
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Heart size={28} />
                    </div>
                    <h1>Create Account</h1>
                    <p>Start your personalized health journey</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <User size={18} className="auth-field-icon" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <Mail size={18} className="auth-field-icon" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <Lock size={18} className="auth-field-icon" />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="auth-field">
                        <Lock size={18} className="auth-field-icon" />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Log In</Link></p>
                </div>
            </div>
        </div>
    )
}
