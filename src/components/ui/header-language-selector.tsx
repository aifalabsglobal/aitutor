'use client'

import { useState, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANGUAGES } from '@/lib/translations'
import { useRouter } from 'next/navigation'

export function HeaderLanguageSelector() {
    const router = useRouter()
    const [currentLanguage, setCurrentLanguage] = useState('en-US')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Load current language from localStorage
        const savedLanguage = localStorage.getItem('selectedLanguage')
        if (savedLanguage) {
            setCurrentLanguage(savedLanguage)
        }
    }, [])

    const handleLanguageChange = async (languageCode: string) => {
        // Update localStorage
        localStorage.setItem('selectedLanguage', languageCode)
        setCurrentLanguage(languageCode)
        setIsOpen(false)

        // Dispatch custom event to trigger re-renders in all components
        window.dispatchEvent(new Event('languageChanged'))

        // Update in database if user is logged in
        try {
            await fetch('/api/user/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: languageCode })
            })
        } catch (error) {
            console.log('Not logged in, language saved locally')
        }

        // Small delay to let state update, then refresh
        setTimeout(() => {
            window.location.reload()
        }, 100)
    }

    const getCurrentLanguageInfo = () => {
        return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
    }

    const currentLang = getCurrentLanguageInfo()

    // Group languages by region
    const indianLanguages = SUPPORTED_LANGUAGES.filter(lang =>
        lang.code.includes('-IN') || lang.code === 'ur-PK'
    )
    const worldLanguages = SUPPORTED_LANGUAGES.filter(lang =>
        !lang.code.includes('-IN') && lang.code !== 'ur-PK'
    )

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-blue-200 hover:bg-blue-50"
                >
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline text-sm">{currentLang.flag} {currentLang.nativeName}</span>
                    <span className="sm:hidden text-sm">{currentLang.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                    🇮🇳 Indian Languages
                </DropdownMenuLabel>
                {indianLanguages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span className="text-sm">{lang.nativeName}</span>
                            </span>
                            {currentLanguage === lang.code && (
                                <Check className="w-4 h-4 text-blue-600" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                    🌍 World Languages
                </DropdownMenuLabel>
                {worldLanguages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span className="text-sm">{lang.nativeName}</span>
                            </span>
                            {currentLanguage === lang.code && (
                                <Check className="w-4 h-4 text-blue-600" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
