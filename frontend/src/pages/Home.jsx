import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    Stethoscope, ShieldPlus, Pill, Sparkles, Brain, Apple,
    Calculator, AlertTriangle, BarChart3, Heart, Phone,
    ArrowRight, Zap, Activity, Lock, Cpu, Wifi,
    Lightbulb, UserRound, Shield, Clock, CheckCircle2,
    TrendingUp, HeartPulse, Smile
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const modules = [
    {
        to: '/symptoms',
        icon: Stethoscope,
        color: '#2E7D32',
        bg: 'rgba(46,125,50,.08)',
        title: 'Symptom Checker',
        desc: 'AI-powered symptom triage with urgency levels, home remedies, and detailed guidance.',
    },
    {
        to: '/firstaid',
        icon: ShieldPlus,
        color: '#D97706',
        bg: 'rgba(217,119,6,.08)',
        title: 'First Aid Guide',
        desc: 'Step-by-step emergency instructions with common mistakes and aftercare.',
    },
    {
        to: '/medicine',
        icon: Pill,
        color: '#7C3AED',
        bg: 'rgba(124,58,237,.08)',
        title: 'Medicine Info',
        desc: 'Comprehensive medication info — uses, precautions, side effects, and interactions.',
    },
    {
        to: '/wellness',
        icon: Sparkles,
        color: '#059669',
        bg: 'rgba(5,150,105,.08)',
        title: 'Wellness Tips',
        desc: 'Science-backed guidance with weekly plans for sleep, exercise, and lifestyle.',
    },
    {
        to: '/mentalhealth',
        icon: Brain,
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,.08)',
        title: 'Mental Health',
        desc: 'Coping strategies, breathing exercises, grounding techniques, and crisis resources.',
    },
    {
        to: '/nutrition',
        icon: Apple,
        color: '#059669',
        bg: 'rgba(5,150,105,.08)',
        title: 'Nutrition Planner',
        desc: 'Dietary guidance with meal plans, key nutrients, and hydration targets.',
    },
    {
        to: '/calculators',
        icon: Calculator,
        color: '#3B82F6',
        bg: 'rgba(59,130,246,.08)',
        title: 'Health Calculators',
        desc: 'BMI, daily calories, water intake, and heart rate zones — instant results.',
    },
    {
        to: '/druginteraction',
        icon: AlertTriangle,
        color: '#EF4444',
        bg: 'rgba(239,68,68,.08)',
        title: 'Drug Interaction',
        desc: 'Check potential interactions between multiple medications you\'re taking.',
    },
    {
        to: '/consultation',
        icon: UserRound,
        color: '#0EA5E9',
        bg: 'rgba(14,165,233,.08)',
        title: 'AI Virtual Clinic',
        desc: 'Consult AI specialists — physicians, dermatologists, nutritionists, and more.',
    },
    {
        to: '/analytics',
        icon: BarChart3,
        color: '#3B82F6',
        bg: 'rgba(59,130,246,.08)',
        title: 'Analytics Dashboard',
        desc: 'Track your health queries, module usage, and daily activity patterns.',
    },
    {
        to: '/health-data',
        icon: Heart,
        color: '#EC4899',
        bg: 'rgba(236,72,153,.08)',
        title: 'Health Data Tracker',
        desc: 'Log and monitor vital signs — heart rate, BP, weight, sleep, and more.',
    },
    {
        to: '/emergency',
        icon: Phone,
        color: '#DC2626',
        bg: 'rgba(220,38,38,.08)',
        title: 'Emergency Setup',
        desc: 'Configure emergency contacts and quick-dial numbers for crisis situations.',
    },
]

const stats = [
    { icon: Zap, value: '12 Modules', label: 'Health tools' },
    { icon: Cpu, value: 'AI-Powered', label: 'Smart analysis' },
    { icon: Wifi, value: 'Offline Ready', label: 'Works without internet' },
    { icon: Activity, value: 'Real-time', label: 'Instant guidance' },
    { icon: Lock, value: 'Private', label: 'No data stored externally' },
]

const heroTexts = [
    { line1: 'Smart Health Guidance,', line2: 'Anytime You Need It' },
    { line1: 'Your AI Health Partner,', line2: 'Always By Your Side' },
    { line1: 'Trusted Medical Insights,', line2: 'Right At Your Fingertips' },
    { line1: 'Instant Health Answers,', line2: 'Powered By Intelligence' },
    { line1: 'Complete Wellness Hub,', line2: 'Built For Everyone' },
]

