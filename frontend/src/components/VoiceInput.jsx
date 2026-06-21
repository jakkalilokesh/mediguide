import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'

export default function VoiceInput({ onTranscript, disabled }) {
    const [isListening, setIsListening] = useState(false)
    const [supported, setSupported] = useState(false)
    const [interimText, setInterimText] = useState('')
    const recognitionRef = useRef(null)

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            setSupported(true)
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onresult = (event) => {
                let interim = ''
                let final = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        final += transcript
                    } else {
                        interim += transcript
                    }
                }

                if (final) {
                    onTranscript(final)
                    setInterimText('')
                } else {
                    setInterimText(interim)
                }
            }

            recognition.onerror = (e) => {
                if (e.error !== 'no-speech') {
                    setIsListening(false)
                    setInterimText('')
                }
            }

            recognition.onend = () => {
                setIsListening(false)
                setInterimText('')
            }

            recognitionRef.current = recognition
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop() } catch { }
            }
        }
    }, [onTranscript])

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
            setInterimText('')
        } else {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch (err) {
                // Already started — ignore
            }
        }
    }, [isListening])

    if (!supported) return null

    return (
        <div className="voice-input-wrapper">
            <button
                type="button"
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={disabled}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input — speak your symptoms'}
                aria-pressed={isListening}
                title={isListening ? 'Stop listening' : 'Speak your symptoms'}
            >
                {isListening ? (
                    <>
                        <div className="voice-pulse" aria-hidden="true"></div>
                        <MicOff size={18} />
                    </>
                ) : (
                    <Mic size={18} />
                )}
            </button>

            {/* Live interim text preview */}
            {isListening && interimText && (
                <div className="voice-interim" aria-live="polite" role="status">
                    <span className="voice-interim-dot" aria-hidden="true"></span>
                    {interimText}
                </div>
            )}

            {/* Screen reader announcement */}
            <div className="sr-only" aria-live="assertive" role="alert">
                {isListening ? 'Listening for your voice input. Speak now.' : ''}
            </div>
        </div>
    )
}
