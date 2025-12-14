'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react'
import { speakText } from '@/components/ui/auto-read'
import { useVoiceGreeting } from '@/hooks/use-voice-interaction'
import { ConversationalAI } from './conversational-ai'

interface VoiceCommand {
    phrases: string[]
    action: () => void
    description: string
}

export function GlobalVoiceNavigator({ language = 'en-US' }: { language?: string }) {
    const router = useRouter()
    const pathname = usePathname()

    // Auto-greet on page change
    useVoiceGreeting(language)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [recognition, setRecognition] = useState<any>(null)
    const [showCommands, setShowCommands] = useState(false)

    // Voice commands
    const commands: VoiceCommand[] = [
        {
            phrases: ['go to dashboard', 'show dashboard', 'home'],
            action: () => router.push('/dashboard'),
            description: 'Go to Dashboard'
        },
        {
            phrases: ['show roadmaps', 'my roadmaps', 'learning paths'],
            action: () => router.push('/roadmaps'),
            description: 'Show Roadmaps'
        },
        {
            phrases: ['start learning', 'continue learning', 'next lesson'],
            action: () => {
                // Navigate to most recent lesson
                router.push('/dashboard')
                speakText('Continuing your learning journey', 1.0, language)
            },
            description: 'Continue Learning'
        },
        {
            phrases: ['take quiz', 'start quiz', 'test me'],
            action: () => router.push('/quiz'),
            description: 'Start Quiz'
        },
        {
            phrases: ['talk to tutor', 'ask question', 'help me'],
            action: () => {
                speakText('How can I help you?', 1.0, language)
            },
            description: 'Talk to AI Tutor'
        },
        {
            phrases: ['read this', 'read aloud', 'speak'],
            action: () => {
                // Read current page content
                const content = document.querySelector('.lesson-content')?.textContent || ''
                if (content) speakText(content, 1.0, language)
            },
            description: 'Read Page Content'
        },
        {
            phrases: ['stop reading', 'stop speaking', 'quiet'],
            action: () => window.speechSynthesis?.cancel(),
            description: 'Stop Speaking'
        },
        {
            phrases: ['show commands', 'what can i say', 'help'],
            action: () => setShowCommands(true),
            description: 'Show Commands'
        },
    ]

    useEffect(() => {
        if (typeof window === 'undefined') return

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) return

        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = language

        recognitionInstance.onresult = (event: any) => {
            const current = event.resultIndex
            const transcriptText = event.results[current][0].transcript.toLowerCase().trim()
            setTranscript(transcriptText)

            if (event.results[current].isFinal) {
                // Check for matching command
                const matchedCommand = commands.find(cmd =>
                    cmd.phrases.some(phrase => transcriptText.includes(phrase))
                )

                if (matchedCommand) {
                    speakText('Okay!', 1.0, language)
                    matchedCommand.action()
                    setTranscript('')
                }
            }
        }

        recognitionInstance.onerror = () => {
            setIsListening(false)
        }

        recognitionInstance.onend = () => {
            if (isListening) {
                recognitionInstance.start()
            }
        }

        setRecognition(recognitionInstance)

        return () => {
            if (recognitionInstance) {
                recognitionInstance.stop()
            }
        }
    }, [language])

    const toggleListening = () => {
        if (!recognition) return

        if (isListening) {
            recognition.stop()
            setIsListening(false)
            setTranscript('')
        } else {
            recognition.start()
            setIsListening(true)
            speakText('I\'m listening', 1.0, language)
        }
    }

    // Keyboard shortcut: Ctrl/Cmd + K
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                toggleListening()
            }
        }

        window.addEventListener('keydown', handleKeyboard)
        return () => window.removeEventListener('keydown', handleKeyboard)
    }, [isListening])

    return (
        <>
            {/* Floating voice button */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="relative">
                    {/* Pulse effect when listening */}
                    {isListening && (
                        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
                    )}

                    <Button
                        size="lg"
                        onClick={toggleListening}
                        className={`
                            w-16 h-16 rounded-full shadow-2xl
                            transition-all duration-300 transform
                            ${isListening
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 scale-110'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
                            }
                        `}
                    >
                        {isListening ? (
                            <MicOff className="w-8 h-8 text-white" />
                        ) : (
                            <Mic className="w-8 h-8 text-white" />
                        )}
                    </Button>
                </div>

                {/* Transcript bubble */}
                {isListening && transcript && (
                    <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 max-w-xs animate-slide-up">
                        <p className="text-sm text-slate-700">{transcript}</p>
                    </div>
                )}
            </div>

            {/* Commands help modal */}
            {showCommands && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Volume2 className="w-8 h-8 text-blue-600" />
                                <h3 className="text-2xl font-bold text-slate-800">Voice Commands</h3>
                            </div>
                            <Button variant="ghost" onClick={() => setShowCommands(false)}>
                                Close
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {commands.map((cmd, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg animate-slide-in-right"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <h4 className="font-semibold text-slate-800 mb-2">{cmd.description}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {cmd.phrases.map((phrase, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 border border-slate-200"
                                            >
                                                "{phrase}"
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-slate-600">
                                <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-white rounded border">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white rounded border">K</kbd> to activate voice control
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating hint for first-time users */}
            {!isListening && pathname === '/dashboard' && (
                <div className="fixed bottom-28 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-4 max-w-xs animate-bounce-subtle">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Try voice control! Say "show commands"
                    </p>
                </div>
            )}

            {/* Conversational AI - always available */}
            <ConversationalAI language={language} context={pathname.substring(1)} />
        </>
    )
}