const trustFeatures = [
    { icon: Shield, title: 'HIPAA-Aligned Privacy', desc: 'Your health data stays on your device. Zero external storage, zero tracking.' },
    { icon: Clock, title: '24/7 Instant Access', desc: 'Get health guidance anytime — no waiting rooms, no appointments needed.' },
    { icon: CheckCircle2, title: 'Evidence-Based AI', desc: 'Powered by medically-reviewed databases and clinical decision algorithms.' },
    { icon: TrendingUp, title: 'Track Your Progress', desc: 'Monitor vitals, log symptoms, and visualize your health journey over time.' },
    { icon: HeartPulse, title: '12 Health Modules', desc: 'From symptom triage to nutrition planning — all your health tools in one place.' },
    { icon: Smile, title: 'Mental Health Support', desc: 'Breathing exercises, grounding techniques, and coping strategies when you need them.' },
]

const dailyTips = [
    "💧 Drink a glass of water first thing in the morning to kickstart your metabolism and hydrate your brain.",
    "🧘 Try box breathing (4-4-4-4) when feeling stressed — inhale 4s, hold 4s, exhale 4s, hold 4s.",
    "🥗 Eat the rainbow! Include 5 different colored fruits and vegetables in your meals today.",
    "🚶 A 20-minute walk after meals can significantly improve blood sugar regulation.",
    "😴 Blue light from screens disrupts melatonin. Stop screen time 30 minutes before bed.",
    "🍎 An apple a day may actually keep the doctor away — they're rich in fiber and antioxidants.",
    "💪 Strength training just 2x per week can reduce risk of cardiovascular disease by up to 70%.",
    "🧠 Learning something new today creates new neural pathways and improves cognitive resilience.",
    "🌿 Spending 20 minutes in nature can lower cortisol levels by 13% — take a green break today.",
    "❤️ Laughing for 15 minutes a day can burn up to 40 calories and boost your immune system.",
]

/* ── Typing Animation Hook ── */
function useTypingAnimation(texts, typingSpeed = 60, deletingSpeed = 30, pauseDuration = 2500) {
    const [displayText, setDisplayText] = useState({ line1: '', line2: '' })
    const [textIndex, setTextIndex] = useState(0)
    const [phase, setPhase] = useState('typing1') // typing1, typing2, pausing, deleting2, deleting1
    const charIndex1 = useRef(0)
    const charIndex2 = useRef(0)

    useEffect(() => {
        const current = texts[textIndex]
        let timeout

        switch (phase) {
            case 'typing1':
                if (charIndex1.current <= current.line1.length) {
                    timeout = setTimeout(() => {
                        setDisplayText(prev => ({ ...prev, line1: current.line1.slice(0, charIndex1.current) }))
                        charIndex1.current++
                        if (charIndex1.current > current.line1.length) {
                            setPhase('typing2')
                        }
                    }, typingSpeed)
                }
                break

            case 'typing2':
                if (charIndex2.current <= current.line2.length) {
                    timeout = setTimeout(() => {
                        setDisplayText(prev => ({ ...prev, line2: current.line2.slice(0, charIndex2.current) }))
                        charIndex2.current++
                        if (charIndex2.current > current.line2.length) {
                            setPhase('pausing')
                        }
                    }, typingSpeed)
                }
                break

            case 'pausing':
                timeout = setTimeout(() => setPhase('deleting2'), pauseDuration)
                break

            case 'deleting2':
                if (charIndex2.current > 0) {
                    timeout = setTimeout(() => {
                        charIndex2.current--
                        setDisplayText(prev => ({ ...prev, line2: current.line2.slice(0, charIndex2.current) }))
                        if (charIndex2.current === 0) setPhase('deleting1')
                    }, deletingSpeed)
                }
                break

            case 'deleting1':
                if (charIndex1.current > 0) {
                    timeout = setTimeout(() => {
                        charIndex1.current--
                        setDisplayText(prev => ({ ...prev, line1: current.line1.slice(0, charIndex1.current) }))
                        if (charIndex1.current === 0) {
                            setTextIndex((textIndex + 1) % texts.length)
                            setPhase('typing1')
                        }
                    }, deletingSpeed)
                }
                break
        }

        return () => clearTimeout(timeout)
    }, [phase, textIndex, displayText])

    return displayText
}

