/**
 * Conversational Voice Configuration
 * 
 * This module provides advanced voice settings for natural, human-like speech
 * across multiple languages and contexts.
 */

export interface VoicePersonality {
    name: string
    rate: number
    pitch: number
    volume: number
    description: string
}

export interface ConversationContext {
    greeting?: boolean
    teaching?: boolean
    encouraging?: boolean
    questioning?: boolean
    celebrating?: boolean
}

// Voice personalities for different contexts
export const VOICE_PERSONALITIES: Record<string, VoicePersonality> = {
    friendly: {
        name: 'Friendly',
        rate: 0.92,
        pitch: 1.08,
        volume: 1.0,
        description: 'Warm and welcoming tone'
    },
    professional: {
        name: 'Professional',
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        description: 'Clear and authoritative'
    },
    energetic: {
        name: 'Energetic',
        rate: 1.0,
        pitch: 1.12,
        volume: 1.0,
        description: 'Enthusiastic and motivating'
    },
    calm: {
        name: 'Calm',
        rate: 0.88,
        pitch: 0.95,
        volume: 0.9,
        description: 'Soothing and relaxed'
    },
    tutor: {
        name: 'Tutor',
        rate: 0.9,
        pitch: 1.05,
        volume: 1.0,
        description: 'Patient and explanatory'
    }
}

// Conversational templates for different contexts
export const CONVERSATION_TEMPLATES = {
    greetings: {
        'en-US': [
            "Hey there! Welcome back to AIFA.",
            "Hi! Great to see you again.",
            "Hello! Ready to learn something amazing?",
            "Welcome! Let's make today count.",
        ],
        'hi-IN': [
            "नमस्ते! AIFA में आपका स्वागत है।",
            "हाय! आपसे मिलकर खुशी हुई।",
            "नमस्कार! आज कुछ नया सीखने के लिए तैयार हैं?",
        ],
        'es-ES': [
            "¡Hola! Bienvenido de nuevo a AIFA.",
            "¡Hola! Qué bueno verte de nuevo.",
            "¡Bienvenido! Vamos a aprender algo increíble.",
        ]
    },
    encouragement: {
        'en-US': [
            "You're doing great! Keep it up!",
            "Awesome progress! I'm impressed.",
            "That's exactly right! Well done!",
            "You're really getting the hang of this!",
        ],
        'hi-IN': [
            "बहुत बढ़िया! आप शानदार कर रहे हैं!",
            "वाह! आप बहुत अच्छा कर रहे हैं!",
            "बिल्कुल सही! बहुत अच्छे!",
        ],
        'es-ES': [
            "¡Lo estás haciendo genial! ¡Sigue así!",
            "¡Excelente progreso! Estoy impresionado.",
            "¡Eso es exactamente correcto! ¡Bien hecho!",
        ]
    },
    transitions: {
        'en-US': [
            "Now, let's move on to...",
            "Alright, next up we have...",
            "Great! Now, here's something interesting...",
            "Perfect! Let's explore...",
        ],
        'hi-IN': [
            "अब, आइए आगे बढ़ते हैं...",
            "अच्छा, अब हम सीखेंगे...",
            "बढ़िया! अब यहाँ कुछ दिलचस्प है...",
        ],
        'es-ES': [
            "Ahora, pasemos a...",
            "Muy bien, a continuación tenemos...",
            "¡Genial! Ahora, aquí hay algo interesante...",
        ]
    },
    questions: {
        'en-US': [
            "So, what do you think?",
            "Does that make sense to you?",
            "Are you following along?",
            "Any questions so far?",
        ],
        'hi-IN': [
            "तो, आप क्या सोचते हैं?",
            "क्या यह समझ में आया?",
            "क्या आप समझ रहे हैं?",
        ],
        'es-ES': [
            "Entonces, ¿qué piensas?",
            "¿Tiene sentido para ti?",
            "¿Lo estás siguiendo?",
        ]
    },
    celebration: {
        'en-US': [
            "Fantastic! You've completed this lesson!",
            "Congratulations! You're making awesome progress!",
            "Well done! You've mastered this topic!",
            "Amazing work! You should be proud!",
        ],
        'hi-IN': [
            "शानदार! आपने यह पाठ पूरा कर लिया!",
            "बधाई हो! आप बहुत अच्छी प्रगति कर रहे हैं!",
            "बहुत बढ़िया! आपने यह विषय सीख लिया!",
        ],
        'es-ES': [
            "¡Fantástico! ¡Has completado esta lección!",
            "¡Felicitaciones! ¡Estás haciendo un progreso increíble!",
            "¡Bien hecho! ¡Has dominado este tema!",
        ]
    }
}

