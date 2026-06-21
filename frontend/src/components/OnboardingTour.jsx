import { useState, useEffect } from 'react'
import { X, ChevronRight, Stethoscope, ShieldPlus, MessageCircle, Calculator, Brain } from 'lucide-react'

const steps = [
    {
        title: 'Welcome to MediGuide! 🏥',
        text: 'Your AI-powered health guidance assistant. Get help with symptoms, first aid, medications, mental health, nutrition, and more.',
        icon: Stethoscope,
    },
    {
        title: 'Symptom Checker',
        text: 'Describe your symptoms to get AI-powered triage assessment with urgency levels, home remedies, and guidance on when to see a doctor.',
        icon: Stethoscope,
    },
    {
        title: 'Quick Health Tools',
        text: 'Use our Health Calculators for BMI, calorie needs, water intake, and heart rate zones — all computed instantly on your device.',
        icon: Calculator,
    },
    {
        title: 'Mental Health Support',
        text: 'Get compassionate guidance on stress, anxiety, and emotional wellbeing with coping strategies and breathing exercises.',
        icon: Brain,
    },
    {
        title: 'First Aid Guide',
        text: 'Access step-by-step emergency instructions for common injuries and situations — available even offline.',
        icon: ShieldPlus,
    },
    {
        title: 'Chat Anytime 💬',
        text: 'Click the chat bubble in the bottom-right corner to ask MediGuide any health question in a conversational format.',
        icon: MessageCircle,
    },
]

export default function OnboardingTour() {
    const [show, setShow] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(() => {
        const seen = localStorage.getItem('mediguide-onboarding-v5')
        if (!seen) setShow(true)
    }, [])

    const finish = () => {
        localStorage.setItem('mediguide-onboarding-v5', 'true')
        setShow(false)
    }

    const next = () => {
        if (step < steps.length - 1) setStep(step + 1)
        else finish()
    }

    if (!show) return null

    const current = steps[step]
    const Icon = current.icon

    return (
        <div className="onboarding-overlay" role="dialog" aria-label="Welcome tour">
            <div className="onboarding-modal">
                <button className="onboarding-close" onClick={finish} aria-label="Skip tour">
                    <X size={18} />
                </button>

                <div className="onboarding-icon">
                    <Icon size={32} />
                </div>

                <h2>{current.title}</h2>
                <p>{current.text}</p>

                <div className="onboarding-dots">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`onboarding-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
                            onClick={() => setStep(i)}
                        />
                    ))}
                </div>

                <div className="onboarding-actions">
                    <button className="btn btn-secondary btn-sm" onClick={finish}>
                        Skip
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={next}>
                        {step === steps.length - 1 ? 'Get Started' : 'Next'}
                        {step < steps.length - 1 && <ChevronRight size={14} />}
                    </button>
                </div>
            </div>
        </div>
    )
}
