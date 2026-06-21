import { Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useState, useRef, useEffect } from 'react'

const LANG_LABELS = {
    en: { flag: '🇺🇸', name: 'English' },
    hi: { flag: '🇮🇳', name: 'हिन्दी' },
    es: { flag: '🇪🇸', name: 'Español' },
    fr: { flag: '🇫🇷', name: 'Français' },
    te: { flag: '🇮🇳', name: 'తెలుగు' },
}

export default function LanguageSwitcher() {
    const { lang, setLanguage, languages } = useLanguage()
    const [open, setOpen] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const handle = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    return (
        <div className="lang-switcher" ref={ref}>
            <button className="lang-btn" onClick={() => setOpen(!open)} title="Change Language">
                <Globe size={18} />
                <span>{LANG_LABELS[lang]?.flag}</span>
            </button>
            {open && (
                <div className="lang-dropdown">
                    {languages.map(l => (
                        <button key={l} className={`lang-option ${l === lang ? 'active' : ''}`}
                            onClick={() => { setLanguage(l); setOpen(false) }}>
                            <span>{LANG_LABELS[l]?.flag}</span> {LANG_LABELS[l]?.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
