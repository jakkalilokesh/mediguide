import { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Wind } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import TypingIndicator from '../components/TypingIndicator'

const quickTopics = [
    'How to improve sleep quality',
    'Best exercises for beginners',
    'Stress relief techniques',
    'Benefits of drinking water',
    'How to boost immunity naturally',
    'Morning routine for energy',
    'Posture tips for desk workers',
    'Healthy habits to start today',
]

/* ── Breathing Pacer Component ── */
function BreathingPacer() {
    const phases = [
        { label: 'Breathe In', duration: 4, color: '#059669' },
        { label: 'Hold', duration: 7, color: '#3B82F6' },
        { label: 'Breathe Out', duration: 8, color: '#8B5CF6' },
    ]
    const [active, setActive] = useState(false)
    const [phaseIdx, setPhaseIdx] = useState(0)
    const [count, setCount] = useState(phases[0].duration)
    const [cycles, setCycles] = useState(0)
    const intervalRef = useRef(null)

    useEffect(() => {
        if (!active) return
        intervalRef.current = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    setPhaseIdx(pi => {
                        const next = (pi + 1) % phases.length
                        if (next === 0) setCycles(c => c + 1)
                        setCount(phases[next].duration)
                        return next
                    })
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(intervalRef.current)
    }, [active])

    const toggle = () => {
        if (active) {
            clearInterval(intervalRef.current)
            setActive(false)
            setPhaseIdx(0)
            setCount(phases[0].duration)
        } else {
            setActive(true)
            setPhaseIdx(0)
            setCount(phases[0].duration)
            setCycles(0)
        }
    }

    const phase = phases[phaseIdx]
    const progress = active ? ((phase.duration - count) / phase.duration) * 100 : 0

    return (
        <div className="breathing-pacer surface" style={{ marginBottom: 24 }}>
            <div className="breathing-header">
                <Wind size={20} color="var(--primary)" />
                <h3>4-7-8 Breathing Exercise</h3>
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--text-sec)', marginBottom: 16 }}>
                Calms your nervous system. Reduces anxiety and helps with sleep.
            </p>

            <div className="breathing-visual">
                <div
                    className={`breathing-circle ${active ? 'active' : ''}`}
                    style={{
                        '--phase-color': phase.color,
                        transform: active ? `scale(${phaseIdx === 0 ? 1.3 : phaseIdx === 2 ? 0.8 : 1.1})` : 'scale(1)',
                    }}
                >
                    <span className="breathing-count">{active ? count : '—'}</span>
                    <span className="breathing-label">{active ? phase.label : 'Ready'}</span>
                </div>
            </div>

            {active && (
                <div className="breathing-progress-bar">
                    <div className="breathing-progress-fill" style={{ width: `${progress}%`, background: phase.color }} />
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                <button className={`btn ${active ? 'btn-secondary' : 'btn-primary'}`} onClick={toggle}>
                    {active ? 'Stop' : 'Start Breathing'}
                </button>
                {cycles > 0 && (
                    <span style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>
                        {cycles} cycle{cycles !== 1 ? 's' : ''} completed
                    </span>
                )}
            </div>
        </div>
    )
}

export default function Wellness({ sendMessage }) {
    const [message, setMessage] = useState('')
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)

    const handleSend = async (text) => {
        const msg = text || message
        if (!msg.trim()) return

        setLoading(true)
        setMessage('')
        const result = await sendMessage('wellness', msg)
        setLoading(false)

        if (result?.response) {
            setConversations(prev => [...prev, { question: msg, answer: result.response }])
        }
    }

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Sparkles size={26} color="#059669" />
                    Wellness Tips
                </h1>
                <p>Get evidence-based advice on nutrition, exercise, sleep, and healthy living.</p>
            </div>

            {/* Breathing Pacer */}
            <BreathingPacer />

            {/* Quick topics */}
            {conversations.length === 0 && (
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                        Popular wellness topics:
                    </p>
                    <div className="quick-actions">
                        {quickTopics.map(t => (
                            <button key={t} className="quick-action-btn" onClick={() => handleSend(t)}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 22 }}>
                {conversations.map((conv, i) => (
                    <div key={i} style={{ animation: 'pageIn .4s ease' }}>
                        <div style={{ marginBottom: 12, paddingLeft: 14, borderLeft: '2px solid #059669' }}>
                            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                Your Question
                            </p>
                            <p style={{ fontSize: '.88rem' }}>{conv.question}</p>
                        </div>
                        <ResponseCard data={conv.answer} />
                    </div>
                ))}
            </div>

            {loading && <TypingIndicator message="Preparing wellness guidance…" />}

            {/* Input */}
            <div style={{ position: 'sticky', bottom: 16, background: 'var(--bg)', backdropFilter: 'blur(12px)', padding: '14px 0' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        className="input-field"
                        placeholder="Ask about health, fitness, sleep, stress..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading || !message.trim()}>
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}
