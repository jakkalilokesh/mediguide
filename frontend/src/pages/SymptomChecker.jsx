import { useState } from 'react'
import { Stethoscope, Send, Camera } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import EmergencyBanner from '../components/EmergencyBanner'
import TypingIndicator from '../components/TypingIndicator'
import VoiceInput from '../components/VoiceInput'
import ImageUpload from '../components/ImageUpload'

const bodyAreas = ['Head', 'Chest', 'Abdomen', 'Back', 'Throat', 'Joints', 'Skin', 'General']
const quickSymptoms = ['Headache', 'Fever', 'Cough', 'Nausea', 'Dizziness', 'Fatigue', 'Body aches', 'Sore throat']

export default function SymptomChecker({ sendMessage }) {
    const [step, setStep] = useState(1)
    const [bodyArea, setBodyArea] = useState('')
    const [description, setDescription] = useState('')
    const [severity, setSeverity] = useState(5)
    const [duration, setDuration] = useState('')
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [emergency, setEmergency] = useState(null)
    const [imageData, setImageData] = useState(null)
    const [showImageUpload, setShowImageUpload] = useState(false)

    const handleVoiceResult = (transcript) => {
        setDescription(prev => prev + (prev ? ' ' : '') + transcript)
    }

    const handleSubmit = async () => {
        let message = `Body area: ${bodyArea}. Symptoms: ${description}. Severity: ${severity}/10. Duration: ${duration || 'Not specified'}.`
        setLoading(true)
        setEmergency(null)
        setResponse(null)

        // If an image was attached, analyze it first via multimodal endpoint
        if (imageData) {
            try {
                const imgRes = await fetch('/api/analyze-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imageData, message: description }),
                })
                if (imgRes.ok) {
                    const imgData = await imgRes.json()
                    if (imgData.response?.rawText) {
                        message += `\n\n[Visual Analysis from uploaded image]: ${imgData.response.rawText}`
                    }
                }
            } catch (err) {
                console.warn('Image analysis unavailable, proceeding with text only:', err.message)
            }
        }

        const result = await sendMessage('symptom', message)
        setLoading(false)

        if (result?.response) {
            if (result.response.isEmergency) {
                setEmergency(result.response)
            } else {
                setResponse(result.response)
            }
            setStep(4)
        }
    }

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Stethoscope size={26} color="var(--primary)" />
                    Symptom Checker
                </h1>
                <p>Describe your symptoms to receive health guidance and urgency assessment.</p>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
                {[1, 2, 3].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                            className={`step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
                            onClick={() => s < step && setStep(s)}
                            style={{ cursor: s < step ? 'pointer' : 'default' }}
                        >
                            {s}
                        </div>
                        {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`}></div>}
                    </div>
                ))}
            </div>

            {/* Step 1: Body Area */}
            {step === 1 && (
                <div style={{ animation: 'pageIn .3s ease' }}>
                    <h2 className="section-title">Where are you experiencing issues?</h2>
                    <div className="body-area-grid">
                        {bodyAreas.map(area => (
                            <button
                                key={area}
                                className={`body-area-btn ${bodyArea === area ? 'selected' : ''}`}
                                onClick={() => { setBodyArea(area); setStep(2) }}
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Describe */}
            {step === 2 && (
                <div style={{ animation: 'pageIn .3s ease' }}>
                    <h2 className="section-title">Describe your symptoms</h2>

                    <div className="quick-actions" style={{ marginBottom: 14 }}>
                        {quickSymptoms.map(s => (
                            <button key={s} className="quick-action-btn" onClick={() => setDescription(prev => prev + (prev ? ', ' : '') + s)}>
                                {s}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-start' }}>
                        <textarea
                            className="input-field"
                            rows={3}
                            placeholder="Describe what you're experiencing in detail..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        <VoiceInput onTranscript={handleVoiceResult} />
                    </div>

                    {/* Image Upload Toggle */}
                    <div style={{ marginBottom: 14 }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowImageUpload(!showImageUpload)}
                            style={{ marginBottom: 8 }}
                        >
                            <Camera size={15} /> {showImageUpload ? 'Hide' : 'Add Photo'}
                        </button>
                        {showImageUpload && (
                            <ImageUpload onImageSelect={(img) => setImageData(img)} />
                        )}
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>
                            Severity: {severity}/10
                        </label>
                        <input
                            type="range" min="1" max="10"
                            value={severity}
                            onChange={e => setSeverity(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!description.trim()}>
                        Continue
                    </button>
                </div>
            )}

            {/* Step 3: Duration + Submit */}
            {step === 3 && (
                <div style={{ animation: 'pageIn .3s ease' }}>
                    <h2 className="section-title">How long have you had these symptoms?</h2>
                    <select className="input-field" value={duration} onChange={e => setDuration(e.target.value)} style={{ marginBottom: 16 }}>
                        <option value="">Select duration</option>
                        <option value="Just started (today)">Just started (today)</option>
                        <option value="1-3 days">1-3 days</option>
                        <option value="4-7 days">4-7 days</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="More than 2 weeks">More than 2 weeks</option>
                        <option value="Ongoing / recurring">Ongoing / recurring</option>
                    </select>

                    <div style={{ padding: '14px 20px', borderLeft: '3px solid var(--primary)', background: 'rgba(46,125,50,.03)', borderRadius: '0 var(--r-sm) var(--r-sm) 0', marginBottom: 16 }}>
                        <p style={{ fontSize: '.8rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>
                            <strong>{bodyArea}</strong> — {description} — Severity: {severity}/10 — {duration || 'Duration not specified'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            <Send size={15} /> Get Assessment
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && <TypingIndicator message="Analyzing your symptoms…" />}

            {/* Results */}
            {step === 4 && !loading && (
                <div style={{ animation: 'pageIn .3s ease' }}>
                    {emergency && <EmergencyBanner data={emergency} />}
                    {response && <ResponseCard data={response} />}

                    <button
                        className="btn btn-secondary"
                        style={{ marginTop: 16 }}
                        onClick={() => {
                            setStep(1)
                            setBodyArea('')
                            setDescription('')
                            setSeverity(5)
                            setDuration('')
                            setResponse(null)
                            setEmergency(null)
                        }}
                    >
                        Start New Assessment
                    </button>
                </div>
            )}
        </div>
    )
}
