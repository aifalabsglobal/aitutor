'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Mic, MicOff, Sparkles } from 'lucide-react'
import { useAIContext } from '@/contexts/ai-context'

/**
 * Minimalistic floating voice assistant widget
 * Combines voice controls and AI status in one small, animated element
 */
export function MinimalVoiceWidget() {
    const { data: session } = useSession()
    const router = useRouter()
    const context = useAIContext()
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isHovered, setIsHovered] = useState(false)

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.95
            utterance.pitch = 1.05
            window.speechSynthesis.speak(utterance)
        }
    }

    // Voice commands
    const handleVoiceCommand = async (text: string) => {
        const lower = text.toLowerCase()

        if (lower.includes('dashboard')) {
            speak('Going to dashboard')
            router.push('/dashboard')
        } else if (lower.includes('roadmap')) {
            speak('Opening roadmaps')
            router.push('/roadmaps')
        } else if (lower.includes('help')) {
            speak('I can help you navigate and learn. Try asking me anything!')
        }
    }

    // Speech recognition
    useEffect(() => {
        if (typeof window === 'undefined') return

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) return

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onresult = (event: any) => {
            const current = event.resultIndex
            const transcriptText = event.results[current][0].transcript
            setTranscript(transcriptText)

            if (event.results[current].isFinal) {
                handleVoiceCommand(transcriptText)
                setTranscript('')
            }
        }

        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => {
            if (isListening) recognition.start()
        }

        if (isListening) {
            recognition.start()
        } else {
            recognition.stop()
        }

        return () => recognition.stop()
    }, [isListening])

    // Welcome greeting - once per session
    useEffect(() => {
        const greetingPlayed = sessionStorage.getItem('aifa_greeting_played')

        if (!greetingPlayed && session) {
            setTimeout(() => {
                speak(session?.user ? `Hello ${session.user.name}!` : 'Hello!')
                sessionStorage.setItem('aifa_greeting_played', 'true')
            }, 1000)
        }
    }, [session])

    return (
        <>
            {/* Minimalistic floating widget - bottom right */}
            <div
                className="fixed bottom-6 right-6 z-50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Transcript bubble - shows when listening */}
                {transcript && isListening && (
                    <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl p-3 mb-2 max-w-xs border border-blue-200 animate-slide-up">
                        <p className="text-sm text-gray-800">{transcript}</p>
                    </div>
                )}

                {/* Main widget button */}
                <button
                    onClick={() => {
                        setIsListening(!isListening)
                        if (!isListening) speak('Listening')
                    }}
                    className={`
                        relative w-16 h-16 rounded-full shadow-2xl
                        flex items-center justify-center
                        transition-all duration-300 transform
                        ${isListening
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110 ring-4 ring-red-300 animate-pulse'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                        }
                    `}
                >
                    {isListening ? (
                        <MicOff className="w-8 h-8 text-white" />
                    ) : (
                        <Mic className="w-8 h-8 text-white" />
                    )}

                    {/* Animated pulse ring when active */}
                    {isListening && (
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></span>
                    )}

                    {/* AI status indicator - subtle */}
                    {session?.user && !isListening && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </button>

                {/* Compact info tooltip on hover */}
                {isHovered && !isListening && session?.user && (
                    <div className="absolute bottom-20 right-0 bg-black/90 text-white rounded-lg p-3 shadow-xl animate-fade-in min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-semibold text-cyan-400">AIFA AI</span>
                        </div>
                        {context.totalProgress > 0 && (
                            <div className="text-xs text-gray-300">
                                Progress: {context.totalProgress}%
                            </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                            Click to speak
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
