'use client'

import { Button } from '@/components/ui/button'
import { Mic, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { speakText } from '@/components/ui/auto-read'

interface VoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    voiceLabel: string
    language?: string
    onVoiceCommand?: () => void
    children: React.ReactNode
}

export function VoiceButton({
    voiceLabel,
    language = 'en-US',
    onVoiceCommand,
    onClick,
    children,
    className,
    ...props
}: VoiceButtonProps) {
    const [isListening, setIsListening] = useState(false)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Speak the action
        speakText(voiceLabel, 1.0, language)
        onClick?.(e)
    }

    const handleVoiceActivation = () => {
        setIsListening(true)
        speakText(`Voice mode: ${voiceLabel}`, 1.0, language)

        // Listen for voice command
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.lang = language

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript.toLowerCase()
                if (transcript.includes('yes') || transcript.includes('confirm') || transcript.includes('ok')) {
                    onVoiceCommand?.()
                    handleClick({} as any)
                }
                setIsListening(false)
            }

            recognition.onerror = () => setIsListening(false)
            recognition.start()
        }
    }

    return (
        <div className="relative inline-block group">
            <Button
                onClick={handleClick}
                className={`${className} transition-all duration-300 hover:scale-105`}
                {...props}
            >
                {children}
            </Button>

            {/* Voice activation icon */}
            <button
                onClick={handleVoiceActivation}
                className="absolute -top-2 -right-2 p-1.5 bg-purple-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-purple-700"
                title="Activate voice control"
            >
                {isListening ? (
                    <Volume2 className="w-3 h-3 text-white animate-pulse" />
                ) : (
                    <Mic className="w-3 h-3 text-white" />
                )}
            </button>
        </div>
    )
}
