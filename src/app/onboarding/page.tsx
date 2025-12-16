'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LanguageSelector from '@/components/onboarding/language-selector'
import VoiceOnboarding from '@/components/onboarding/voice-onboarding'

interface OnboardingData {
  subject: string
  goal: string
  level: string
  timeAvailable: string
}

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stage, setStage] = useState<'language' | 'onboarding' | 'generating'>('language')
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [isGenerating, setIsGenerating] = useState(false)

  // Check if language was already selected (returning from signup)
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage && session) {
      // User returned after signup with language already selected
      setSelectedLanguage(savedLanguage)
      setStage('onboarding')
      // Clear the stored language
      localStorage.removeItem('selectedLanguage')
    }
  }, [session])

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode)

    // Save language preference to localStorage for use after signup
    localStorage.setItem('selectedLanguage', languageCode)

    // Save to database if user is already logged in
    if (session) {
      try {
        await fetch('/api/user/language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: languageCode })
        })
      } catch (error) {
        console.error('Failed to save language:', error)
      }

      // If already logged in, continue to onboarding
      setStage('onboarding')
    } else {
      // Not logged in - redirect to signup with language
      router.push(`/auth/signup?lang=${languageCode}&returnTo=/onboarding`)
    }
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setStage('generating')
    setIsGenerating(true)

    try {
      // Create onboarding profile with correct parameter structure
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningGoal: data.subject, // Map subject to learningGoal
          subject: data.subject,
          currentLevel: data.level,
          targetLevel: 'advanced', // Default target
          timeCommitment: parseInt(data.timeAvailable) || 60,
          learningStyle: 'visual', // Default
          specificTopics: data.subject,
          goals: data.goal,
          language: selectedLanguage
        })
      })

      if (response.ok) {
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const error = await response.json()
        console.error('Onboarding failed:', error)
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      setIsGenerating(false)
    }
  }

  if (stage === 'language') {
    return <LanguageSelector onSelect={handleLanguageSelect} />
  }

  if (stage === 'onboarding') {
    return (
      <VoiceOnboarding
        language={selectedLanguage}
        onComplete={handleOnboardingComplete}
      />
    )
  }

  // Generating stage
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="mb-8 animate-bounce-subtle">
          <div className="inline-block p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Creating Your Learning Path
        </h2>
        <p className="text-xl text-slate-600">
          This will only take a moment...
        </p>
      </div>
    </div>
  )
}