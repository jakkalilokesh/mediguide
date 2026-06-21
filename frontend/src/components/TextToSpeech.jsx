import { Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export default function TextToSpeech({ text }) {
    const [speaking, setSpeaking] = useState(false)

    const speak = () => {
        if (!window.speechSynthesis) return

        if (speaking) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
            return
        }

        // Clean text: remove markdown, HTML, JSON-like content
        const clean = text
            .replace(/[#*_`~]/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\{[^}]*\}/g, '')
            .replace(/\[[^\]]*\]/g, '')
            .slice(0, 2000) // Limit length

        const utterance = new SpeechSynthesisUtterance(clean)
        utterance.rate = 0.95
        utterance.pitch = 1
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        setSpeaking(true)
        window.speechSynthesis.speak(utterance)
    }

    if (!window.speechSynthesis) return null

    return (
        <button className={`tts-btn ${speaking ? 'active' : ''}`} onClick={speak} title={speaking ? 'Stop speaking' : 'Read aloud'}>
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
    )
}
