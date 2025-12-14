'use client'

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Loader2,
    Target,
    Clock,
    User2,
    MessageCircle,
    Send,
    Sparkles,
    Volume2,
    ImageIcon,
    Mic
} from "lucide-react"
import Link from "next/link"
import { AutoRead, speakText } from "@/components/ui/auto-read"
import { VoiceInput } from "@/components/ui/voice-input"
import { LessonImage } from "@/components/ui/lesson-image"
import { motion } from "framer-motion"

interface NodeContent {
    id: string
    title: string
    description: string
    content: string
    difficulty: string
    estimatedMinutes: number
    masteryThreshold: number
    currentScore: number
    attempts: number
    status: string
}

interface AssessmentQuestion {
    id: string
    question: string
    type: 'MCQ' | 'SHORT_ANSWER'
    options?: string[]
    correctAnswer?: string
}

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

async function fetchNodeContent(roadmapId: string, nodeId: string): Promise<NodeContent> {
    const response = await fetch(`/api/learn/${roadmapId}/${nodeId}`)
    if (!response.ok) throw new Error('Failed to fetch content')
    return response.json()
}

async function generateContent(nodeId: string): Promise<{ content: string }> {
    const response = await fetch(`/api/learn/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId })
    })
    if (!response.ok) throw new Error('Failed to generate content')
    return response.json()
}

async function fetchAssessment(nodeId: string): Promise<AssessmentQuestion[]> {
    const response = await fetch(`/api/learn/assess/${nodeId}`)
    if (!response.ok) throw new Error('Failed to fetch assessment')
    return response.json()
}

async function submitAssessment(nodeId: string, answers: Record<string, string>): Promise<{ score: number, passed: boolean, feedback: string }> {
    const response = await fetch(`/api/learn/assess/${nodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
    })
    if (!response.ok) throw new Error('Failed to submit assessment')
    return response.json()
}

async function askTutor(message: string, topic: string, history: ChatMessage[]): Promise<string> {
    const response = await fetch('/api/learn/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, topic, history })
    })
    if (!response.ok) throw new Error('Failed to get response')
    const data = await response.json()
    return data.response
}

