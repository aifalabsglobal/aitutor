'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VisualRoadmap, RoadmapNode } from '@/components/roadmap'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, Clock, Target, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface RoadmapDetail {
    id: string
    title: string
    description: string
    difficulty: string
    status: string
    roadmapType: string
    totalSteps: number
    estimatedHours: number
    learningGoal: {
        title: string
        subject: string
    }
    steps: RoadmapNode[]
}

async function fetchRoadmap(id: string): Promise<RoadmapDetail> {
    const response = await fetch(`/api/roadmaps/${id}`)
    if (!response.ok) throw new Error('Failed to fetch roadmap')
    return response.json()
}

async function requestTutor(nodeId: string, roadmapId: string) {
    const response = await fetch('/api/tutor/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, roadmapId })
    })
    if (!response.ok) throw new Error('Failed to request tutor')
    return response.json()
}

export default function RoadmapDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const roadmapId = params.id as string

    const { data: roadmap, isLoading, error } = useQuery({
        queryKey: ['roadmap', roadmapId],
        queryFn: () => fetchRoadmap(roadmapId),
        enabled: !!session?.user && !!roadmapId,
    })

    const requestTutorMutation = useMutation({
        mutationFn: (nodeId: string) => requestTutor(nodeId, roadmapId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] })
        }
    })

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
                        <div className="h-96 bg-blue-100 rounded-xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !roadmap) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <Card className="max-w-md border-blue-100">
                    <CardContent className="p-8 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Roadmap Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            This roadmap doesn't exist or you don't have access to it.
                        </p>
                        <Link href="/roadmaps">
                            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                Back to Roadmaps
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleNodeClick = (node: RoadmapNode) => {
        // Could show modal with more details
    }

    const handleStartNode = (nodeId: string) => {
        router.push(`/learn/${roadmapId}/${nodeId}`)
    }

    const handleRequestTutor = (nodeId: string) => {
        if (confirm('Are you sure you want to request a human tutor for this topic?')) {
            requestTutorMutation.mutate(nodeId)
        }
    }

    const difficultyColors = {
        'BEGINNER': 'bg-green-500',
        'INTERMEDIATE': 'bg-blue-500',
        'ADVANCED': 'bg-purple-500',
        'EXPERT': 'bg-red-500'
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
                        <Link href="/roadmaps">
                            <Button variant="ghost" className="hover:bg-blue-50">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Roadmaps
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="border-purple-300 text-purple-700 font-semibold">
                                {roadmap.roadmapType}
                            </Badge>
                            <Badge className={roadmap.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-500'}>
                                {roadmap.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Roadmap info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                        {roadmap.title}
                    </h1>
                    <p className="text-gray-700 max-w-3xl text-lg mb-6">
                        {roadmap.description}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                            <Target className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-purple-900">{roadmap.learningGoal.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-900">{roadmap.totalSteps} steps</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-900">{roadmap.estimatedHours} hours</span>
                        </div>
                        <Badge
                            variant="outline"
                            className={`px-4 py-2 ${roadmap.difficulty === 'BEGINNER' ? 'border-green-300 text-green-700' :
                                roadmap.difficulty === 'INTERMEDIATE' ? 'border-blue-300 text-blue-700' :
                                    'border-purple-300 text-purple-700'
                                } font-bold`}
                        >
                            {roadmap.difficulty}
                        </Badge>
                    </div>
                </motion.div>

                {/* Visual Roadmap */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <VisualRoadmap
                        nodes={roadmap.steps}
                        roadmapTitle={roadmap.title}
                        onNodeClick={handleNodeClick}
                        onStartNode={handleStartNode}
                        onRequestTutor={handleRequestTutor}
                    />
                </motion.div>
            </main>
        </div>
    )
}
