'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceInputProps {
    onTranscript: (text: string) => void
    onFinalTranscript?: (text: string) => void
    placeholder?: string
    className?: string
    autoStart?: boolean
    continuous?: boolean
}

// Extend Window interface for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any
        webkitSpeechRecognition: any
    }
}

export function VoiceInput({
    onTranscript,
    onFinalTranscript,
    placeholder = "Click to speak...",
    className,
    autoStart = false,
    continuous = true
}: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [transcript, setTranscript] = useState('')
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Check browser support
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (!SpeechRecognition) {
                setIsSupported(false)
                return
            }

            const recognition = new SpeechRecognition()
            recognition.continuous = continuous
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                setIsListening(true)
            }

            recognition.onresult = (event: any) => {
                let interimTranscript = ''
                let finalTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript
                    } else {
                        interimTranscript += transcript
                    }
                }

                if (finalTranscript) {
                    setTranscript(finalTranscript)
                    onTranscript(finalTranscript)
                    if (onFinalTranscript) {
                        onFinalTranscript(finalTranscript)
                    }
                } else if (interimTranscript) {
                    setTranscript(interimTranscript)
                }
            }

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                if (event.error !== 'no-speech') {
                    setIsListening(false)
                }
            }

            recognition.onend = () => {
                setIsListening(false)
                // Auto-restart if continuous mode
                if (continuous && isListening) {
                    try {
                        recognition.start()
                    } catch (e) {
                        // Already started
                    }
                }
            }

            recognitionRef.current = recognition

            // Auto-start if enabled
            if (autoStart) {
                startListening()
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('')
            try {
                recognitionRef.current.start()
            } catch (e) {
                // Already started
            }
        }
    }, [isListening])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }, [])

    const toggleListening = () => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }

    if (!isSupported) {
        return (
            <div className={`text-sm text-slate-500 ${className}`}>
                🎤 Voice input not supported in this browser
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={toggleListening}
                className={`relative ${isListening ? 'animate-pulse' : ''}`}
            >
                {isListening ? (
                    <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop Listening
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    </>
                ) : (
                    <>
                        <Mic className="w-5 h-5 mr-2" />
                        🎙️ Speak to Ask
                    </>
                )}
            </Button>

            {isListening && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span>Listening... "{transcript || "..."}"</span>
                </div>
            )}
        </div>
    )
}

// Voice command hook for UI control
export function useVoiceCommands(commands: { [key: string]: () => void }) {
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) return

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()

            // Check for matching commands
            for (const [command, action] of Object.entries(commands)) {
                if (transcript.includes(command.toLowerCase())) {
                    action()
                    break
                }
            }
        }

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                console.error('Voice command error:', event.error)
            }
        }

        recognition.onend = () => {
            if (isListening) {
                try {
                    recognition.start()
                } catch (e) { }
            }
        }

        recognitionRef.current = recognition

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [commands, isListening])

    const startCommands = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch (e) { }
        }
    }

    const stopCommands = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    return { isListening, startCommands, stopCommands }
}
