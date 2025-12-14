'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react'

interface TextToSpeechProps {
    text: string
    className?: string
}

export function TextToSpeech({ text, className }: TextToSpeechProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    useEffect(() => {
        // Check if browser supports speech synthesis
        if (typeof window !== 'undefined' && !window.speechSynthesis) {
            setIsSupported(false)
        }

        return () => {
            // Cleanup on unmount
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    // Strip HTML tags for clean reading
    const cleanText = (html: string): string => {
        const div = document.createElement('div')
        div.innerHTML = html
        return div.textContent || div.innerText || ''
    }

    const speak = () => {
        if (!window.speechSynthesis) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const cleanedText = cleanText(text)
        const utterance = new SpeechSynthesisUtterance(cleanedText)
        utteranceRef.current = utterance

        // Configure voice settings
        utterance.rate = 0.9 // Slightly slower for learning
        utterance.pitch = 1
        utterance.volume = 1

        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices()
        const englishVoice = voices.find(
            (voice) => voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || voices.find((voice) => voice.lang.startsWith('en'))

        if (englishVoice) {
            utterance.voice = englishVoice
        }

        utterance.onstart = () => {
            setIsPlaying(true)
            setIsPaused(false)
        }

        utterance.onend = () => {
            setIsPlaying(false)
            setIsPaused(false)
        }

        utterance.onerror = () => {
            setIsPlaying(false)
            setIsPaused(false)
        }

        window.speechSynthesis.speak(utterance)
    }

    const pause = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.pause()
            setIsPaused(true)
        }
    }

    const resume = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.resume()
            setIsPaused(false)
        }
    }

    const stop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            setIsPaused(false)
        }
    }

    if (!isSupported) {
        return null
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {!isPlaying ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={speak}
                    className="flex items-center gap-2"
                >
                    <Volume2 className="w-4 h-4" />
                    🎧 Read Aloud
                </Button>
            ) : (
                <>
                    {isPaused ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resume}
                            className="flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            Resume
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={pause}
                            className="flex items-center gap-2"
                        >
                            <Pause className="w-4 h-4" />
                            Pause
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={stop}
                        className="flex items-center gap-2"
                    >
                        <VolumeX className="w-4 h-4" />
                        Stop
                    </Button>
                </>
            )}
        </div>
    )
}
