import { useState, useEffect, useRef } from 'react'
import {
    AlertCircle, CheckCircle, AlertTriangle, Shield,
    Clock, Stethoscope, HeartPulse, Download, Share2,
    Copy, Check, Info, XCircle, Sparkles, Brain, Apple,
    Lightbulb, Heart, Utensils, Printer, Pill, Volume2
} from 'lucide-react'
import TextToSpeech from './TextToSpeech'

/* ── Urgency mapping ── */
const urgencyMap = {
    low: { cls: 'urgency-low', icon: CheckCircle, label: 'Low Urgency' },
    moderate: { cls: 'urgency-moderate', icon: Info, label: 'Moderate' },
    high: { cls: 'urgency-high', icon: AlertTriangle, label: 'High' },
    urgent: { cls: 'urgency-urgent', icon: AlertCircle, label: 'Urgent' },
    critical: { cls: 'urgency-critical', icon: XCircle, label: 'CRITICAL' },
}

function getUrgency(level) {
    if (!level) return urgencyMap.low
    const k = level.toLowerCase().replace(/[^a-z]/g, '')
    return Object.keys(urgencyMap).reduce((m, key) => k.includes(key) ? urgencyMap[key] : m, urgencyMap.low)
}

/* ── Typing animation hook ── */
function useTypewriter(text, speed = 12) {
    const [displayed, setDisplayed] = useState('')
    const [done, setDone] = useState(false)
    const idx = useRef(0)

    useEffect(() => {
        if (!text) return
        idx.current = 0
        setDisplayed('')
        setDone(false)

        const timer = setInterval(() => {
            idx.current++
            setDisplayed(text.slice(0, idx.current))
            if (idx.current >= text.length) {
                clearInterval(timer)
                setDone(true)
            }
        }, speed)

        return () => clearInterval(timer)
    }, [text, speed])

    return { displayed, done }
}

function TypedParagraph({ text }) {
    const { displayed, done } = useTypewriter(text, 8)
    return (
        <p className="response-text">
            {displayed}{!done && <span className="typewriter">&nbsp;</span>}
        </p>
    )
}

function TypedList({ items }) {
    return (
        <div className="response-text">
            <ul>
                {items.map((item, i) => (
                    <li key={i} style={{ animation: `textReveal .3s ease ${i * 0.06}s both` }}>{item}</li>
                ))}
            </ul>
        </div>
    )
}

/* ── Build text for download/share ── */
function buildReport(data) {
    const lines = ['MediGuide Health Report', `Date: ${new Date().toLocaleString()}`, '']
    if (data.urgencyLevel) lines.push(`Urgency: ${data.urgencyLevel}`)
    if (data.concernCategory) lines.push(`Category: ${data.concernCategory}`)
    if (data.topic) lines.push(`Topic: ${data.topic}`)
    lines.push('')

    const add = (title, val) => {
        if (!val) return
        lines.push(title)
        if (Array.isArray(val)) val.forEach(v => lines.push(`  • ${v}`))
        else lines.push(`  ${val}`)
        lines.push('')
    }

    add('What To Do Now:', data.whatToDoNow)
    add('Home Remedies:', data.homeRemedies)
    add('Lifestyle Advice:', data.lifestyleAdvice)
    add('When To See a Doctor:', data.whenToSeeDoctor)
    add('Safety Note:', data.safetyNote)
    add('Avoid:', data.doNot)
    add('Common Mistakes:', data.commonMistakes)
    add('Aftercare:', data.aftercare)
    add('Follow-up Questions:', data.followUpQuestions)
    add('Guidance:', data.guidance)
    add('Weekly Plan:', data.weeklyPlan)
    add('Action Steps:', data.actionSteps)
    add('Coping Strategies:', data.copingStrategies)
    add('Daily Practices:', data.dailyPractices)
    add('Key Nutrients:', data.keyNutrients)
    add('Foods To Include:', data.foodsToInclude)
    add('Foods To Limit:', data.foodsToLimit)

    if (data.medicineName) {
        lines.push(`Medicine: ${data.medicineName}`)
        if (data.generalPurpose) lines.push(`Purpose: ${data.generalPurpose}`)
        if (data.howItWorks) lines.push(`How It Works: ${data.howItWorks}`)
        lines.push('')
    }

    lines.push('---')
    lines.push('This is educational guidance only — not a substitute for professional medical care.')
    return lines.join('\n')
}

