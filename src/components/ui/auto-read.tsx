'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Pause, Play, Globe } from 'lucide-react'

interface AutoReadProps {
    text: string
    autoStart?: boolean
    onStart?: () => void
    onEnd?: () => void
    className?: string
}

// Comprehensive list of world languages supported by Web Speech API
const LANGUAGES = [
    { code: 'auto', name: 'Auto-Detect', flag: '🌍' },
    // Major World Languages
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ur-PK', name: 'اردو', flag: '🇵🇰' },
    // European Languages
    { code: 'nl-NL', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl-PL', name: 'Polski', flag: '🇵🇱' },
    { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'sv-SE', name: 'Svenska', flag: '🇸🇪' },
    { code: 'da-DK', name: 'Dansk', flag: '🇩🇰' },
    { code: 'fi-FI', name: 'Suomi', flag: '🇫🇮' },
    { code: 'no-NO', name: 'Norsk', flag: '🇳🇴' },
    { code: 'cs-CZ', name: 'Čeština', flag: '🇨🇿' },
    { code: 'el-GR', name: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'ro-RO', name: 'Română', flag: '🇷🇴' },
    { code: 'hu-HU', name: 'Magyar', flag: '🇭🇺' },
    { code: 'uk-UA', name: 'Українська', flag: '🇺🇦' },
    // Asian Languages
    { code: 'th-TH', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi-VN', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id-ID', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms-MY', name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'fil-PH', name: 'Filipino', flag: '🇵🇭' },
    // Middle Eastern & African
    { code: 'he-IL', name: 'עברית', flag: '🇮🇱' },
    { code: 'fa-IR', name: 'فارسی', flag: '🇮🇷' },
    { code: 'sw-KE', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
    // Latin American
    { code: 'es-AR', name: 'Español (Argentina)', flag: '🇦🇷' },
    { code: 'es-CO', name: 'Español (Colombia)', flag: '🇨🇴' },
    { code: 'es-CL', name: 'Español (Chile)', flag: '🇨🇱' },
]

export function AutoRead({
    text,
    autoStart = true,
    onStart,
    onEnd,
    className
}: AutoReadProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [rate, setRate] = useState(0.9)
    const [language, setLanguage] = useState('auto')
    const [showLanguages, setShowLanguages] = useState(false)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const hasAutoStarted = useRef(false)

    // Enhanced text cleaning for better speech
    const cleanText = useCallback((html: string): string => {
        if (typeof document === 'undefined') return html
        const div = document.createElement('div')
        div.innerHTML = html

        let text = div.textContent || div.innerText || ''

        // Remove ALL emojis and special characters
        text = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        text = text.replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
        text = text.replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
        text = text.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
        text = text.replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
        text = text.replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats

        // Remove special punctuation for better reading
        text = text.replace(/[•●○]/g, ', ')
        text = text.replace(/[→←↑↓]/g, ' to ')
        text = text.replace(/[─│┌┐└┘├┤┬┴┼]/g, ' ')
        text = text.replace(/[=]{2,}/g, ' ')
        text = text.replace(/[-]{3,}/g, '. ')

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim()
        text = text.replace(/\s([.,!?])/g, '$1')

        return text
    }, [])

    // Detect language from text
    const detectLanguage = useCallback((text: string): string => {
        if (language !== 'auto') return language

        // Character-set based detection
        const patterns = [
            { pattern: /[\u0900-\u097F]/, lang: 'hi-IN' },      // Hindi
            { pattern: /[\u0600-\u06FF]/, lang: 'ar-SA' },      // Arabic
            { pattern: /[\u4E00-\u9FFF]/, lang: 'zh-CN' },      // Chinese
            { pattern: /[\u3040-\u309F\u30A0-\u30FF]/, lang: 'ja-JP' }, // Japanese
            { pattern: /[\u0980-\u09FF]/, lang: 'bn-IN' },      // Bengali
            { pattern: /[\u0C00-\u0C7F]/, lang: 'te-IN' },      // Telugu
            { pattern: /[\u0B80-\u0BFF]/, lang: 'ta-IN' },      // Tamil
            { pattern: /[\u0D00-\u0D7F]/, lang: 'ml-IN' },      // Malayalam
            { pattern: /[\u0A80-\u0AFF]/, lang: 'gu-IN' },      // Gujarati
            { pattern: /[\u0C80-\u0CFF]/, lang: 'kn-IN' },      // Kannada
            { pattern: /[\u0400-\u04FF]/, lang: 'ru-RU' },      // Russian
            { pattern: /[\u0E00-\u0E7F]/, lang: 'th-TH' },      // Thai
            { pattern: /[\u0590-\u05FF]/, lang: 'he-IL' },      // Hebrew
            { pattern: /[\uAC00-\uD7AF]/, lang: 'ko-KR' },      // Korean
        ]

        for (const { pattern, lang } of patterns) {
            if (pattern.test(text)) return lang
        }

        return 'en-US'
    }, [language])

    useEffect(() => {
        if (typeof window !== 'undefined' && !window.speechSynthesis) {
            setIsSupported(false)
        }

        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    useEffect(() => {
        if (autoStart && text && !hasAutoStarted.current && isSupported) {
            hasAutoStarted.current = true
            const timer = setTimeout(() => {
                speak()
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [text, autoStart, isSupported])

    const speak = useCallback(() => {
        if (!window.speechSynthesis) return

        window.speechSynthesis.cancel()

        const cleanedText = cleanText(text)
        if (!cleanedText) return

        const utterance = new SpeechSynthesisUtterance(cleanedText)
        utteranceRef.current = utterance

        utterance.rate = rate
        utterance.pitch = 1
        utterance.volume = 1

        const detectedLang = detectLanguage(cleanedText)
        utterance.lang = detectedLang

        const voices = window.speechSynthesis.getVoices()
        const languageVoice = voices.find(v => v.lang.startsWith(detectedLang.split('-')[0]))
        const preferredVoice = voices.find(
            (v) => v.lang === detectedLang && (v.name.includes('Google') || v.name.includes('Microsoft'))
        ) || languageVoice || voices[0]

        if (preferredVoice) {
            utterance.voice = preferredVoice
        }

        utterance.onstart = () => {
            setIsPlaying(true)
            setIsPaused(false)
            onStart?.()
        }

        utterance.onend = () => {
            setIsPlaying(false)
            setIsPaused(false)
            onEnd?.()
        }

        utterance.onerror = () => {
            setIsPlaying(false)
            setIsPaused(false)
        }

        window.speechSynthesis.speak(utterance)
    }, [text, rate, language, cleanText, detectLanguage, onStart, onEnd])

    const pause = () => {
        window.speechSynthesis?.pause()
        setIsPaused(true)
    }

    const resume = () => {
        window.speechSynthesis?.resume()
        setIsPaused(false)
    }

    const stop = () => {
        window.speechSynthesis?.cancel()
        setIsPlaying(false)
        setIsPaused(false)
    }

    if (!isSupported) return null

    return (
        <div className={`relative flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
            <div className="flex items-center gap-1">
                {!isPlaying ? (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={speak}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
                    >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Read Lesson
                    </Button>
                ) : (
                    <>
                        {isPaused ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resume}
                                className="transition-transform duration-200 hover:scale-105"
                            >
                                <Play className="w-4 h-4 mr-1" />
                                Resume
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={pause}
                                className="transition-transform duration-200 hover:scale-105"
                            >
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={stop}
                            className="transition-transform duration-200 hover:scale-105"
                        >
                            <VolumeX className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>

            {isPlaying && (
                <div className="flex items-center gap-2 animate-fade-in">
                    <div className="flex gap-1">
                        <span className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-6 bg-green-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-3 bg-green-500 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                        <span className="w-1 h-5 bg-green-500 rounded animate-pulse" style={{ animationDelay: '450ms' }} />
                    </div>
                    <span className="text-sm text-green-700 font-medium">
                        {isPaused ? 'Paused' : 'Reading aloud...'}
                    </span>
                </div>
            )}

            <div className="ml-auto flex items-center gap-3">
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLanguages(!showLanguages)}
                        disabled={isPlaying}
                        className="transition-transform duration-200 hover:scale-105"
                    >
                        <Globe className="w-4 h-4 mr-1" />
                        <span className="text-xs">
                            {LANGUAGES.find(l => l.code === language)?.flag || '🌍'}
                        </span>
                    </Button>
                    {showLanguages && (
                        <div className="absolute right-0 top-full mt-2 w-64 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border z-50 animate-fade-in">
                            <div className="p-2 grid grid-cols-1 gap-1">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code)
                                            setShowLanguages(false)
                                        }}
                                        className={`text-left px-3 py-2 rounded text-xs hover:bg-blue-50 transition-colors ${language === lang.code ? 'bg-blue-100 font-semibold' : ''
                                            }`}
                                    >
                                        <span className="mr-2">{lang.flag}</span>
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Speed:</span>
                    <select
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="text-xs border rounded px-1 py-0.5 transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="0.7">0.7x</option>
                        <option value="0.9">0.9x</option>
                        <option value="1.0">1.0x</option>
                        <option value="1.2">1.2x</option>
                        <option value="1.5">1.5x</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

// Utility to speak any text with multi-language support
export function speakText(text: string, rate: number = 0.9, lang: string = 'en-US'): Promise<void> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            resolve()
            return
        }

        window.speechSynthesis.cancel()

        // Clean text
        let cleanedText = text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[•●○]/g, ', ')
            .replace(/\s+/g, ' ')
            .trim()

        const utterance = new SpeechSynthesisUtterance(cleanedText)
        utterance.rate = rate
        utterance.lang = lang
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
        window.speechSynthesis.speak(utterance)
    })
}