export default function NodeLearningPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const chatEndRef = useRef<HTMLDivElement>(null)

    const roadmapId = params.roadmapId as string
    const nodeId = params.nodeId as string

    const [phase, setPhase] = useState<'learning' | 'study' | 'assessment' | 'results'>('learning')
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [assessmentResult, setAssessmentResult] = useState<{ score: number, passed: boolean, feedback: string } | null>(null)

    // AI Tutor Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)

    const { data: nodeContent, isLoading: contentLoading } = useQuery({
        queryKey: ['node-content', roadmapId, nodeId],
        queryFn: () => fetchNodeContent(roadmapId, nodeId),
        enabled: !!session?.user && !!roadmapId && !!nodeId,
    })

    const { data: assessment, isLoading: assessmentLoading, refetch: refetchAssessment } = useQuery({
        queryKey: ['node-assessment', nodeId],
        queryFn: () => fetchAssessment(nodeId),
        enabled: false,
    })

    const generateMutation = useMutation({
        mutationFn: () => generateContent(nodeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['node-content', roadmapId, nodeId] })
        }
    })

    const submitMutation = useMutation({
        mutationFn: () => submitAssessment(nodeId, answers),
        onSuccess: (result) => {
            setAssessmentResult(result)
            setPhase('results')
            queryClient.invalidateQueries({ queryKey: ['node-content', roadmapId, nodeId] })
            queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] })
        }
    })

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    // Initialize chat when entering study phase
    useEffect(() => {
        if (phase === 'study' && chatMessages.length === 0 && nodeContent) {
            setChatMessages([{
                role: 'assistant',
                content: `👋 Hi! I'm your AI tutor for **${nodeContent.title}**.\n\nI've prepared the lesson content for you. Feel free to:\n- Ask me any questions about this topic\n- Request examples or explanations\n- Ask me to clarify anything\n\nWhen you feel ready, click "Take Assessment" to test your knowledge!`
            }])
        }
    }, [phase, nodeContent, chatMessages.length])

    const handleSendMessage = async () => {
        if (!currentMessage.trim() || isChatLoading) return

        const userMessage: ChatMessage = { role: 'user', content: currentMessage }
        setChatMessages(prev => [...prev, userMessage])
        setCurrentMessage('')
        setIsChatLoading(true)

        try {
            const response = await askTutor(currentMessage, nodeContent?.title || '', chatMessages)
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
            speakText(response)
        } catch (error) {
            const errorMsg = "I'm sorry, I couldn't process that request. Please try again or rephrase your question."
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMsg
            }])
            speakText(errorMsg)
        } finally {
            setIsChatLoading(false)
        }
    }

    const handleStartStudy = () => {
        setPhase('study')
    }

    const handleStartAssessment = async () => {
        setPhase('assessment')
        await refetchAssessment()
    }

    const handleSubmitAssessment = () => {
        submitMutation.mutate()
    }

    const handleRequestTutor = async () => {
        if (confirm('Request a human tutor for this topic?')) {
            await fetch('/api/tutor/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodeId, roadmapId })
            })
            router.push(`/roadmaps/${roadmapId}`)
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (contentLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
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
                className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10"
            >
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href={`/roadmaps/${roadmapId}`}>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Roadmap
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-blue-300 text-blue-700 font-semibold">{nodeContent?.difficulty}</Badge>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                <Clock className="w-3 h-3 mr-1" />
                                {nodeContent?.estimatedMinutes} min
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Progress bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`flex items-center gap-2 ${phase === 'learning' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-medium">Content</span>
                        </div>
                        <div className="flex-1 h-px bg-blue-200" />
                        <div className={`flex items-center gap-2 ${phase === 'study' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Study with AI</span>
                        </div>
                        <div className="flex-1 h-px bg-blue-200" />
                        <div className={`flex items-center gap-2 ${phase === 'assessment' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <Target className="w-4 h-4" />
                            <span className="text-sm font-medium">Assess</span>
                        </div>
                        <div className="flex-1 h-px bg-blue-200" />
                        <div className={`flex items-center gap-2 ${phase === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Results</span>
                        </div>
                    </div>
                    <Progress
                        value={phase === 'learning' ? 25 : phase === 'study' ? 50 : phase === 'assessment' ? 75 : 100}
                        className="h-2"
                    />
                </motion.div>

                {/* Learning Phase - View Content */}
                {phase === 'learning' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="border-blue-100 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl text-blue-900">{nodeContent?.title}</CardTitle>
                                <CardDescription className="text-gray-700">{nodeContent?.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {nodeContent?.content ? (
                                    <>
                                        <AutoRead
                                            text={nodeContent.content}
                                            autoStart={true}
                                            className="mb-6"
                                        />

                                        <LessonImage
                                            topic={nodeContent.title}
                                            context={nodeContent.description}
                                            className="mb-6"
                                        />

                                        <div
                                            className="prose prose-slate max-w-none lesson-content"
                                            dangerouslySetInnerHTML={{ __html: nodeContent.content }}
                                        />
                                        <div className="flex justify-end pt-6 border-t border-blue-100">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button onClick={handleStartStudy} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Study with AI Tutor
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">Content not generated yet.</p>
                                        <Button
                                            onClick={() => generateMutation.mutate()}
                                            disabled={generateMutation.isPending}
                                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                        >
                                            {generateMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                "Generate Content with AI"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Study Phase - AI Tutor Chat */}
                {phase === 'study' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Content Reference */}
                        <Card className="h-[600px] flex flex-col border-blue-100 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    Lesson Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto">
                                <div
                                    className="prose prose-sm prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: nodeContent?.content || '' }}
                                />
                            </CardContent>
                        </Card>

                        {/* AI Tutor Chat */}
                        <Card className="h-[600px] flex flex-col border-blue-100 shadow-lg">
                            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    AI Tutor Chat
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Ask questions about {nodeContent?.title}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col overflow-hidden">
                                {/* Chat Messages */}
                                <ScrollArea className="flex-1 pr-4 mb-4">
                                    <div className="space-y-4">
                                        {chatMessages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user'
                                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                                        : 'bg-blue-50 text-gray-900 border border-blue-200'
                                                        }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {isChatLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Voice Input */}
                                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg mb-3">
                                    <VoiceInput
                                        onTranscript={(text) => setCurrentMessage(text)}
                                        onFinalTranscript={(text) => {
                                            setCurrentMessage(text)
                                            if (text.trim()) {
                                                setTimeout(() => {
                                                    const sendBtn = document.getElementById('send-chat-btn')
                                                    sendBtn?.click()
                                                }, 500)
                                            }
                                        }}
                                        placeholder="Speak your question..."
                                    />
                                </div>

                                {/* Text Input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        placeholder="Or type your question..."
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                        disabled={isChatLoading}
                                        className="border-blue-200 focus:border-blue-500"
                                    />
                                    <Button
                                        id="send-chat-btn"
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={isChatLoading || !currentMessage.trim()}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between mt-4 pt-4 border-t border-blue-100">
                                    <Button variant="outline" onClick={() => setPhase('learning')} className="border-blue-200 hover:bg-blue-50">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Content
                                    </Button>
                                    <Button onClick={handleStartAssessment} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                                        Take Assessment
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Assessment Phase */}
                {phase === 'assessment' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-blue-100 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                                <CardTitle className="text-blue-900">Assessment: {nodeContent?.title}</CardTitle>
                                <CardDescription className="text-gray-700">
                                    Answer the following questions to demonstrate your understanding.
                                    You need {nodeContent?.masteryThreshold}% to pass.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {assessmentLoading ? (
                                    <div className="py-12 text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                                        <p className="text-gray-600 mt-4">Loading assessment...</p>
                                    </div>
                                ) : assessment && assessment.length > 0 ? (
                                    <>
                                        {assessment.map((q, index) => (
                                            <div key={q.id} className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="font-medium text-blue-900">
                                                    {index + 1}. {q.question}
                                                </p>
                                                {q.type === 'MCQ' && q.options ? (
                                                    <RadioGroup
                                                        value={answers[q.id] || ''}
                                                        onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                                                    >
                                                        {q.options.map((option, i) => (
                                                            <div key={i} className="flex items-center space-x-2 p-2 hover:bg-blue-100 rounded">
                                                                <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                                                                <Label htmlFor={`${q.id}-${i}`} className="flex-1 cursor-pointer">{option}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                ) : (
                                                    <Textarea
                                                        placeholder="Enter your answer..."
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                                        rows={3}
                                                        className="border-blue-200 focus:border-blue-500"
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        <div className="flex justify-between pt-4 border-t border-blue-100">
                                            <Button variant="outline" onClick={() => setPhase('learning')} className="border-blue-200 hover:bg-blue-50">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Review Content
                                            </Button>
                                            <Button
                                                onClick={handleSubmitAssessment}
                                                disabled={submitMutation.isPending}
                                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                            >
                                                {submitMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Evaluating...
                                                    </>
                                                ) : (
                                                    "Submit Assessment"
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-12 text-center">
                                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">No assessment questions available.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Results Phase */}
                {phase === 'results' && assessmentResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-blue-100 shadow-2xl">
                            <CardHeader className="text-center pb-8">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${assessmentResult.passed
                                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                                        : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                    }`}>
                                    {assessmentResult.passed ? (
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    ) : (
                                        <AlertCircle className="w-12 h-12 text-white" />
                                    )}
                                </div>
                                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                                    Assessment Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center py-6">
                                    <div className={`text-6xl font-bold mb-2 ${assessmentResult.passed ? 'text-green-600' : 'text-orange-600'}`}>
                                        {assessmentResult.score}%
                                    </div>
                                    <p className={`text-lg ${assessmentResult.passed ? 'text-green-600' : 'text-orange-600'}`}>
                                        {assessmentResult.passed
                                            ? "🎉 Congratulations! You've mastered this topic!"
                                            : "Keep trying! You're making progress."}
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Required: {nodeContent?.masteryThreshold}%
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium mb-2 text-blue-900">Feedback</h4>
                                    <p className="text-gray-700">{assessmentResult.feedback}</p>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-blue-100">
                                    {assessmentResult.passed ? (
                                        <Link href={`/roadmaps/${roadmapId}`}>
                                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                                Continue Roadmap
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Button onClick={() => setPhase('learning')} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                                Review Content Again
                                            </Button>
                                            {(nodeContent?.attempts || 0) >= 2 && (
                                                <Button
                                                    variant="outline"
                                                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                                    onClick={handleRequestTutor}
                                                >
                                                    <User2 className="w-4 h-4 mr-2" />
                                                    Request Human Tutor
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
