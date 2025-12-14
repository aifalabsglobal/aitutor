'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface UserContext {
    // User info
    userId?: string
    userName?: string
    preferredLanguage: string

    // Current state
    currentPage: string
    currentLesson?: {
        id: string
        title: string
        roadmapId: string
        roadmapTitle: string
    }
    currentRoadmap?: {
        id: string
        title: string
        subject: string
    }

    // Learning context
    learningGoals?: string[]
    currentLevel?: string
    completedLessons: number
    totalProgress: number

    // AI context
    recentQuestions: string[]
    strugglingTopics: string[]
}

interface AIContextProviderProps {
    children: ReactNode
}

const AIContext = createContext<UserContext>({
    preferredLanguage: 'en-US',
    currentPage: '/',
    completedLessons: 0,
    totalProgress: 0,
    recentQuestions: [],
    strugglingTopics: []
})

export function AIContextProvider({ children }: AIContextProviderProps) {
    const { data: session } = useSession()
    const pathname = usePathname()

    const [context, setContext] = useState<UserContext>({
        preferredLanguage: 'en-US',
        currentPage: pathname,
        completedLessons: 0,
        totalProgress: 0,
        recentQuestions: [],
        strugglingTopics: []
    })

    // Update current page
    useEffect(() => {
        setContext(prev => ({ ...prev, currentPage: pathname }))
    }, [pathname])

    // Load user context from API
    useEffect(() => {
        if (session?.user?.email) {
            fetchUserContext()
        }
    }, [session])

    const fetchUserContext = async () => {
        try {
            const response = await fetch('/api/user/context')
            const data = await response.json()

            setContext(prev => ({
                ...prev,
                userId: data.userId,
                userName: data.userName,
                preferredLanguage: data.preferredLanguage || 'en-US',
                learningGoals: data.learningGoals,
                currentLevel: data.currentLevel,
                completedLessons: data.completedLessons,
                totalProgress: data.totalProgress,
                recentQuestions: data.recentQuestions || [],
                strugglingTopics: data.strugglingTopics || []
            }))
        } catch (error) {
            console.error('Failed to load context:', error)
        }
    }

    // Update lesson context
    const updateLessonContext = (lesson: UserContext['currentLesson']) => {
        setContext(prev => ({ ...prev, currentLesson: lesson }))
    }

    // Update roadmap context
    const updateRoadmapContext = (roadmap: UserContext['currentRoadmap']) => {
        setContext(prev => ({ ...prev, currentRoadmap: roadmap }))
    }

    // Track question
    const addQuestion = (question: string) => {
        setContext(prev => ({
            ...prev,
            recentQuestions: [question, ...prev.recentQuestions].slice(0, 10)
        }))
    }

    return (
        <AIContext.Provider value={{
            ...context,
            updateLessonContext,
            updateRoadmapContext,
            addQuestion
        } as any}>
            {children}
        </AIContext.Provider>
    )
}

export function useAIContext() {
    return useContext(AIContext)
}

// Helper to get context summary for AI
export function getContextSummary(context: UserContext): string {
    const parts = []

    if (context.userName) {
        parts.push(`User: ${context.userName}`)
    }

    if (context.currentLesson) {
        parts.push(`Current Lesson: "${context.currentLesson.title}" in ${context.currentLesson.roadmapTitle}`)
    } else if (context.currentRoadmap) {
        parts.push(`Viewing Roadmap: "${context.currentRoadmap.title}" (${context.currentRoadmap.subject})`)
    }

    if (context.currentLevel) {
        parts.push(`Level: ${context.currentLevel}`)
    }

    if (context.learningGoals && context.learningGoals.length > 0) {
        parts.push(`Goals: ${context.learningGoals.join(', ')}`)
    }

    if (context.totalProgress > 0) {
        parts.push(`Progress: ${context.totalProgress}% complete, ${context.completedLessons} lessons done`)
    }

    if (context.strugglingTopics.length > 0) {
        parts.push(`Struggling with: ${context.strugglingTopics.join(', ')}`)
    }

    if (context.recentQuestions.length > 0) {
        parts.push(`Recent questions: ${context.recentQuestions.slice(0, 3).join('; ')}`)
    }

    parts.push(`Language: ${context.preferredLanguage}`)
    parts.push(`Current page: ${context.currentPage}`)

    return parts.join('\n')
}
