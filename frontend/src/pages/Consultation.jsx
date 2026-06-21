import { useState, useRef, useEffect } from 'react'
import { UserRound, Send, ChevronLeft, Stethoscope, Eye, Brain as BrainIcon, Apple, Heart } from 'lucide-react'
import TypingIndicator from '../components/TypingIndicator'

// Simple markdown bold renderer: **text** → <strong>text</strong>
function renderBold(text) {
    if (!text) return text
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)
}

const specialists = [
    {
        id: 'general',
        name: 'General Physician',
        icon: Stethoscope,
        color: '#059669',
        bg: 'rgba(5,150,105,.1)',
        greeting: "Hello! I'm your AI General Physician. How can I help you today?",
        systemPrompt: 'You are an experienced General Physician AI assistant. Provide thorough, empathetic consultations covering common illnesses, preventive care, and general health concerns. Ask follow-up questions when needed to understand the patient better.',
    },
    {
        id: 'dermatologist',
        name: 'Dermatologist',
        icon: Eye,
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,.1)',
        greeting: "Hi there! I'm your AI Dermatologist. Describe your skin concern and I'll guide you.",
        systemPrompt: 'You are an experienced Dermatologist AI assistant. Help patients with skin, hair, and nail concerns. Ask about duration, location, appearance, and triggers. Provide skincare routines and when to seek in-person care.',
    },
    {
        id: 'nutritionist',
        name: 'Nutritionist',
        icon: Apple,
        color: '#F59E0B',
        bg: 'rgba(245,158,11,.1)',
        greeting: "Welcome! I'm your AI Nutritionist. Let's discuss your diet and nutrition goals.",
        systemPrompt: 'You are an experienced Nutritionist AI assistant. Help patients with diet planning, nutritional deficiencies, weight management, and healthy eating. Ask about dietary preferences, allergies, and health goals.',
    },
    {
        id: 'mental_health',
        name: 'Mental Health',
        icon: BrainIcon,
        color: '#EC4899',
        bg: 'rgba(236,72,153,.1)',
        greeting: "Hello, I'm here to listen. You're in a safe space. What's on your mind?",
        systemPrompt: 'You are a compassionate Mental Health AI counselor. Help patients discuss stress, anxiety, mood issues, and emotional well-being. Use empathetic, non-judgmental language. Suggest coping techniques and always recommend professional help for serious concerns.',
    },
    {
        id: 'cardiologist',
        name: 'Cardiologist',
        icon: Heart,
        color: '#EF4444',
        bg: 'rgba(239,68,68,.1)',
        greeting: "Hi! I'm your AI Cardiologist. Let's discuss your heart health concerns.",
        systemPrompt: 'You are an experienced Cardiologist AI assistant. Help patients understand cardiovascular symptoms, blood pressure concerns, cholesterol, and heart-healthy lifestyle changes. Always flag emergency cardiac symptoms.',
    },
]

