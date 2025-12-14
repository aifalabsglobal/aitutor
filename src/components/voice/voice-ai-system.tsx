'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Mic, MicOff, Sparkles, MessageSquare, X } from 'lucide-react'

export function VoiceAISystem() {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [showChat, setShowChat] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
    const [isThinking, setIsThinking] = useState(false)

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1.0
            window.speechSynthesis.speak(utterance)
        }
    }

    // Voice commands
    const handleVoiceCommand = async (text: string) => {
        const lower = text.toLowerCase()

        // Navigation commands
        if (lower.includes('go to dashboard') || lower.includes('show dashboard')) {
            speak('Going to dashboard')
            router.push('/dashboard')
        }
        else if (lower.includes('go to roadmaps') || lower.includes('show roadmaps')) {
            speak('Opening roadmaps')
            router.push('/roadmaps')
        }
        else if (lower.includes('sign out') || lower.includes('log out')) {
            speak('Signing out')
            router.push('/api/auth/signout')
        }
        else if (lower.includes('help') || lower.includes('what can you do')) {
            speak('I can navigate pages, answer questions, and help you learn. Try asking me anything!')
            setShowChat(true)
        }
        // AI conversation
        else {
            setShowChat(true)
            await handleAIChat(text)
        }
    }

    // Grok AI chat
    const handleAIChat = async (userMessage: string) => {
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsThinking(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    context: {
                        page: pathname,
                        user: session?.user?.name
                    }
                })
            })

            const data = await response.json()
            const aiResponse = data.message

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
            speak(aiResponse)
        } catch (error) {
            speak('Sorry, I had trouble understanding. Please try again.')
        } finally {
            setIsThinking(false)
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

    // Welcome greeting
    useEffect(() => {
        setTimeout(() => {
            if (session?.user) {
                speak(`Welcome back ${session.user.name}! I'm your AI assistant. Press the mic or say commands.`)
            } else {
                speak('Welcome! I can help you learn. Press the microphone to get started.')
            }
        }, 1000)
    }, [session])

    return (
        <>
            {/* Status HUD */}
            {session?.user && (
                <div className="fixed top-6 right-6 z-40 bg-black/90 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-4 shadow-2xl min-w-[240px]">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <span className="text-cyan-400 font-bold text-sm tracking-wide">VOICE AI</span>
                        <div className="ml-auto flex gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-400 text-xs font-semibold">ONLINE</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-300">
                        <div className="flex justify-between">
                            <span>User:</span>
                            <span className="text-white font-mono">{session.user.name}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Status:</span>
                            <span className={isListening ? 'text-green-400' : 'text-slate-400'}>
                                {isListening ? 'Listening...' : 'Ready'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Voice Chat Window */}
            {showChat && (
                <div className="fixed top-20 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-semibold">AI Assistant</span>
                        </div>
                        <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-1 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 p-3 rounded-lg">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t">
                        <p className="text-xs text-slate-500 text-center">
                            Click mic or type your question
                        </p>
                    </div>
                </div>
            )}

            {/* Mic Button */}
            <div className="fixed bottom-8 right-8 z-50">
                {transcript && isListening && (
                    <div className="absolute bottom-24 right-0 bg-white rounded-xl shadow-2xl p-4 mb-2 max-w-xs border-2 border-blue-500">
                        <p className="text-sm font-medium text-gray-800">{transcript}</p>
                    </div>
                )}

                <button
                    onClick={() => {
                        setIsListening(!isListening)
                        if (!isListening) speak('Listening')
                    }}
                    className={`
                        w-20 h-20 rounded-full shadow-2xl
                        flex items-center justify-center
                        transition-all duration-300 transform
                        ${isListening
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110 ring-4 ring-red-300'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                        }
                    `}
                >
                    {isListening ? (
                        <MicOff className="w-10 h-10 text-white animate-pulse" />
                    ) : (
                        <Mic className="w-10 h-10 text-white" />
                    )}
                </button>

                {/* Hint */}
                {!isListening && !session?.user && (
                    <div className="absolute bottom-24 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-3 shadow-xl max-w-xs">
                        <p className="text-sm font-medium">Press mic and say "help"</p>
                    </div>
                )}
            </div>
        </>
    )
}
