import { useState } from 'react'
import { Pill, Send, Plus, X, AlertTriangle } from 'lucide-react'
import ResponseCard from '../components/ResponseCard'
import SkeletonLoader from '../components/SkeletonLoader'

export default function DrugInteraction({ sendMessage }) {
    const [medications, setMedications] = useState(['', ''])
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)

    const addMed = () => setMedications(prev => [...prev, ''])
    const removeMed = (i) => setMedications(prev => prev.filter((_, idx) => idx !== i))
    const updateMed = (i, val) => setMedications(prev => prev.map((m, idx) => idx === i ? val : m))

    const handleCheck = async () => {
        const meds = medications.filter(m => m.trim())
        if (meds.length < 2) return

        const message = `Check for drug interactions between these medications: ${meds.join(', ')}`
        setLoading(true)
        const result = await sendMessage('druginteraction', message)
        setLoading(false)

        if (result?.response) {
            setConversations(prev => [...prev, { meds: [...meds], answer: result.response }])
        }
    }

    const canCheck = medications.filter(m => m.trim()).length >= 2

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Pill size={26} color="#EF4444" />
                    Drug Interaction Checker
                </h1>
                <p>Enter two or more medications to check for potential interactions.</p>
            </div>

            {/* Important Warning */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 18px', borderLeft: '3px solid var(--alert)', background: 'rgba(239,68,68,.04)', borderRadius: '0 var(--r-sm) var(--r-sm) 0', marginBottom: 20 }}>
                <AlertTriangle size={18} color="var(--alert)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                    <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--alert)', marginBottom: 3 }}>Important Disclaimer</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>
                        This is an AI-powered educational tool and should NOT replace professional medical advice.
                        Always consult your pharmacist or doctor before combining medications.
                    </p>
                </div>
            </div>

            {/* Medication Inputs */}
            <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-sec)', marginBottom: 10 }}>
                    Enter your medications:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {medications.map((med, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ width: 24, fontSize: '.75rem', fontWeight: 600, color: 'var(--text-dim)', flexShrink: 0 }}>
                                {i + 1}.
                            </span>
                            <input
                                className="input-field"
                                placeholder={`Medication ${i + 1} (e.g., Aspirin, Ibuprofen...)`}
                                value={med}
                                onChange={e => updateMed(i, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && canCheck && handleCheck()}
                            />
                            {medications.length > 2 && (
                                <button
                                    className="btn btn-sm"
                                    style={{ border: 'none', background: 'none', color: 'var(--text-dim)', padding: 4 }}
                                    onClick={() => removeMed(i)}
                                    aria-label="Remove medication"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={addMed}>
                        <Plus size={14} /> Add Medication
                    </button>
                    <button className="btn btn-primary" onClick={handleCheck} disabled={loading || !canCheck}>
                        <Send size={15} /> Check Interactions
                    </button>
                </div>
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 22 }}>
                {conversations.map((conv, i) => (
                    <div key={i} style={{ animation: 'pageIn .4s ease' }}>
                        <div style={{ marginBottom: 12, paddingLeft: 14, borderLeft: '2px solid #EF4444' }}>
                            <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                Medications Checked
                            </p>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {conv.meds.map((m, j) => (
                                    <span key={j} style={{ padding: '3px 10px', borderRadius: 'var(--r-sm)', background: 'rgba(239,68,68,.08)', fontSize: '.78rem', fontWeight: 500 }}>
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <ResponseCard data={conv.answer} />
                    </div>
                ))}
            </div>

            {loading && <SkeletonLoader />}
        </div>
    )
}
