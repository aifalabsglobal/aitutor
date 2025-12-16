'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Volume2, Search, Globe } from 'lucide-react'
import { speakText } from '@/components/ui/auto-read'
import { SUPPORTED_LANGUAGES } from '@/lib/translations'

interface LanguageSelectorProps {
    onSelect: (languageCode: string) => void
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
    const [hoveredLang, setHoveredLang] = useState<string | null>(null)
    const [selectedLang, setSelectedLang] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Group languages by region
    const indianLanguages = SUPPORTED_LANGUAGES.filter(l => l.code.includes('-IN') || l.code === 'ur-PK')
    const otherLanguages = SUPPORTED_LANGUAGES.filter(l => !l.code.includes('-IN') && l.code !== 'ur-PK')

    // Filter based on search
    const filteredIndian = indianLanguages.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const filteredOther = otherLanguages.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelect = (langCode: string) => {
        setSelectedLang(langCode)
        const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
        if (lang) {
            // Speak greeting in selected language
            speakText(`Hello! Ready to learn?`, 1.0, langCode, { conversational: true })
        }

        // Delay to let greeting play, then proceed
        setTimeout(() => {
            onSelect(langCode)
        }, 1500)
    }

    const previewLanguage = (langCode: string) => {
        speakText(`Hello! Ready to learn?`, 1.0, langCode, { conversational: true })
    }

    const LanguageCard = ({ lang, index }: { lang: typeof SUPPORTED_LANGUAGES[0], index: number }) => (
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
            style={{ animationDelay: `${index * 0.02}s` }}
            onMouseEnter={() => setHoveredLang(lang.code)}
            onMouseLeave={() => setHoveredLang(null)}
            onClick={() => handleSelect(lang.code)}
        >
            <CardContent className="p-4 text-center relative">
                {/* Preview speaker icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        previewLanguage(lang.code)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-200"
                    title="Preview language"
                >
                    <Volume2 className="w-3 h-3 text-blue-600" />
                </button>

                {/* Flag emoji */}
                <div className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
                    {lang.flag}
                </div>

                {/* Native name */}
                <h3 className="text-sm font-bold text-slate-800 mb-0.5 line-clamp-1">
                    {lang.nativeName}
                </h3>

                {/* English name */}
                <p className="text-xs text-slate-500 line-clamp-1">
                    {lang.name}
                </p>

                {/* Selected indicator */}
                {selectedLang === lang.code && (
                    <div className="mt-2 inline-block px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full animate-fade-in">
                        ✓
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-7xl my-8">
                {/* Header */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="inline-block p-3 bg-white rounded-full shadow-lg mb-4 animate-bounce-subtle">
                        <Globe className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        Welcome to AIFA
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 font-medium">
                        Choose your language / अपनी भाषा चुनें
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        Click 🔊 to preview • {SUPPORTED_LANGUAGES.length}+ languages supported
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-md mx-auto mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search languages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Indian Languages Section */}
                {filteredIndian.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>🇮🇳</span>
                            <span>Indian Languages</span>
                            <span className="text-sm font-normal text-slate-500">({filteredIndian.length})</span>
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {filteredIndian.map((lang, index) => (
                                <LanguageCard key={lang.code} lang={lang} index={index} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Languages Section */}
                {filteredOther.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>🌍</span>
                            <span>World Languages</span>
                            <span className="text-sm font-normal text-slate-500">({filteredOther.length})</span>
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {filteredOther.map((lang, index) => (
                                <LanguageCard key={lang.code} lang={lang} index={filteredOther.length + index} />
                            ))}
                        </div>
                    </div>
                )}

                {/* No results */}
                {filteredIndian.length === 0 && filteredOther.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">No languages found matching "{searchTerm}"</p>
                    </div>
                )}

                {/* Helper text */}
                <div className="mt-8 text-center animate-fade-in">
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
