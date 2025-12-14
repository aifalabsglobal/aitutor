'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { speakText } from '@/components/ui/auto-read'

// Page greetings in different languages
const PAGE_GREETINGS: Record<string, Record<string, string>> = {
    '/dashboard': {
        'en-US': 'Welcome back! Ready to continue learning?',
        'hi-IN': 'वापस स्वागत है! सीखना जारी रखने के लिए तैयार हैं?',
        'es-ES': '¡Bienvenido de nuevo! ¿Listo para continuar aprendiendo?',
    },
    '/roadmaps': {
        'en-US': 'Here are your learning paths. Which one would you like to explore?',
        'hi-IN': 'यहां आपके सीखने के मार्ग हैं। आप किसे एक्सप्लोर करना चाहेंगे?',
        'es-ES': 'Aquí están tus rutas de aprendizaje. ¿Cuál te gustaría explorar?',
    },
    '/quiz': {
        'en-US': 'Time to test your knowledge! Are you ready?',
        'hi-IN': 'अपने ज्ञान का परीक्षण करने का समय! क्या आप तैयार हैं?',
        'es-ES': '¡Hora de poner a prueba tu conocimiento! ¿Estás listo?',
    },
    '/onboarding': {
        'en-US': 'Welcome to AIFA! Lets personalize your learning journey.',
        'hi-IN': 'AIFA में आपका स्वागत है! चलिए आपकी सीखने की यात्रा को व्यक्तिगत बनाते हैं।',
        'es-ES': '¡Bienvenido a AIFA! Personalicemos tu viaje de aprendizaje.',
    }
}

export function useVoiceGreeting(language: string = 'en-US') {
    const pathname = usePathname()

    useEffect(() => {
        // Wait a bit for page to load
        const timer = setTimeout(() => {
            const greetings = PAGE_GREETINGS[pathname]
            if (greetings) {
                const greeting = greetings[language] || greetings['en-US']
                speakText(greeting, 1.0, language)
            }
        }, 800)

        return () => clearTimeout(timer)
    }, [pathname, language])
}

// Voice feedback for actions
export function useVoiceFeedback(language: string = 'en-US') {
    const speak = (messageKey: string, customMessage?: string) => {
        const messages: Record<string, Record<string, string>> = {
            buttonClick: {
                'en-US': 'Okay',
                'hi-IN': 'ठीक है',
                'es-ES': 'Vale',
            },
            success: {
                'en-US': 'Success!',
                'hi-IN': 'सफलता!',
                'es-ES': '¡Éxito!',
            },
            error: {
                'en-US': 'Something went wrong. Please try again.',
                'hi-IN': 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।',
                'es-ES': 'Algo salió mal. Por favor, inténtalo de nuevo.',
            },
            loading: {
                'en-US': 'Loading, please wait...',
                'hi-IN': 'लोड हो रहा है, कृपया प्रतीक्षा करें...',
                'es-ES': 'Cargando, por favor espera...',
            },
            saved: {
                'en-US': 'Saved successfully!',
                'hi-IN': 'सफलतापूर्वक सहेजा गया!',
                'es-ES': '¡Guardado exitosamente!',
            },
            lessonComplete: {
                'en-US': 'Great job! Lesson completed. Ready for the next one?',
                'hi-IN': 'बहुत बढ़िया! पाठ पूरा हुआ। अगले के लिए तैयार हैं?',
                'es-ES': '¡Buen trabajo! Lección completada. ¿Listo para la siguiente?',
            },
            quizStarting: {
                'en-US': 'Starting the quiz now. Good luck!',
                'hi-IN': 'अब क्विज़ शुरू हो रही है। शुभकामनाएँ!',
                'es-ES': 'Iniciando el cuestionario ahora. ¡Buena suerte!',
            },
            correctAnswer: {
                'en-US': 'Correct! Well done!',
                'hi-IN': 'सही! बहुत अच्छा!',
                'es-ES': '¡Correcto! ¡Bien hecho!',
            },
            wrongAnswer: {
                'en-US': 'Not quite right. Let me explain...',
                'hi-IN': 'बिल्कुल सही नहीं। मुझे समझाने दीजिए...',
                'es-ES': 'No del todo correcto. Déjame explicarte...',
            }
        }

        const message = customMessage || messages[messageKey]?.[language] || messages[messageKey]?.['en-US'] || messageKey
        speakText(message, 1.0, language)
    }

    return { speak }
}

// Voice-enabled button wrapper
export function VoiceButton({
    children,
    onClick,
    voiceLabel,
    language = 'en-US',
    className = '',
    ...props
}: any) {
    const { speak } = useVoiceFeedback(language)

    const handleClick = (e: any) => {
        speak('buttonClick', voiceLabel)
        onClick?.(e)
    }

    return (
        <button
            onClick={handleClick}
            className={`${className} transition-transform hover:scale-105`}
            {...props}
        >
            {children}
        </button>
    )
}
