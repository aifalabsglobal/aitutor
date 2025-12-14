'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Target, Clock, Play, ChevronRight, Sparkles, Plus, Search, Filter, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface Roadmap {
  id: string
  title: string
  description: string
  subject: string
  difficulty: string
  status: string
  totalSteps: number
  estimatedHours: number
  createdAt: string
  learningGoal: {
    title: string
  }
  steps: Array<{
    id: string
    title: string
    status: string
    estimatedMinutes: number
    order: number
  }>
  progress: Array<{
    percentage: number
    completed: boolean
  }>
}

async function fetchRoadmaps(): Promise<Roadmap[]> {
  const response = await fetch("/api/roadmaps")
  if (!response.ok) throw new Error("Failed to fetch roadmaps")
  return response.json()
}

async function deleteRoadmap(id: string): Promise<void> {
  const response = await fetch(`/api/roadmaps/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete roadmap')
}

export default function RoadmapsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: fetchRoadmaps,
    enabled: !!session?.user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] })
      toast({
        title: "Roadmap deleted",
        description: "The roadmap has been successfully deleted.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete roadmap. Please try again.",
        variant: "destructive",
      })
    }
  })

  // Filter roadmaps
  const filteredRoadmaps = roadmaps?.filter(roadmap => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || roadmap.difficulty === difficultyFilter
    const matchesSubject = subjectFilter === 'all' || roadmap.subject === subjectFilter
    return matchesSearch && matchesDifficulty && matchesSubject
  }) || []

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-blue-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight">
                  <span className="text-blue-600">ai</span>
                  <span className="text-gray-900">fa</span>
                </span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="/roadmaps" className="text-blue-600 font-semibold">My Roadmaps</a>
                <a href="/chat" className="text-gray-600 hover:text-blue-600 transition-colors">AI Tutor</a>
                <a href="/quizzes" className="text-gray-600 hover:text-blue-600 transition-colors">Practice</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/roadmaps/create">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Roadmap
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            My Learning Roadmaps
          </h1>
          <p className="text-gray-600 text-lg">
            Continue your learning journey with personalized roadmaps.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search roadmaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-48 border-blue-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Subject Filter */}
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-48 border-blue-200">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="languages">Languages</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-blue-700">{filteredRoadmaps.length}</span> {filteredRoadmaps.length === 1 ? 'roadmap' : 'roadmaps'}
          </p>
        </motion.div>

        {filteredRoadmaps && filteredRoadmaps.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRoadmaps.map((roadmap, index) => {
              const completedSteps = roadmap.steps?.filter(step => step.status === "COMPLETED").length || 0
              const totalSteps = roadmap.totalSteps || roadmap.steps?.length || 0
              const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

              const difficultyColors: Record<string, string> = {
                'BEGINNER': 'bg-green-100 text-green-700 border-green-300',
                'INTERMEDIATE': 'bg-blue-100 text-blue-700 border-blue-300',
                'ADVANCED': 'bg-purple-100 text-purple-700 border-purple-300'
              }

              return (
                <motion.div
                  key={roadmap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2 text-blue-900">{roadmap.title}</CardTitle>
                          <CardDescription className="mb-3 text-gray-600">
                            {roadmap.description}
                          </CardDescription>
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            <Badge variant="outline" className="border-blue-300 text-blue-700 font-semibold">
                              {roadmap.subject}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={difficultyColors[roadmap.difficulty] || 'bg-gray-100 text-gray-700'}
                            >
                              {roadmap.difficulty}
                            </Badge>
                            <Badge
                              variant={roadmap.status === "ACTIVE" ? "default" : "outline"}
                              className={roadmap.status === "ACTIVE" ? "bg-green-600" : ""}
                            >
                              {roadmap.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-semibold text-blue-900">Progress</span>
                          <span className="text-blue-700 font-bold">{completedSteps}/{totalSteps} steps</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {Math.round(progressPercentage)}% complete
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
                          >
                            <Target className="w-4 h-4 text-white" />
                          </motion.div>
                          <div>
                            <p className="text-xs text-gray-600">Goal</p>
                            <p className="text-sm font-semibold text-purple-900">{roadmap.learningGoal.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0"
                          >
                            <Clock className="w-4 h-4 text-white" />
                          </motion.div>
                          <div>
                            <p className="text-xs text-gray-600">Duration</p>
                            <p className="text-sm font-semibold text-orange-900">{roadmap.estimatedHours}h estimated</p>
                          </div>
                        </div>
                      </div>

                      {roadmap.steps && roadmap.steps.length > 0 && (
                        <div>
                          <h4 className="font-bold mb-3 text-blue-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            Recent Steps
                          </h4>
                          <div className="space-y-2">
                            {roadmap.steps.slice(0, 3).map((step) => (
                              <motion.div
                                key={step.id}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${step.status === "COMPLETED"
                                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                                    : step.status === "IN_PROGRESS"
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                      : "bg-gray-200 text-gray-600"
                                    }`}>
                                    {step.status === "COMPLETED" ? "✓" : step.order}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{step.title}</span>
                                </div>
                                <span className="text-xs text-gray-500 font-semibold">{step.estimatedMinutes}m</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/roadmaps/${roadmap.id}`} className="flex-1">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                              <Play className="w-4 h-4 mr-2" />
                              Continue Learning
                            </Button>
                          </motion.div>
                        </Link>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </motion.div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Roadmap?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{roadmap.title}"? This action cannot be undone and will permanently remove all associated progress.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(roadmap.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <BookOpen className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                No roadmaps yet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Complete your onboarding to get your first personalized learning roadmap and start your journey!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/onboarding">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50">
                      Back to Dashboard
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}