// Natural language voice preferences per language
export const LANGUAGE_VOICE_PREFERENCES = {
    'en-US': {
        preferredVoices: ['Google US English', 'Microsoft Zira', 'Samantha', 'Karen'],
        fallbackVoices: ['English United States'],
        characteristics: {
            rate: 0.92,
            pitch: 1.05,
            pauseMultiplier: 1.0
        }
    },
    'hi-IN': {
        preferredVoices: ['Google हिन्दी', 'Microsoft Hemant', 'Hindi India'],
        fallbackVoices: ['Hindi'],
        characteristics: {
            rate: 0.88, // Slightly slower for clarity
            pitch: 1.0,
            pauseMultiplier: 1.2
        }
    },
    'es-ES': {
        preferredVoices: ['Google español', 'Microsoft Helena', 'Spanish Spain'],
        fallbackVoices: ['Spanish'],
        characteristics: {
            rate: 0.95,
            pitch: 1.08,
            pauseMultiplier: 1.0
        }
    },
    'fr-FR': {
        preferredVoices: ['Google français', 'Microsoft Hortense', 'French France'],
        fallbackVoices: ['French'],
        characteristics: {
            rate: 0.9,
            pitch: 1.02,
            pauseMultiplier: 1.0
        }
    },
    'de-DE': {
        preferredVoices: ['Google Deutsch', 'Microsoft Hedda', 'German Germany'],
        fallbackVoices: ['German'],
        characteristics: {
            rate: 0.92,
            pitch: 0.98,
            pauseMultiplier: 1.0
        }
    },
    'ja-JP': {
        preferredVoices: ['Google 日本語', 'Microsoft Haruka', 'Kyoko'],
        fallbackVoices: ['Japanese'],
        characteristics: {
            rate: 0.85,
            pitch: 1.1,
            pauseMultiplier: 1.3
        }
    },
    'zh-CN': {
        preferredVoices: ['Google 普通话', 'Microsoft Huihui', 'Ting-Ting'],
        fallbackVoices: ['Chinese'],
        characteristics: {
            rate: 0.88,
            pitch: 1.05,
            pauseMultiplier: 1.2
        }
    },
    'ar-SA': {
        preferredVoices: ['Google العربية', 'Microsoft Naayf', 'Arabic'],
        fallbackVoices: ['Arabic Saudi Arabia'],
        characteristics: {
            rate: 0.85,
            pitch: 1.0,
            pauseMultiplier: 1.3
        }
    },
    'ru-RU': {
        preferredVoices: ['Google русский', 'Microsoft Irina', 'Milena'],
        fallbackVoices: ['Russian'],
        characteristics: {
            rate: 0.9,
            pitch: 1.0,
            pauseMultiplier: 1.1
        }
    }
}

/**
 * Get a random conversational phrase for a given context and language
 */
export function getConversationalPhrase(
    context: keyof typeof CONVERSATION_TEMPLATES,
    language: string = 'en-US'
): string {
    const langCode = language.startsWith('en') ? 'en-US' :
        language.startsWith('hi') ? 'hi-IN' :
            language.startsWith('es') ? 'es-ES' : 'en-US'

    const phrases = CONVERSATION_TEMPLATES[context]?.[langCode as keyof typeof CONVERSATION_TEMPLATES[typeof context]]
    if (!phrases || phrases.length === 0) {
        return CONVERSATION_TEMPLATES[context]['en-US'][0]
    }

    return phrases[Math.floor(Math.random() * phrases.length)]
}

/**
 * Apply personality-based adjustments to speech parameters
 */
export function applyVoicePersonality(
    personality: keyof typeof VOICE_PERSONALITIES,
    baseRate: number = 1.0
): { rate: number; pitch: number; volume: number } {
    const profile = VOICE_PERSONALITIES[personality] || VOICE_PERSONALITIES.friendly

    return {
        rate: baseRate * profile.rate,
        pitch: profile.pitch,
        volume: profile.volume
    }
}

/**
 * Get optimal voice characteristics for a language
 */
export function getLanguageCharacteristics(language: string) {
    return LANGUAGE_VOICE_PREFERENCES[language as keyof typeof LANGUAGE_VOICE_PREFERENCES]?.characteristics || {
        rate: 0.9,
        pitch: 1.0,
        pauseMultiplier: 1.0
    }
}

/**
 * Enhance text with emotional markers for better speech synthesis
 */
export function addEmotionalContext(
    text: string,
    emotion: 'happy' | 'encouraging' | 'curious' | 'calm' | 'excited'
): string {
    const emotionMarkers = {
        happy: { prefix: '', suffix: '!', pauseExtra: '.' },
        encouraging: { prefix: '', suffix: '!', pauseExtra: '..' },
        curious: { prefix: '', suffix: '?', pauseExtra: '..' },
        calm: { prefix: '', suffix: '.', pauseExtra: '...' },
        excited: { prefix: '', suffix: '!!', pauseExtra: '.' }
    }

    const marker = emotionMarkers[emotion]

    // Add natural pauses and emphasis
    return text
        .replace(/([.!?])/g, `$1${marker.pauseExtra} `)
        .trim()
}
