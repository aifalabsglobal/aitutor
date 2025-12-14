'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Mic, MicOff, Sparkles } from 'lucide-react'

export function SimpleVoiceDemo() {
    const { data: session } = useSession()
    const [isListening, setIsListening] = useState(false)
    const [message, setMessage] = useState('Click the mic to try voice!')

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleClick = () => {
        if (!isListening) {
            setIsListening(true)
            speak('I am listening')
            setMessage('Listening... Say something!')

            setTimeout(() => {
                setIsListening(false)
                speak('Voice is working perfectly!')
                setMessage('Voice works! Click again')
            }, 3000)
        }
    }

    useEffect(() => {
        // Welcome message based on login status
        setTimeout(() => {
            if (session?.user) {
                speak(`Welcome back ${session.user.name || 'to AIFA'}! Voice is ready.`)
                setMessage(`Welcome ${session.user.name || 'back'}! Click mic to test voice`)
            } else {
                speak('Welcome to AIFA! Click the microphone to test voice.')
            }
        }, 1000)
    }, [session])

    return (
        <>
            {/* Status HUD if logged in */}
            {session?.user && (
                <div className="fixed top-6 right-6 z-40 bg-black/80 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-4 shadow-2xl min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-semibold text-xs">VOICE AI</span>
                        <div className="ml-auto flex gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-500 text-xs">ONLINE</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-300">
                        User: {session.user.name || 'Guest'}
                    </div>
                </div>
            )}

            {/* Voice button */}
            <div className="fixed bottom-8 right-8 z-50">
                {/* Message bubble */}
                <div className="absolute bottom-24 right-0 bg-white rounded-lg shadow-2xl p-4 mb-2 max-w-xs">
                    <p className="text-sm font-medium text-gray-800">{message}</p>
                </div>

                {/* Big mic button */}
                <button
                    onClick={handleClick}
                    className={`
                        w-20 h-20 rounded-full shadow-2xl
                        flex items-center justify-center
                        transition-all duration-300 transform
                        ${isListening
                            ? 'bg-red-500 scale-110 animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                        }
                    `}
                >
                    {isListening ? (
                        <MicOff className="w-10 h-10 text-white" />
                    ) : (
                        <Mic className="w-10 h-10 text-white" />
                    )}
                </button>
            </div>
        </>
    )
}
