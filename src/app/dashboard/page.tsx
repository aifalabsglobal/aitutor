'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen, Target, BarChart3, LogOut, User, Sparkles } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import { HeaderLanguageSelector } from '@/components/ui/header-language-selector'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasRoadmap, setHasRoadmap] = useState<boolean | null>(null)
  const { t } = useTranslations() // Translation hook

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/roadmaps')
          const data = await response.json()

          // If no roadmaps exist, redirect to onboarding
          if (!data.roadmaps || data.roadmaps.length === 0) {
            router.push('/onboarding')
          } else {
            setHasRoadmap(true)
          }
        } catch (error) {
          console.error('Failed to check onboarding:', error)
          setHasRoadmap(true) // Assume complete on error
        }
      }
    }

    if (status === 'authenticated') {
      checkOnboarding()
    }
  }, [session, status, router])

  if (status === 'loading' || hasRoadmap === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-blue-600">ai</span>
                <span className="text-gray-900">fa</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <HeaderLanguageSelector />
              <Link href="/profile">
                <Button variant="outline" size="sm" className="gap-2 border-blue-200 hover:bg-blue-50">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">{t('nav.profile')}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/api/auth/signout')}
                className="gap-2 border-blue-200 hover:bg-blue-50"
              >
                <LogOut className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            {t('dashboard.welcome', { name: session.user?.name || 'User' })} 👋
          </h2>
          <p className="text-gray-600 text-lg">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.activeRoadmaps')}</p>
                  <p className="text-2xl font-bold text-blue-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.learningGoals')}</p>
                  <p className="text-2xl font-bold text-blue-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.totalProgress')}</p>
                  <p className="text-2xl font-bold text-blue-900">67%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-white hover:shadow-lg transition-shadow group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <BookOpen className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                {t('nav.roadmaps')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {t('common.loading')}
              </p>
              <Link href="/roadmaps">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  {t('nav.roadmaps')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white hover:shadow-lg transition-shadow group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <Target className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                {t('dashboard.learningGoals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {t('dashboard.learningGoals')}
              </p>
              <Button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50" variant="outline">
                {t('common.submit')}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white hover:shadow-lg transition-shadow group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <BarChart3 className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                {t('dashboard.totalProgress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {t('dashboard.totalProgress')}
              </p>
              <Button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50" variant="outline">
                {t('common.submit')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Card */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎤</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  {t('voice.aiOnline')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('voice.speak')}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-4 py-2 bg-white rounded-full text-sm text-blue-700 border-2 border-blue-200 font-medium">
                    "Go to roadmaps"
                  </span>
                  <span className="px-4 py-2 bg-white rounded-full text-sm text-blue-700 border-2 border-blue-200 font-medium">
                    "Help"
                  </span>
                  <span className="px-4 py-2 bg-white rounded-full text-sm text-blue-700 border-2 border-blue-200 font-medium">
                    "Show my progress"
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}