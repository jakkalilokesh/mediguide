import { useState } from 'react'
import { Brain, Send, Heart } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import TypingIndicator from '../components/TypingIndicator'

const moodOptions = [
    { emoji: '😊', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😔', label: 'Down', value: 'down' },
    { emoji: '😰', label: 'Anxious', value: 'anxious' },
    { emoji: '😤', label: 'Stressed', value: 'stressed' },
    { emoji: '😴', label: 'Exhausted', value: 'exhausted' },
]

const quickTopics = [
    'How to manage anxiety naturally',
    'Coping with work stress',
    'Improving self-esteem',
    'Dealing with loneliness',
    'Mindfulness meditation guide',
    'Overcoming procrastination',
    'Building healthy boundaries',
    'Managing anger effectively',
]

export default function MentalHealth({ sendMessage }) {
    const [message, setMessage] = useState('')
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedMood, setSelectedMood] = useState(null)

    const handleSend = async (text) => {
        const msg = text || message
        if (!msg.trim()) return

        const fullMsg = selectedMood
            ? `I'm feeling ${selectedMood}. ${msg}`
            : msg

        setLoading(true)
        setMessage('')

        const result = await sendMessage('mentalhealth', fullMsg)
        setLoading(false)

        if (result?.response) {
            setConversations(prev => [...prev, { question: msg, answer: result.response }])
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Brain size={26} color="#8B5CF6" />
                    Mental Health Support
                </h1>
                <p>Get compassionate guidance on stress, anxiety, mood, and emotional wellbeing.</p>
            </div>

            {/* Mood Check-in */}
            {conversations.length === 0 && (
                <>
                    <div style={{ marginBottom: 22 }}>
                        <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-sec)', marginBottom: 10 }}>
                            How are you feeling today?
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {moodOptions.map(mood => (
                                <button
                                    key={mood.value}
                                    onClick={() => setSelectedMood(mood.value)}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: 'var(--r-md)',
                                        border: `1px solid ${selectedMood === mood.value ? 'var(--primary)' : 'var(--border)'}`,
                                        background: selectedMood === mood.value ? 'rgba(46,125,50,.08)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4,
                                        transition: 'all .2s',
                                        fontFamily: 'var(--font)',
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{mood.emoji}</span>
                                    <span style={{ fontSize: '.72rem', fontWeight: 500, color: selectedMood === mood.value ? 'var(--primary)' : 'var(--text-sec)' }}>
                                        {mood.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                            Or explore a topic:
                        </p>
                        <div className="quick-actions">
                            {quickTopics.map(t => (
                                <button key={t} className="quick-action-btn" onClick={() => handleSend(t)}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Conversations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 22 }}>
                {conversations.map((conv, i) => (
                    <div key={i} style={{ animation: 'pageIn .4s ease' }}>
                        <div style={{ marginBottom: 12, paddingLeft: 14, borderLeft: '2px solid #8B5CF6' }}>
                            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                You shared
                            </p>
                            <p style={{ fontSize: '.88rem' }}>{conv.question}</p>
                        </div>
                        <ResponseCard data={conv.answer} />
                    </div>
                ))}
            </div>

            {loading && <TypingIndicator message="Preparing supportive guidance…" />}

            {/* Input */}
            <div style={{ position: 'sticky', bottom: 16, background: 'var(--bg)', backdropFilter: 'blur(12px)', padding: '14px 0' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        className="input-field"
                        placeholder="Share what's on your mind..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading || !message.trim()}>
                        <Send size={15} />
                    </button>
                </div>

                {/* Safety line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Heart size={12} color="var(--alert)" />
                    <p style={{ fontSize: '.68rem', color: 'var(--text-dim)' }}>
                        In crisis? Call 988 (US) or 9152987821 (India iCall). You are not alone.
                    </p>
                </div>
            </div>
        </div>
    )
}
