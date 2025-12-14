'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, X, Volume2, Sparkles } from 'lucide-react'
import { VoiceInput } from '@/components/ui/voice-input'
import { speakText } from '@/components/ui/auto-read'

interface ConversationalAIProps {
    language?: string
    context?: string
}

export function ConversationalAI({ language = 'en-US', context }: ConversationalAIProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
    const [isThinking, setIsThinking] = useState(false)

    // Auto-open and greet on dashboard
    useEffect(() => {
        if (context === 'dashboard') {
            const timer = setTimeout(() => {
                setIsOpen(true)
                const greeting = language === 'hi-IN'
                    ? 'नमस्ते! मैं आपका AI शिक्षक हूं। मैं आपकी कैसे मदद कर सकता हूं?'
                    : language === 'es-ES'
                        ? '¡Hola! Soy tu tutor AI. ¿Cómo puedo ayudarte?'
                        : 'Hi! I\'m your AI tutor. How can I help you today?'

                speakText(greeting, 1.0, language)
                setMessages([{ role: 'assistant', content: greeting }])
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [context])

    const handleVoiceInput = async (text: string) => {
        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: text }])
        setIsThinking(true)

        try {
            // Call AI with full context
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    language,
                    context: contextSummary,
                    userContext: {
                        currentLesson: aiContext.currentLesson,
                        currentRoadmap: aiContext.currentRoadmap,
                        learningGoals: aiContext.learningGoals,
                        recentQuestions: aiContext.recentQuestions
                    }
                })
            })

            const data = await response.json()
            const aiResponse = data.message

            // Add AI response
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

            // Speak the response
            speakText(aiResponse, 1.0, language)
        } catch (error) {
            console.error('AI error:', error)
            const errorMsg = 'Sorry, I had trouble understanding. Can you try again?'
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }])
            speakText(errorMsg, 1.0, language)
        } finally {
            setIsThinking(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-28 right-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-40 animate-bounce-subtle"
            >
                <Sparkles className="w-6 h-6" />
            </button>
        )
    }

    return (
        <Card className="fixed bottom-28 right-6 w-96 max-h-[500px] shadow-2xl z-40 animate-slide-up">
            <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-semibold">AI Tutor</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/20 p-1 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50 to-white">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-purple-200'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white border border-purple-200 p-3 rounded-lg">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Voice Input */}
                <div className="p-4 border-t">
                    <VoiceInput
                        onTranscript={handleVoiceInput}
                        language={language}
                        placeholder="Speak your question..."
                        className="w-full"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
