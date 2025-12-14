'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen, Target, BarChart3, LogOut, User, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
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
              <Link href="/profile">
                <Button variant="outline" size="sm" className="gap-2 border-blue-200 hover:bg-blue-50">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/api/auth/signout')}
                className="gap-2 border-blue-200 hover:bg-blue-50"
              >
                <LogOut className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Sign Out</span>
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
            Welcome back, {session.user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Your AI-powered learning journey continues here
          </p>
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
                  <p className="text-sm text-gray-500">Active Roadmaps</p>
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
                  <p className="text-sm text-gray-500">Learning Goals</p>
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
                  <p className="text-sm text-gray-500">Total Progress</p>
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
                My Roadmaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View your personalized learning paths
              </p>
              <Link href="/roadmaps">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  View Roadmaps
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white hover:shadow-lg transition-shadow group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <Target className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Set and track your learning objectives
              </p>
              <Button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50" variant="outline">
                Set Goals
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white hover:shadow-lg transition-shadow group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <BarChart3 className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track your learning progress and achievements
              </p>
              <Button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50" variant="outline">
                View Stats
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
                  Voice AI Assistant is Active!
                </h3>
                <p className="text-gray-600 mb-4">
                  Click the microphone button (bottom-right) to interact with your AI assistant.
                  Try saying "help" to see what I can do!
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