function handleDownload(data) {
    const text = buildReport(data)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MediGuide_Report_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

function handlePrint() {
    window.print()
}

async function handleShare(data) {
    const text = buildReport(data)
    if (navigator.share) {
        try { await navigator.share({ title: 'MediGuide Report', text }) } catch { /* cancelled */ }
    } else {
        await navigator.clipboard.writeText(text)
        alert('Report copied to clipboard!')
    }
}

function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={() => {
                navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text))
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    )
}

/* ── Section heading + content ── */
function Section({ icon: Icon, title, children, color = 'var(--primary)' }) {
    return (
        <>
            <h3 className="response-heading" style={{ color }}>
                <Icon size={17} /> {title}
            </h3>
            {children}
        </>
    )
}

/* ── Render array or string ── */
function RenderContent({ data }) {
    if (!data) return null
    if (Array.isArray(data)) return <TypedList items={data} />
    return <TypedParagraph text={String(data)} />
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function ResponseCard({ data }) {
    if (!data) return null

    const urg = getUrgency(data.urgencyLevel)
    const UIcon = urg.icon

    return (
        <div className="response-flow">

            {/* Urgency + Confidence */}
            {data.urgencyLevel && (
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className={`response-urgency ${urg.cls}`}>
                        <UIcon size={15} /> {data.urgencyLevel}
                    </span>
                    {data.mlConfidence != null && (
                        <span className="confidence-pill">
                            <span className="confidence-dot"></span>
                            {data.mlConfidence}% confidence
                        </span>
                    )}
                </div>
            )}

            {data.concernCategory && (
                <p className="response-text" style={{ color: 'var(--text-sec)', marginBottom: 4 }}>
                    {data.concernCategory}
                </p>
            )}

            {data.topic && !data.concernCategory && (
                <p className="response-text" style={{ color: 'var(--text-sec)', marginBottom: 4, fontWeight: 600 }}>
                    {data.topic}
                </p>
            )}

            {(data.urgencyLevel || data.topic) && <div className="response-divider"></div>}

            {/* ── Validation (Mental Health) ── */}
            {data.validation && (
                <Section icon={Heart} title="We Hear You" color="#8B5CF6">
                    <TypedParagraph text={data.validation} />
                </Section>
            )}

            {/* ── What To Do Now / Steps ── */}
            {data.whatToDoNow && (
                <Section icon={Stethoscope} title="What To Do Now">
                    <RenderContent data={data.whatToDoNow} />
                </Section>
            )}

            {/* ── Home Remedies ── */}
            {data.homeRemedies && (
                <Section icon={Lightbulb} title="Home Remedies" color="var(--secondary)">
                    <RenderContent data={data.homeRemedies} />
                </Section>
            )}

            {/* ── Lifestyle Advice ── */}
            {data.lifestyleAdvice && (
                <Section icon={Sparkles} title="Lifestyle Advice" color="var(--secondary)">
                    <RenderContent data={data.lifestyleAdvice} />
                </Section>
            )}

            {/* ── Common Mistakes ── */}
            {data.commonMistakes && (
                <Section icon={AlertTriangle} title="Common Mistakes to Avoid" color="var(--accent)">
                    <RenderContent data={data.commonMistakes} />
                </Section>
            )}

            {/* ── Aftercare ── */}
            {data.aftercare && (
                <Section icon={HeartPulse} title="Aftercare & Recovery">
                    <RenderContent data={data.aftercare} />
                </Section>
            )}

            {/* ── When To See Doctor ── */}
            {data.whenToSeeDoctor && (
                <Section icon={Clock} title="When To See a Doctor" color="var(--accent-dark)">
                    <TypedParagraph text={typeof data.whenToSeeDoctor === 'string' ? data.whenToSeeDoctor : JSON.stringify(data.whenToSeeDoctor)} />
                </Section>
            )}

            {/* ── When To Seek Help (Mental Health) ── */}
            {data.whenToSeekHelp && (
                <Section icon={Clock} title="When To Seek Professional Help" color="var(--accent-dark)">
                    <TypedParagraph text={data.whenToSeekHelp} />
                </Section>
            )}



            {/* ── Do NOT Do ── */}
            {data.doNot && data.doNot.length > 0 && (
                <Section icon={AlertTriangle} title="What To Avoid" color="var(--alert)">
                    <TypedList items={data.doNot} />
                </Section>
            )}

            {/* ── Follow-up Questions ── */}
            {data.followUpQuestions && data.followUpQuestions.length > 0 && (
                <Section icon={Info} title="Follow-up Questions" color="var(--secondary)">
                    <TypedList items={data.followUpQuestions} />
                </Section>
            )}

            {/* ── Coping Strategies (Mental Health) ── */}
            {data.copingStrategies && (
                <Section icon={Brain} title="Coping Strategies" color="#8B5CF6">
                    <RenderContent data={data.copingStrategies} />
                </Section>
            )}

            {/* ── Breathing Exercise ── */}
            {data.breathingExercise && (
                <Section icon={Sparkles} title="Breathing Exercise" color="#8B5CF6">
                    <TypedParagraph text={data.breathingExercise} />
                </Section>
            )}

            {/* ── Grounding Technique ── */}
            {data.groundingTechnique && (
                <Section icon={Shield} title="Grounding Technique" color="#8B5CF6">
                    <TypedParagraph text={data.groundingTechnique} />
                </Section>
            )}

            {/* ── Daily Practices ── */}
            {data.dailyPractices && (
                <Section icon={CheckCircle} title="Daily Practices">
                    <RenderContent data={data.dailyPractices} />
                </Section>
            )}

            {/* ── Resources (Crisis Lines) ── */}
            {data.resources && (
                <Section icon={Heart} title="Help Resources" color="var(--alert)">
                    <TypedParagraph text={data.resources} />
                </Section>
            )}

            {/* ── Wellness guidance ── */}
            {data.guidance && (
                <Section icon={Sparkles} title="Guidance">
                    <RenderContent data={data.guidance} />
                </Section>
            )}

            {/* ── Science Behind ── */}
            {data.scienceBehind && (
                <Section icon={Lightbulb} title="The Science" color="var(--secondary)">
                    <TypedParagraph text={data.scienceBehind} />
                </Section>
            )}

            {/* ── Weekly Plan ── */}
            {data.weeklyPlan && (
                <Section icon={CheckCircle} title="Weekly Plan">
                    <RenderContent data={data.weeklyPlan} />
                </Section>
            )}

            {/* ── Action Steps ── */}
            {data.actionSteps && (
                <Section icon={CheckCircle} title="Action Steps">
                    <RenderContent data={data.actionSteps} />
                </Section>
            )}

            {/* ── Nutrition: Sample Meal Plan ── */}
            {data.sampleMealPlan && (
                <>
                    <div className="response-divider"></div>
                    <Section icon={Utensils} title="Sample Meal Plan" color="#059669">
                        <div className="meal-plan-grid">
                            {data.sampleMealPlan.breakfast && (
                                <div className="meal-plan-item">
                                    <div className="meal-plan-label">Breakfast</div>
                                    <div className="meal-plan-value">{data.sampleMealPlan.breakfast}</div>
                                </div>
                            )}
                            {data.sampleMealPlan.lunch && (
                                <div className="meal-plan-item">
                                    <div className="meal-plan-label">Lunch</div>
                                    <div className="meal-plan-value">{data.sampleMealPlan.lunch}</div>
                                </div>
                            )}
                            {data.sampleMealPlan.dinner && (
                                <div className="meal-plan-item">
                                    <div className="meal-plan-label">Dinner</div>
                                    <div className="meal-plan-value">{data.sampleMealPlan.dinner}</div>
                                </div>
                            )}
                            {data.sampleMealPlan.snacks && (
                                <div className="meal-plan-item">
                                    <div className="meal-plan-label">Snacks</div>
                                    <div className="meal-plan-value">{data.sampleMealPlan.snacks}</div>
                                </div>
                            )}
                        </div>
                    </Section>
                </>
            )}

            {/* ── Nutrition: Key Nutrients ── */}
            {data.keyNutrients && (
                <Section icon={Apple} title="Key Nutrients" color="#059669">
                    <RenderContent data={data.keyNutrients} />
                </Section>
            )}

            {/* ── Foods To Include / Limit ── */}
            {data.foodsToInclude && (
                <Section icon={CheckCircle} title="Foods To Include" color="#059669">
                    <RenderContent data={data.foodsToInclude} />
                </Section>
            )}

            {data.foodsToLimit && (
                <Section icon={AlertTriangle} title="Foods To Limit" color="var(--accent)">
                    <RenderContent data={data.foodsToLimit} />
                </Section>
            )}

            {/* ── Hydration ── */}
            {data.hydration && (
                <Section icon={Sparkles} title="Hydration">
                    <TypedParagraph text={data.hydration} />
                </Section>
            )}

            {/* ── Benefits ── */}
            {data.benefits && (
                <Section icon={HeartPulse} title="Why This Matters">
                    <TypedParagraph text={typeof data.benefits === 'string' ? data.benefits : JSON.stringify(data.benefits)} />
                </Section>
            )}

            {/* ── Medicine fields ── */}
            {data.medicineName && (
                <>
                    <div className="response-divider"></div>
                    <Section icon={HeartPulse} title={data.medicineName}>
                        {data.generalPurpose && <TypedParagraph text={data.generalPurpose} />}
                    </Section>

                    {data.howItWorks && (
                        <Section icon={Lightbulb} title="How It Works" color="var(--secondary)">
                            <TypedParagraph text={data.howItWorks} />
                        </Section>
                    )}

                    {data.commonUses && (
                        <Section icon={CheckCircle} title="Common Uses">
                            <RenderContent data={data.commonUses} />
                        </Section>
                    )}

                    {data.generalPrecautions && (
                        <Section icon={Shield} title="Precautions" color="var(--accent-dark)">
                            <RenderContent data={data.generalPrecautions} />
                        </Section>
                    )}

                    {/* Side Effect Categories */}
                    {data.sideEffectCategories && (
                        <>
                            <h3 className="response-heading" style={{ color: 'var(--accent)' }}>
                                <AlertTriangle size={17} /> Side Effects
                            </h3>
                            <div className="side-effects-grid">
                                {data.sideEffectCategories.common && (
                                    <div className="side-effect-category common">
                                        <div className="side-effect-label" style={{ color: 'var(--primary)' }}>Common</div>
                                        <ul style={{ paddingLeft: 16, fontSize: '.8rem', lineHeight: 1.7 }}>
                                            {data.sideEffectCategories.common.map((e, i) => <li key={i}>{e}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {data.sideEffectCategories.lessCommon && (
                                    <div className="side-effect-category less-common">
                                        <div className="side-effect-label" style={{ color: 'var(--accent)' }}>Less Common</div>
                                        <ul style={{ paddingLeft: 16, fontSize: '.8rem', lineHeight: 1.7 }}>
                                            {data.sideEffectCategories.lessCommon.map((e, i) => <li key={i}>{e}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {data.sideEffectCategories.seekHelp && (
                                    <div className="side-effect-category seek-help">
                                        <div className="side-effect-label" style={{ color: 'var(--alert)' }}>Seek Help</div>
                                        <ul style={{ paddingLeft: 16, fontSize: '.8rem', lineHeight: 1.7 }}>
                                            {data.sideEffectCategories.seekHelp.map((e, i) => <li key={i}>{e}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {data.interactions && (
                        <Section icon={Info} title="Interactions" color="var(--accent)">
                            <TypedParagraph text={data.interactions} />
                        </Section>
                    )}

                    {data.importantNote && (
                        <Section icon={AlertTriangle} title="Important" color="var(--alert)">
                            <TypedParagraph text={data.importantNote} />
                        </Section>
                    )}
                </>
            )}

            {/* ── Drug Interaction fields ── */}
            {data.medicationsIdentified && (
                <Section icon={Pill} title="Medications Identified" color="#7C3AED">
                    <RenderContent data={data.medicationsIdentified} />
                </Section>
            )}

            {data.interactionsFound && Array.isArray(data.interactionsFound) && (
                <>
                    <h3 className="response-heading" style={{ color: '#EF4444' }}>
                        <AlertTriangle size={17} /> Interactions Found
                    </h3>
                    <div className="interactions-list">
                        {data.interactionsFound.map((inter, i) => (
                            <div key={i} className="interaction-item">
                                <div className="interaction-header">
                                    <span className="interaction-drugs">{inter.drugs}</span>
                                    <span className={`interaction-severity severity-${(inter.severity || '').toLowerCase().replace(/\s/g, '-')}`}>
                                        {inter.severity}
                                    </span>
                                </div>
                                <p className="response-text" style={{ fontSize: '.8rem' }}>{inter.description}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {data.foodInteractions && (
                <Section icon={Utensils} title="Food & Drink Interactions" color="#D97706">
                    <RenderContent data={data.foodInteractions} />
                </Section>
            )}

            {data.generalPrecautions && !data.medicineName && (
                <Section icon={Shield} title="General Precautions" color="var(--accent-dark)">
                    <RenderContent data={data.generalPrecautions} />
                </Section>
            )}

            {/* Action Buttons */}
            <div className="response-actions">
                <TextToSpeech text={buildReport(data)} />
                <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(data)}>
                    <Download size={14} /> Download
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
                    <Printer size={14} /> Print / PDF
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleShare(data)}>
                    <Share2 size={14} /> Share
                </button>
                <CopyBtn text={buildReport(data)} />
            </div>
        </div>
    )
}
