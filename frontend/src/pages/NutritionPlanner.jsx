import { useState } from 'react'
import { Apple, Send, Utensils } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import TypingIndicator from '../components/TypingIndicator'

const dietGoals = [
    'Weight management',
    'Muscle building',
    'Heart health',
    'Better digestion',
    'More energy',
    'Improved immunity',
]

const quickTopics = [
    'Balanced breakfast ideas',
    'High protein vegetarian meals',
    'Foods that boost immunity',
    'Anti-inflammatory diet guide',
    'Healthy snacks for work',
    'Hydration tips and benefits',
    'Foods rich in iron',
    'Meal prep for beginners',
]

export default function NutritionPlanner({ sendMessage }) {
    const [message, setMessage] = useState('')
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState(null)

    const handleSend = async (text) => {
        const msg = text || message
        if (!msg.trim()) return

        const fullMsg = selectedGoal
            ? `My diet goal is ${selectedGoal}. ${msg}`
            : msg

        setLoading(true)
        setMessage('')

        const result = await sendMessage('nutrition', fullMsg)
        setLoading(false)

        if (result?.response) {
            setConversations(prev => [...prev, { question: msg, answer: result.response }])
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Apple size={26} color="#059669" />
                    Nutrition Planner
                </h1>
                <p>Get personalized nutrition guidance, meal suggestions, and dietary information.</p>
            </div>

            {/* Goal selector */}
            {conversations.length === 0 && (
                <>
                    <div style={{ marginBottom: 22 }}>
                        <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-sec)', marginBottom: 10 }}>
                            What's your nutrition goal?
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {dietGoals.map(goal => (
                                <button
                                    key={goal}
                                    className="quick-action-btn"
                                    onClick={() => setSelectedGoal(goal)}
                                    style={{
                                        borderColor: selectedGoal === goal ? 'var(--primary)' : undefined,
                                        color: selectedGoal === goal ? 'var(--primary)' : undefined,
                                        background: selectedGoal === goal ? 'rgba(46,125,50,.06)' : undefined,
                                    }}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                            Popular nutrition topics:
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

            {loading && <TypingIndicator message="Preparing nutrition guidance…" />}

            {/* Input */}
            <div style={{ position: 'sticky', bottom: 16, background: 'var(--bg)', backdropFilter: 'blur(12px)', padding: '14px 0' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        className="input-field"
                        placeholder="Ask about nutrition, meals, or dietary guidance..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading || !message.trim()}>
                        <Send size={15} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Utensils size={12} color="var(--text-dim)" />
                    <p style={{ fontSize: '.68rem', color: 'var(--text-dim)' }}>
                        General guidance only. Consult a registered dietitian for personalized meal plans.
                    </p>
                </div>
            </div>
        </div>
    )
}
