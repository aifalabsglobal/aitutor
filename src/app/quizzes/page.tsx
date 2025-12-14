'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Target, Clock, CheckCircle, XCircle, Play, RotateCcw, Sparkles, ArrowLeft, ArrowRight, Search, Filter, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  description: string
  subject: string
  difficulty: string
  questionType: string
  timeLimit?: number
  passingScore: number
  questions: Question[]
}

interface Question {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  correctAnswer: string | number
  explanation: string
}

interface QuizAttempt {
  id: string
  score: number
  passed: boolean
  timeSpent: number
  feedback: any
  answers: any
}

async function fetchQuizzes(): Promise<Quiz[]> {
  const response = await fetch("/api/quizzes")
  if (!response.ok) throw new Error("Failed to fetch quizzes")
  return response.json()
}

async function deleteQuiz(id: string): Promise<void> {
  const response = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete quiz')
}

export default function QuizzesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchQuizzes,
    enabled: !!session?.user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast({
        title: "Quiz deleted",
        description: "The quiz has been successfully deleted.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quiz. Please try again.",
        variant: "destructive",
      })
    }
  })

  // Filter quizzes
  const filteredQuizzes = quizzes?.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || quiz.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  }) || []

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setQuizResults(null)
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null)
    setStartTime(new Date())
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuiz = async () => {
    if (!selectedQuiz || !startTime) return

    setIsSubmitting(true)
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60)

    try {
      const response = await fetch("/api/quizzes/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: selectedQuiz.id,
          answers,
          timeSpent
        }),
      })

      if (response.ok) {
        const results = await response.json()
        setQuizResults(results)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Submit quiz error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetQuiz = () => {
    setSelectedQuiz(null)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setQuizResults(null)
    setTimeLeft(null)
    setStartTime(null)
  }

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
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-blue-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Taking Quiz View
  if (selectedQuiz && !showResults) {
    const question = selectedQuiz.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {selectedQuiz.title}
              </h1>
              <Button variant="outline" onClick={resetQuiz} className="border-blue-300">
                Exit Quiz
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <span className="font-medium">Question {currentQuestion + 1} of {selectedQuiz.questions.length}</span>
              {timeLeft && (
                <span className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </motion.div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">{question.question}</CardTitle>
                <CardDescription className="text-base">
                  {question.type === "multiple_choice" && "Select the best answer"}
                  {question.type === "true_false" && "Select true or false"}
                  {question.type === "short_answer" && "Type your answer below"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {question.type === "multiple_choice" && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                    className="space-y-3"
                  >
                    {question.options.map((option, index) => (
                      <motion.div key={index} whileHover={{ scale: 1.01, x: 5 }}>
                        <div className="flex items-center space-x-3 p-4 border-2 border-blue-100 rounded-lg hover:bg-blue-50 cursor-pointer">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-800">
                            {option}
                          </Label>
                        </div>
                      </motion.div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "true_false" && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                    className="space-y-3"
                  >
                    <motion.div whileHover={{ scale: 1.01, x: 5 }}>
                      <div className="flex items-center space-x-3 p-4 border-2 border-blue-100 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <RadioGroupItem value="true" id="true" />
                        <Label htmlFor="true" className="cursor-pointer">True</Label>
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01, x: 5 }}>
                      <div className="flex items-center space-x-3 p-4 border-2 border-blue-100 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <RadioGroupItem value="false" id="false" />
                        <Label htmlFor="false" className="cursor-pointer">False</Label>
                      </div>
                    </motion.div>
                  </RadioGroup>
                )}

                {question.type === "short_answer" && (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={5}
                    className="border-blue-200 focus:border-blue-500"
                  />
                )}

                <Separator />

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className="border-blue-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentQuestion === selectedQuiz.questions.length - 1 ? (
                    <Button
                      onClick={submitQuiz}
                      disabled={!answers[question.id] || isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quiz"}
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      disabled={!answers[question.id]}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Results View
  if (showResults && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-blue-100 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${quizResults.passed
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : "bg-gradient-to-br from-orange-500 to-orange-600"
                    }`}
                >
                  {quizResults.passed ? (
                    <CheckCircle className="w-12 h-12 text-white" />
                  ) : (
                    <XCircle className="w-12 h-12 text-white" />
                  )}
                </motion.div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  {quizResults.passed ? "Congratulations!" : "Keep Practicing!"}
                </CardTitle>
                <CardDescription className="text-lg">
                  You scored {quizResults.score}%{quizResults.passed ? " and passed the quiz!" : ". Review the material and try again."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Score", value: `${quizResults.score}%`, color: "blue" },
                    { label: "Result", value: quizResults.passed ? "Passed" : "Failed", color: quizResults.passed ? "green" : "orange" },
                    { label: "Time", value: `${quizResults.timeSpent}m`, color: "purple" },
                    { label: "Required", value: `${selectedQuiz?.passingScore}%`, color: "gray" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`text-center p-4 bg-gradient-to-br from-${stat.color}-50 to-white rounded-xl border border-${stat.color}-200`}
                    >
                      <p className={`text-3xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {quizResults.feedback && (
                  <div>
                    <h3 className="font-bold text-xl mb-4 text-blue-900">Detailed Feedback</h3>
                    <ScrollArea className="h-64 w-full border-2 border-blue-100 rounded-xl p-4 bg-white">
                      <div className="space-y-4">
                        {quizResults.feedback.map((feedback: any, index: number) => (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            {feedback.correct ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Question {index + 1}</p>
                              <p className="text-sm text-gray-700 mt-1">{feedback.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button onClick={resetQuiz} variant="outline" className="flex-1 border-blue-300 hover:bg-blue-50">
                    Back to Quizzes
                  </Button>
                  {!quizResults.passed && selectedQuiz && (
                    <Button onClick={() => startQuiz(selectedQuiz)} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Quiz List  View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
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
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
                <Link href="/roadmaps" className="text-gray-600 hover:text-blue-600">Roadmaps</Link>
                <Link href="/chat" className="text-gray-600 hover:text-blue-600">AI Tutor</Link>
                <Link href="/quizzes" className="text-blue-600 font-semibold">Practice</Link>
              </nav>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Practice & Assessments
          </h1>
          <p className="text-gray-600 text-lg">
            Test your knowledge and track your progress with AI-generated quizzes.
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
                placeholder="Search quizzes..."
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
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-blue-700">{filteredQuizzes.length}</span> {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
          </p>
        </motion.div>

        {filteredQuizzes && filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl text-blue-900">{quiz.title}</CardTitle>
                      <Badge className={
                        quiz.difficulty === 'beginner' ? 'bg-green-600' :
                          quiz.difficulty === 'intermediate' ? 'bg-blue-600' : 'bg-purple-600'
                      }>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-700">
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{quiz.questions.length} questions</span>
                      </div>
                      {quiz.timeLimit && (
                        <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{quiz.timeLimit}m</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Passing score</span>
                      <Badge variant="outline" className="border-blue-600 text-blue-700 font-bold">{quiz.passingScore}%</Badge>
                    </div>

                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                          onClick={() => startQuiz(quiz)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Quiz
                        </Button>
                      </motion.div>

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
                            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(quiz.id)}
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
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <Target className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">No quizzes available</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Complete your onboarding to get personalized quizzes based on your learning goals.
              </p>
              <Link href="/onboarding">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}