export default function Consultation({ sendMessage }) {
    const [selected, setSelected] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const startConsultation = (spec) => {
        setSelected(spec)
        setMessages([{ role: 'assistant', text: spec.greeting }])
    }

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading) return

        setMessages(prev => [...prev, { role: 'user', text }])
        setInput('')
        setLoading(true)

        const contextPrompt = `[Specialist: ${selected.name}] ${selected.systemPrompt}\n\nPatient: ${text}`
        const result = await sendMessage('consultation', contextPrompt)
        setLoading(false)

        if (result?.response) {
            // Extract readable text from whatever response format comes back
            const r = result.response
            let botText = ''

            if (typeof r === 'string') {
                botText = r
            } else if (r.rawText) {
                botText = r.rawText
            } else if (r.content) {
                botText = r.content
            } else if (r.message) {
                botText = r.message
            } else if (r.generalPurpose && typeof r.generalPurpose === 'string') {
                botText = r.generalPurpose
            } else {
                // Build a readable summary from structured data
                const parts = []
                if (r.validation) parts.push(r.validation)
                if (r.whatToDoNow && Array.isArray(r.whatToDoNow)) parts.push(r.whatToDoNow.join('\n• '))
                if (r.guidance && Array.isArray(r.guidance)) parts.push(r.guidance.join('\n• '))
                if (r.copingStrategies && Array.isArray(r.copingStrategies)) parts.push(r.copingStrategies.join('\n• '))
                if (r.breathingExercise) parts.push(r.breathingExercise)
                if (r.groundingTechnique) parts.push(r.groundingTechnique)
                if (r.whenToSeeDoctor) parts.push(r.whenToSeeDoctor)
                if (r.whenToSeekHelp) parts.push(r.whenToSeekHelp)
                if (r.scienceBehind) parts.push(r.scienceBehind)

                // Fallback: grab any string field longer than 20 chars
                if (parts.length === 0) {
                    Object.entries(r).forEach(([key, val]) => {
                        if (typeof val === 'string' && val.length > 20 && key !== 'safetyNote' && key !== 'importantNote') {
                            parts.push(val)
                        }
                    })
                }

                botText = parts.length > 0
                    ? parts.join('\n\n')
                    : 'I have some guidance for you. Let me know if you need more specific information.'
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: botText,
                suggestions: r.suggestions || r.followUpQuestions || [],
            }])
        }
    }

    const goBack = () => {
        setSelected(null)
        setMessages([])
    }

    // ── Specialist selection screen
    if (!selected) {
        return (
            <div style={{ animation: 'pageIn .4s ease' }}>
                <div className="page-header">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserRound size={26} color="var(--primary)" />
                        AI Virtual Clinic
                    </h1>
                    <p>Select a specialist for a personalized AI consultation experience.</p>
                </div>

                <div className="consultation-grid">
                    {specialists.map(spec => {
                        const Icon = spec.icon
                        return (
                            <button
                                key={spec.id}
                                className="consultation-card"
                                onClick={() => startConsultation(spec)}
                            >
                                <div className="consultation-card-icon" style={{ background: spec.bg, color: spec.color }}>
                                    <Icon size={28} />
                                </div>
                                <h3>{spec.name}</h3>
                                <p>{spec.greeting.substring(0, 60)}…</p>
                            </button>
                        )
                    })}
                </div>

                <div style={{
                    marginTop: 24,
                    padding: '14px 20px',
                    borderLeft: '3px solid var(--primary)',
                    background: 'rgba(5,150,105,.04)',
                    borderRadius: '0 var(--r-sm) var(--r-sm) 0',
                    fontSize: '.8rem',
                    color: 'var(--text-sec)',
                    lineHeight: 1.6,
                }}>
                    🩺 This is an AI simulation for educational purposes. Always consult a real doctor for medical decisions.
                </div>
            </div>
        )
    }

    // ── Active consultation chat
    const SpecIcon = selected.icon
    return (
        <div className="consultation-chat-wrapper" style={{ animation: 'pageIn .4s ease' }}>
            {/* Chat header */}
            <div className="consultation-chat-header">
                <button className="btn btn-secondary btn-sm" onClick={goBack} style={{ gap: 4 }}>
                    <ChevronLeft size={16} /> Back
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="consultation-card-icon" style={{ background: selected.bg, color: selected.color, width: 36, height: 36 }}>
                        <SpecIcon size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>{selected.name}</h3>
                        <span style={{ fontSize: '.72rem', color: 'var(--primary)', fontWeight: 600 }}>● Online</span>
                    </div>
                </div>
            </div>

            {/* Chat messages */}
            <div className="consultation-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`consultation-msg ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div className="consultation-msg-avatar" style={{ background: selected.bg, color: selected.color }}>
                                <SpecIcon size={14} />
                            </div>
                        )}
                        <div className="consultation-msg-bubble">
                            {msg.text.split('\n').map((line, j) => {
                                if (!line.trim()) return <br key={j} />
                                // Render bullet points
                                const bulletMatch = line.match(/^[\s]*[•\-\*]\s*(.*)/)
                                if (bulletMatch) {
                                    return <p key={j} style={{ paddingLeft: 12, margin: '4px 0', lineHeight: 1.7 }}>• {renderBold(bulletMatch[1])}</p>
                                }
                                return <p key={j} style={{ margin: '6px 0', lineHeight: 1.7 }}>{renderBold(line)}</p>
                            })}
                            {msg.suggestions && msg.suggestions.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                                    {msg.suggestions.map((s, si) => (
                                        <button key={si} className="quick-action-btn" onClick={() => { setInput(s) }} style={{ fontSize: '.72rem' }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && <TypingIndicator message={`${selected.name} is thinking…`} />}
                <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="consultation-input-bar">
                <input
                    className="input-field"
                    placeholder={`Describe your concern to the ${selected.name}…`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}