export default function Home() {
    const { isAuthenticated, authFetch } = useAuth()
    const [vitals, setVitals] = useState(null)
    const tipOfDay = dailyTips[new Date().getDate() % dailyTips.length]
    const typedText = useTypingAnimation(heroTexts)

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecentVitals()
        }
    }, [isAuthenticated])

    const fetchRecentVitals = async () => {
        try {
            const res = await authFetch('/api/health-data')
            if (res.ok) {
                const data = await res.json()
                if (data.metrics?.length) {
                    const latest = {}
                    data.metrics.slice(0, 20).forEach(m => {
                        if (!latest[m.type]) latest[m.type] = m
                    })
                    setVitals(latest)
                }
            }
        } catch { }
    }

    // Double stats for seamless marquee loop
    const doubledStats = [...stats, ...stats]

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            {/* Hero */}
            <div className="hero">
                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    Your AI Health Assistant — Now with AI Virtual Clinic
                </div>

                <h1 className="hero-typing-heading">
                    <span className="hero-typed-line">{typedText.line1}</span>
                    <br />
                    <span className="hero-typed-line">{typedText.line2}</span>
                    <span className="hero-cursor">|</span>
                </h1>

                <p>
                    MediGuide provides AI-powered symptom assessment, first aid instructions,
                    medication info, drug interaction checking, mental health support, nutrition planning,
                    health calculators, virtual consultations, and wellness tips — all in one place.
                </p>

                {/* Marquee Stats Carousel */}
                <div className="hero-marquee-wrapper">
                    <div className="hero-marquee-track">
                        {doubledStats.map((stat, i) => (
                            <div key={i} className="hero-marquee-item">
                                <div className="hero-stat-icon">
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <div className="hero-stat-value">{stat.value}</div>
                                    <div className="hero-stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trust & Features Section */}
            <div className="trust-section">
                <h2 className="section-title">Why Healthcare Professionals Trust MediGuide</h2>
                <p className="trust-subtitle">
                    Built with clinical accuracy and patient privacy at its core — designed for both
                    healthcare workers and everyday users seeking reliable health guidance.
                </p>
                <div className="trust-grid">
                    {trustFeatures.map((feat, i) => (
                        <div key={i} className="trust-card">
                            <div className="trust-card-icon">
                                <feat.icon size={24} />
                            </div>
                            <h3>{feat.title}</h3>
                            <p>{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Tip + Quick Vitals */}
            <div className="home-extras">
                <div className="daily-tip-card">
                    <h3><Lightbulb size={18} color="#F59E0B" /> Daily Health Tip</h3>
                    <p>{tipOfDay}</p>
                </div>

                {isAuthenticated && vitals && Object.keys(vitals).length > 0 && (
                    <div className="quick-vitals-card">
                        <h3><Activity size={18} color="var(--primary)" /> Quick Vitals</h3>
                        <div className="vitals-grid">
                            {Object.entries(vitals).slice(0, 4).map(([type, metric]) => (
                                <div key={type} className="vital-item">
                                    <div className="vital-value">{metric.value}</div>
                                    <div className="vital-label">{type.replace(/_/g, ' ')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!isAuthenticated || !vitals || Object.keys(vitals).length === 0) && (
                    <div className="quick-vitals-card">
                        <h3><Activity size={18} color="var(--primary)" /> Quick Vitals</h3>
                        <p style={{ fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                            {isAuthenticated
                                ? 'No health data logged yet. Visit Health Data Tracker to start tracking your vitals!'
                                : 'Log in to see your latest health vitals at a glance.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Module Grid */}
            <h2 className="section-title">Health Modules</h2>
            <div className="module-grid">
                {modules.map((mod, i) => (
                    <Link key={i} to={mod.to} className="module-card" style={{ textDecoration: 'none', color: 'var(--text)' }}>
                        <div className="module-card-icon" style={{ background: mod.bg, color: mod.color }}>
                            <mod.icon size={24} />
                        </div>
                        <h3>{mod.title}</h3>
                        <p>{mod.desc}</p>
                        <ArrowRight size={16} className="module-card-arrow" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
