import { useState } from 'react'
import { Pill, Send, Search } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import TypingIndicator from '../components/TypingIndicator'

const quickMeds = [
    'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Cetirizine',
    'Omeprazole', 'Metformin', 'Aspirin', 'Vitamin D',
]

export default function MedicineInfo({ sendMessage }) {
    const [query, setQuery] = useState('')
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)

    const handleSend = async (text) => {
        const msg = text || query
        if (!msg.trim()) return

        setLoading(true)
        setQuery('')
        const result = await sendMessage('medicine', msg)
        setLoading(false)

        if (result?.response) {
            setConversations(prev => [...prev, { question: msg, answer: result.response }])
        }
    }

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Pill size={26} color="#7C3AED" />
                    Medicine Information
                </h1>
                <p>Search for a medication to learn about its uses, precautions, and general information.</p>
            </div>

            {/* Quick meds */}
            {conversations.length === 0 && (
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                        Common medications:
                    </p>
                    <div className="quick-actions">
                        {quickMeds.map(m => (
                            <button key={m} className="quick-action-btn" onClick={() => handleSend(m)}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 22 }}>
                {conversations.map((conv, i) => (
                    <div key={i} style={{ animation: 'pageIn .4s ease' }}>
                        <div style={{ marginBottom: 12, paddingLeft: 14, borderLeft: '2px solid #7C3AED' }}>
                            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                Medicine Query
                            </p>
                            <p style={{ fontSize: '.88rem' }}>{conv.question}</p>
                        </div>
                        <ResponseCard data={conv.answer} />
                    </div>
                ))}
            </div>

            {loading && <TypingIndicator message="Looking up medicine information…" />}

            {/* Input */}
            <div style={{ position: 'sticky', bottom: 16, background: 'var(--bg)', backdropFilter: 'blur(12px)', padding: '14px 0' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        className="input-field"
                        placeholder="Search for a medication..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading || !query.trim()}>
                        <Search size={15} />
                    </button>
                </div>
                <p style={{ fontSize: '.68rem', color: 'var(--text-dim)', marginTop: 6 }}>
                    💊 General information only. Always consult your doctor or pharmacist before taking any medication.
                </p>
            </div>
        </div>
    )
}
