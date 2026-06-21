import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import VoiceInput from './VoiceInput'

const API_BASE = '/api'

export default function Chatbot({ sendMessage }) {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I\'m MediGuide. Ask me anything about health, symptoms, first aid, nutrition, or wellness. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const [suggestions, setSuggestions] = useState([
        'What helps with headaches?',
        'How to reduce stress?',
        'Tips for better sleep',
    ])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const getSession = async () => {
        if (sessionId) return sessionId
        try {
            const res = await fetch(`${API_BASE}/start`, { method: 'POST' })
            const data = await res.json()
            setSessionId(data.sessionId)
            return data.sessionId
        } catch {
            return null
        }
    }

    const handleSend = async (text) => {
        const msg = text || input
        if (!msg.trim() || loading) return

        setInput('')
        setSuggestions([])
        setMessages(prev => [...prev, { role: 'user', text: msg }])
        setLoading(true)

        const sid = await getSession()
        if (!sid) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Unable to connect to the server. Please make sure the backend is running.' }])
            setLoading(false)
            return
        }

        try {
            // Try /api/chat first, fallback to /api/wellness
            let response = null
            for (const endpoint of ['chat', 'wellness']) {
                try {
                    const res = await fetch(`${API_BASE}/${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId: sid, message: msg }),
                    })
                    if (res.ok) {
                        const data = await res.json()
                        response = data?.response
                        if (response) break
                    }
                } catch {
                    continue
                }
            }

            if (response) {
                // Extract the text from whatever format the response comes in
                let botText = ''
                if (response.message) {
                    botText = response.message
                } else if (response.guidance && Array.isArray(response.guidance)) {
                    botText = response.guidance.join('\n\n')
                } else if (response.whatToDoNow && Array.isArray(response.whatToDoNow)) {
                    botText = response.whatToDoNow.join('\n\n')
                } else if (response.generalPurpose) {
                    botText = response.generalPurpose
                } else if (typeof response === 'string') {
                    botText = response
                } else {
                    // Last resort — extract any text content from the object
                    const texts = Object.entries(response)
                        .filter(([k, v]) => typeof v === 'string' && v.length > 20 && k !== 'safetyNote' && k !== 'importantNote')
                        .map(([, v]) => v)
                    botText = texts.join('\n\n') || 'I have some information for you. Please check the relevant health module for detailed guidance.'
                }

                setMessages(prev => [...prev, { role: 'bot', text: botText }])

                // Extract suggestions
                if (response.suggestions && Array.isArray(response.suggestions)) {
                    setSuggestions(response.suggestions)
                } else if (response.followUpQuestions && Array.isArray(response.followUpQuestions)) {
                    setSuggestions(response.followUpQuestions.slice(0, 3))
                } else if (response.actionSteps && Array.isArray(response.actionSteps)) {
                    setSuggestions(['Tell me more', 'What else can I do?', 'Any other tips?'])
                }
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: 'I couldn\'t get a response. Please make sure the backend server is restarted with the latest code.' }])
            }
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please check if the backend is running on port 5000.' }])
        }

        setLoading(false)
    }

    return (
        <>
            {/* FAB */}
            <button className="chatbot-fab" onClick={() => setOpen(!open)}>
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Panel */}
            {open && (
                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <h3>💬 MediGuide Chat</h3>
                        <button onClick={() => setOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>
                                {msg.text.split('\n').map((line, j) => (
                                    <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
                                ))}
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-msg bot" style={{ opacity: .6 }}>
                                <span className="typing-dots" style={{ display: 'inline-flex', gap: 3 }}>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </span>
                            </div>
                        )}

                        {suggestions.length > 0 && !loading && (
                            <div className="chat-suggestions">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        className="chat-suggestion-btn"
                                        onClick={() => handleSend(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <VoiceInput onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)} />
                        <button onClick={() => handleSend()} disabled={!input.trim() || loading}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
