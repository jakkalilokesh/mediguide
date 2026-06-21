import { useState } from 'react'
import { ShieldPlus, Send } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import TypingIndicator from '../components/TypingIndicator'

const topics = [
    { emoji: '🔥', label: 'Burns', query: 'First aid for burns' },
    { emoji: '🩸', label: 'Bleeding', query: 'First aid for heavy bleeding' },
    { emoji: '💔', label: 'Heart Attack', query: 'First aid for heart attack' },
    { emoji: '🫁', label: 'Choking', query: 'First aid for choking' },
    { emoji: '🦴', label: 'Fracture', query: 'First aid for broken bone' },
    { emoji: '⚡', label: 'Electric Shock', query: 'First aid for electric shock' },
    { emoji: '🐍', label: 'Snake Bite', query: 'First aid for snake bite' },
    { emoji: '🥵', label: 'Heat Stroke', query: 'First aid for heat stroke' },
    { emoji: '🏊', label: 'Drowning', query: 'First aid for near drowning' },
    { emoji: '🤕', label: 'Head Injury', query: 'First aid for head injury' },
    { emoji: '😵', label: 'Seizure', query: 'First aid for seizure' },
    { emoji: '🫣', label: 'Eye Injury', query: 'First aid for eye injury' },
]

export default function FirstAid({ sendMessage }) {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)
    const [customQuery, setCustomQuery] = useState('')

    const handleSend = async (query) => {
        const msg = query || customQuery
        if (!msg.trim()) return

        setLoading(true)
        setCustomQuery('')
        const result = await sendMessage('firstaid', msg)
        setLoading(false)

        if (result?.response) {
            setConversations(prev => [...prev, { question: msg, answer: result.response }])
        }
    }

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldPlus size={26} color="#D97706" />
                    First Aid Guide
                </h1>
                <p>Select a scenario or describe your situation for step-by-step first aid instructions.</p>
            </div>

            {/* Topics Grid */}
            {conversations.length === 0 && (
                <div className="firstaid-grid" style={{ marginBottom: 20 }}>
                    {topics.map((t, i) => (
                        <div key={i} className="firstaid-card" onClick={() => handleSend(t.query)}>
                            <div className="firstaid-card-icon">{t.emoji}</div>
                            <h3>{t.label}</h3>
                            <p>Tap for guidance</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Conversations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 22 }}>
                {conversations.map((conv, i) => (
                    <div key={i} style={{ animation: 'pageIn .4s ease' }}>
                        <div style={{ marginBottom: 12, paddingLeft: 14, borderLeft: '2px solid #D97706' }}>
                            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                First Aid Query
                            </p>
                            <p style={{ fontSize: '.88rem' }}>{conv.question}</p>
                        </div>
                        <ResponseCard data={conv.answer} />
                    </div>
                ))}
            </div>

            {loading && <TypingIndicator message="Preparing first aid instructions…" />}

            {/* Input */}
            <div style={{ position: 'sticky', bottom: 16, background: 'var(--bg)', backdropFilter: 'blur(12px)', padding: '14px 0' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        className="input-field"
                        placeholder="Describe the emergency situation..."
                        value={customQuery}
                        onChange={e => setCustomQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading || !customQuery.trim()}>
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}
