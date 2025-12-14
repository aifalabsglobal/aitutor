'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Volume2, Sparkles, ArrowRight } from 'lucide-react'
import { speakText } from '@/components/ui/auto-read'
import { VoiceInput } from '@/components/ui/voice-input'

interface VoiceOnboardingProps {
    language: string
    onComplete: (data: OnboardingData) => void
}

interface OnboardingData {
    subject: string
    goal: string
    level: string
    timeAvailable: string
}

const QUESTIONS = {
    'en-US': {
        welcome: "Welcome! I'm AIFA, your AI learning companion. Let's personalize your journey.",
        subject: "What would you like to learn?",
        goal: "What's your main goal?",
        level: "How would you describe your current level?",
        time: "How much time can you dedicate daily?",
        generating: "Perfect! I'm creating your personalized learning path...",
    },
    'hi-IN': {
        welcome: "स्वागत है! मैं AIFA हूं, आपका AI सीखने का साथी। आइए आपकी यात्रा को व्यक्तिगत बनाएं।",
        subject: "आप क्या सीखना चाहते हैं?",
        goal: "आपका मुख्य लक्ष्य क्या है?",
        level: "आप अपने वर्तमान स्तर को कैसे वर्णित करेंगे?",
        time: "आप प्रतिदिन कितना समय दे सकते हैं?",
        generating: "बढ़िया! मैं आपका व्यक्तिगत सीखने का मार्ग बना रहा हूं...",
    },
    'es-ES': {
        welcome: "¡Bienvenido! Soy AIFA, tu compañero de aprendizaje AI. Personalicemos tu viaje.",
        subject: "¿Qué te gustaría aprender?",
        goal: "¿Cuál es tu objetivo principal?",
        level: "¿Cómo describirías tu nivel actual?",
        time: "¿Cuánto tiempo puedes dedicar diariamente?",
        generating: "¡Perfecto! Estoy creando tu ruta de aprendizaje personalizada...",
    },
}

const SUBJECTS = ['Programming', 'Mathematics', 'Science', 'Language', 'Business', 'Art']
const GOALS = ['Get a job', 'Pass an exam', 'Build a project', 'Personal growth', 'Career change']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TIME_OPTIONS = ['15 min', '30 min', '1 hour', '2+ hours']

export default function VoiceOnboarding({ language, onComplete }: VoiceOnboardingProps) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Partial<OnboardingData>>({})
    const [isListening, setIsListening] = useState(false)
    const [currentText, setCurrentText] = useState('')

    const questions = QUESTIONS[language as keyof typeof QUESTIONS] || QUESTIONS['en-US']

    useEffect(() => {
        // Speak welcome message when component mounts
        if (step === 0) {
            setTimeout(() => {
                speakText(questions.welcome, 1.0, language)
            }, 500)
        }
    }, [])

    useEffect(() => {
        // Speak each question when step changes
        if (step > 0 && step <= 4) {
            const questionTexts = [questions.subject, questions.goal, questions.level, questions.time]
            setTimeout(() => {
                speakText(questionTexts[step - 1], 1.0, language)
            }, 300)
        }
    }, [step])

    const handleAnswer = (field: keyof OnboardingData, value: string) => {
        setAnswers(prev => ({ ...prev, [field]: value }))

        // Move to next step
        if (step === 4) {
            // Final step
            speakText(questions.generating, 1.0, language)
            setTimeout(() => {
                onComplete({
                    subject: answers.subject || '',
                    goal: answers.goal || '',
                    level: answers.level || '',
                    timeAvailable: value
                })
            }, 2000)
        } else {
            setStep(step + 1)
        }
    }

    const handleVoiceInput = (text: string) => {
        const field = ['subject', 'goal', 'level', 'timeAvailable'][step - 1] as keyof OnboardingData
        handleAnswer(field, text)
    }

    if (step === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
                <Card className="max-w-2xl w-full shadow-2xl animate-scale-in">
                    <CardContent className="p-12 text-center">
                        <div className="mb-8 animate-bounce-subtle">
                            <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl">
                                <Sparkles className="w-16 h-16 text-white" />
                            </div>
                        </div>

                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {questions.welcome}
                        </h2>

                        <p className="text-lg text-slate-600 mb-8">
                            This will only take a minute
                        </p>

                        <Button
                            size="lg"
                            onClick={() => setStep(1)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-lg transform transition-all duration-300 hover:scale-105"
                        >
                            Let's Begin
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const options = [SUBJECTS, GOALS, LEVELS, TIME_OPTIONS][step - 1]
    const questionText = [questions.subject, questions.goal, questions.level, questions.time][step - 1]
    const field = ['subject', 'goal', 'level', 'timeAvailable'][step - 1] as keyof OnboardingData

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
            <Card className="max-w-3xl w-full shadow-2xl animate-slide-up">
                <CardContent className="p-8">
                    {/* Progress indicator */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-2 flex-1 mx-1 rounded-full transition-all duration-500 ${i <= step
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 text-center">
                            Step {step} of 4
                        </p>
                    </div>

                    {/* Question */}
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-slate-800 mb-4">
                            {questionText}
                        </h3>

                        {/* Voice input option */}
                        <VoiceInput
                            onTranscript={handleVoiceInput}
                            language={language}
                            placeholder="Speak your answer..."
                            className="mb-6"
                        />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-4">
                        {options.map((option, index) => (
                            <Button
                                key={option}
                                variant="outline"
                                onClick={() => handleAnswer(field, option)}
                                className={`
                                    h-20 text-lg font-medium
                                    transition-all duration-300 transform
                                    hover:scale-105 hover:shadow-lg
                                    hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                                    hover:border-blue-400
                                    animate-fade-in
                                `}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>

                    {/* Helper text */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        <Mic className="inline w-4 h-4 mr-1" />
                        Speak your answer or click an option
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
