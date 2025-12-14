'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Volume2 } from 'lucide-react'
import { speakText } from '@/components/ui/auto-read'

const LANGUAGES = [
    { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', greeting: 'Hello! Ready to learn?' },
    { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', greeting: 'नमस्ते! सीखने के लिए तैयार हैं?' },
    { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', greeting: '¡Hola! ¿Listo para aprender?' },
    { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', greeting: 'Bonjour! Prêt à apprendre?' },
    { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', greeting: 'Hallo! Bereit zu lernen?' },
    { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', greeting: '你好！准备好学习了吗？' },
    { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', greeting: 'こんにちは！学ぶ準備はできていますか？' },
    { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', greeting: 'مرحبا! مستعد للتعلم؟' },
    { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', greeting: 'Olá! Pronto para aprender?' },
    { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', greeting: 'Привет! Готовы учиться?' },
    { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', greeting: '안녕하세요! 배울 준비가 되셨나요?' },
    { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', greeting: 'হ্যালো! শিখতে প্রস্তুত?' },
    { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', greeting: 'హలో! నేర్చుకోవడానికి సిద్ధంగా ఉన్నారా?' },
    { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', greeting: 'வணக்கம்! கற்க தயாரா?' },
    { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', greeting: 'Ciao! Pronto a imparare?' },
    { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', greeting: 'Merhaba! Öğrenmeye hazır mısın?' },
]

interface LanguageSelectorProps {
    onSelect: (languageCode: string) => void
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
    const [hoveredLang, setHoveredLang] = useState<string | null>(null)
    const [selectedLang, setSelectedLang] = useState<string | null>(null)

    const handleSelect = (lang: typeof LANGUAGES[0]) => {
        setSelectedLang(lang.code)
        // Speak greeting in selected language
        speakText(lang.greeting, 1.0, lang.code)

        // Delay to let greeting play, then proceed
        setTimeout(() => {
            onSelect(lang.code)
        }, 1500)
    }

    const previewLanguage = (lang: typeof LANGUAGES[0]) => {
        speakText(lang.greeting, 1.0, lang.code)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {/* Warm, friendly header */}
                <div className="text-center mb-12 animate-slide-up">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6 animate-bounce-subtle">
                        <Globe className="w-12 h-12 text-blue-600" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Welcome to AIFA
                    </h1>
                    <p className="text-xl text-slate-600 font-medium">
                        Let's start by choosing your language
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        Click the speaker icon to hear a preview
                    </p>
                </div>

                {/* Language grid with warm, friendly design */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
                    {LANGUAGES.map((lang, index) => (
                        <Card
                            key={lang.code}
                            className={`
                                group cursor-pointer transition-all duration-300 transform
                                hover:scale-105 hover:shadow-xl
                                ${selectedLang === lang.code
                                    ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                                    : 'hover:ring-2 hover:ring-blue-300'
                                }
                                ${hoveredLang === lang.code ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-white'}
                                animate-scale-in
                            `}
                            style={{ animationDelay: `${index * 0.05}s` }}
                            onMouseEnter={() => setHoveredLang(lang.code)}
                            onMouseLeave={() => setHoveredLang(null)}
                            onClick={() => handleSelect(lang)}
                        >
                            <CardContent className="p-6 text-center relative">
                                {/* Preview speaker icon */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        previewLanguage(lang)
                                    }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-200"
                                >
                                    <Volume2 className="w-4 h-4 text-blue-600" />
                                </button>

                                {/* Flag emoji - large and friendly */}
                                <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
                                    {lang.flag}
                                </div>

                                {/* Native name - prominent */}
                                <h3 className="text-xl font-bold text-slate-800 mb-1">
                                    {lang.nativeName}
                                </h3>

                                {/* English name - smaller */}
                                <p className="text-sm text-slate-500">
                                    {lang.name}
                                </p>

                                {/* Selected indicator */}
                                {selectedLang === lang.code && (
                                    <div className="mt-3 inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full animate-fade-in">
                                        Selected ✓
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Friendly helper text */}
                <div className="mt-12 text-center animate-fade-in">
                    <p className="text-slate-600 text-sm">
                        Don't see your language?{' '}
                        <button className="text-blue-600 hover:text-blue-700 font-medium underline">
                            Request it here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
