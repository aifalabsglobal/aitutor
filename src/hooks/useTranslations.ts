import { useState, useEffect } from 'react'
import { useAIContext } from '@/contexts/ai-context'
import { getTranslation } from '@/lib/translations'

/**
 * Custom hook for translations
 * Automatically uses user's preferred language and updates when changed
 */
export function useTranslations() {
    const context = useAIContext()
    const [currentLang, setCurrentLang] = useState('en-US')

    // Listen for language changes in localStorage
    useEffect(() => {
        const updateLanguage = () => {
            const savedLang = localStorage.getItem('selectedLanguage')
            const lang = savedLang || context.preferredLanguage || 'en-US'
            setCurrentLang(lang)
        }

        // Initial load
        updateLanguage()

        // Listen for storage changes (cross-tab)
        window.addEventListener('storage', updateLanguage)

        // Listen for custom language change events
        window.addEventListener('languageChanged', updateLanguage)

        return () => {
            window.removeEventListener('storage', updateLanguage)
            window.removeEventListener('languageChanged', updateLanguage)
        }
    }, [context.preferredLanguage])

    const t = (key: string, params?: Record<string, string>): string => {
        return getTranslation(currentLang, key, params)
    }

    return { t, currentLang }
}
