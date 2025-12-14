'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Lock,
    Play,
    CheckCircle,
    AlertCircle,
    User2,
    Clock,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize2
} from 'lucide-react'

export interface RoadmapNode {
    id: string
    title: string
    description: string
    order: number
    status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_REVIEW' | 'TUTOR_REQUIRED'
    difficulty: string
    estimatedMinutes: number
    masteryThreshold: number
    currentScore: number
    attempts: number
    prerequisites: string[]
    positionX: number
    positionY: number
}

interface VisualRoadmapProps {
    nodes: RoadmapNode[]
    roadmapTitle: string
    onNodeClick?: (node: RoadmapNode) => void
    onStartNode?: (nodeId: string) => void
    onRequestTutor?: (nodeId: string) => void
}

// Node status colors and icons
const statusConfig = {
    LOCKED: {
        color: 'bg-gray-100 border-gray-300',
        textColor: 'text-gray-400',
        icon: Lock,
        label: 'Locked'
    },
    AVAILABLE: {
        color: 'bg-blue-50 border-blue-300',
        textColor: 'text-blue-600',
        icon: Play,
        label: 'Available'
    },
    IN_PROGRESS: {
        color: 'bg-yellow-50 border-yellow-400',
        textColor: 'text-yellow-700',
        icon: Clock,
        label: 'In Progress'
    },
    COMPLETED: {
        color: 'bg-green-50 border-green-400',
        textColor: 'text-green-600',
        icon: CheckCircle,
        label: 'Completed'
    },
    NEEDS_REVIEW: {
        color: 'bg-orange-50 border-orange-400',
        textColor: 'text-orange-600',
        icon: AlertCircle,
        label: 'Needs Review'
    },
    TUTOR_REQUIRED: {
        color: 'bg-red-50 border-red-400',
        textColor: 'text-red-600',
        icon: User2,
        label: 'Tutor Required'
    },
}

export function VisualRoadmap({
    nodes,
    roadmapTitle,
    onNodeClick,
    onStartNode,
    onRequestTutor
}: VisualRoadmapProps) {
    const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
    const [zoom, setZoom] = useState(1)

    // Calculate overall progress
    const progress = useMemo(() => {
        if (nodes.length === 0) return 0
        const completed = nodes.filter(n => n.status === 'COMPLETED').length
        return Math.round((completed / nodes.length) * 100)
    }, [nodes])

    // Sort nodes by order for display
    const sortedNodes = useMemo(() => {
        return [...nodes].sort((a, b) => a.order - b.order)
    }, [nodes])

    // Handle node click
    const handleNodeClick = useCallback((node: RoadmapNode) => {
        setSelectedNode(node)
        onNodeClick?.(node)
    }, [onNodeClick])

    // Get status config for a node
    const getStatusConfig = (status: RoadmapNode['status']) => {
        return statusConfig[status] || statusConfig.LOCKED
    }

    // Check if node can be started
    const canStartNode = (node: RoadmapNode) => {
        return node.status === 'AVAILABLE' || node.status === 'IN_PROGRESS' || node.status === 'NEEDS_REVIEW'
    }

    return (
        <div className="space-y-6">
            {/* Header with progress */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{roadmapTitle}</h2>
                    <p className="text-gray-600 font-medium">
                        {nodes.filter(n => n.status === 'COMPLETED').length} of {nodes.length} steps completed
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-48">
                        <div className="flex justify-between text-sm mb-1 font-semibold">
                            <span className="text-blue-900">Progress</span>
                            <span className="text-blue-700">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="border-blue-200 hover:bg-blue-50">
                            <ZoomOut className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="border-blue-200 hover:bg-blue-50">
                            <ZoomIn className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setZoom(1)} className="border-blue-200 hover:bg-blue-50">
                            <Maximize2 className="w-4 h-4 text-blue-600" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Status legend */}
            <div className="flex flex-wrap gap-4 bg-gradient-to-r from-blue-50/50 to-white p-4 rounded-xl border border-blue-100">
                {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                        <div key={key} className="flex items-center gap-2 text-sm font-medium">
                            <div className={`w-7 h-7 rounded-full ${config.color} border-2 flex items-center justify-center shadow-sm`}>
                                <Icon className={`w-4 h-4 ${config.textColor}`} />
                            </div>
                            <span className="text-gray-700">{config.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Visual roadmap container */}
            <div className="flex gap-6">
                {/* Roadmap nodes - vertical flowchart */}
                <div
                    className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl p-6 overflow-auto min-h-[500px] border border-blue-100 shadow-lg"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                    <div className="relative">
                        {sortedNodes.map((node, index) => {
                            const config = getStatusConfig(node.status)
                            const Icon = config.icon
                            const isSelected = selectedNode?.id === node.id
                            const isLast = index === sortedNodes.length - 1

                            return (
                                <div key={node.id} className="relative">
                                    {/* Connecting line to next node */}
                                    {!isLast && (
                                        <div className="absolute left-[28px] top-[56px] w-1 h-12 bg-gradient-to-b from-blue-300 to-blue-200 rounded-full" />
                                    )}

                                    {/* Node */}
                                    <div
                                        className={`
                      flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2
                      ${isSelected
                                                ? 'bg-white shadow-2xl ring-2 ring-blue-400 border-blue-300 scale-[1.02]'
                                                : 'bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-xl border-blue-100 hover:border-blue-300'
                                            }
                    `}
                                        onClick={() => handleNodeClick(node)}
                                    >
                                        {/* Status icon */}
                                        <div className={`
                      w-16 h-16 rounded-2xl ${config.color} border-2 
                      flex items-center justify-center flex-shrink-0 shadow-lg
                      ${node.status === 'COMPLETED' ? 'ring-4 ring-green-200 scale-105' : ''}
                      transition-transform duration-300
                    `}>
                                            <Icon className={`w-7 h-7 ${config.textColor}`} />
                                        </div>

                                        {/* Node content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-bold text-blue-600">Step {node.order}</span>
                                                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                                    {node.difficulty}
                                                </Badge>
                                                {node.currentScore > 0 && (
                                                    <Badge
                                                        variant={node.currentScore >= node.masteryThreshold ? 'default' : 'secondary'}
                                                        className="text-xs bg-blue-600"
                                                    >
                                                        Score: {node.currentScore}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-lg text-blue-900 truncate mb-1">{node.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{node.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 font-medium">
                                                <span className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
                                                    <Clock className="w-4 h-4 text-blue-600" />
                                                    {node.estimatedMinutes} min
                                                </span>
                                                {node.attempts > 0 && (
                                                    <span className="bg-purple-50 px-2 py-1 rounded-lg font-semibold">Attempts: {node.attempts}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <div className="flex-shrink-0">
                                            {canStartNode(node) && (
                                                <Button
                                                    size="sm"
                                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onStartNode?.(node.id)
                                                    }}
                                                >
                                                    {node.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            )}
                                            {node.status === 'NEEDS_REVIEW' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onRequestTutor?.(node.id)
                                                    }}
                                                >
                                                    Request Tutor
                                                </Button>
                                            )}
                                            {node.status === 'TUTOR_REQUIRED' && (
                                                <Badge variant="destructive">Awaiting Tutor</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Spacing between nodes */}
                                    {!isLast && <div className="h-4" />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Node detail panel */}
                {selectedNode && (
                    <Card className="w-80 flex-shrink-0 border-blue-100 shadow-xl bg-gradient-to-br from-white to-blue-50">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Node Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="bg-white/80 p-4 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-blue-900">{selectedNode.title}</h3>
                                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{selectedNode.description}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="font-semibold text-gray-700">Status</span>
                                    <Badge variant="outline" className="border-blue-300 text-blue-700">{getStatusConfig(selectedNode.status).label}</Badge>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <span className="font-semibold text-gray-700">Difficulty</span>
                                    <span className="font-bold text-purple-700">{selectedNode.difficulty}</span>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-green-50 rounded-lg border border-green-100">
                                    <span className="font-semibold text-gray-700">Duration</span>
                                    <span className="font-bold text-green-700">{selectedNode.estimatedMinutes} minutes</span>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <span className="font-semibold text-gray-700">Mastery Required</span>
                                    <span className="font-bold text-orange-700">{selectedNode.masteryThreshold}%</span>
                                </div>
                                {selectedNode.currentScore > 0 && (
                                    <div className="flex justify-between text-sm p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <span className="font-semibold text-gray-700">Current Score</span>
                                        <span className={`font-bold ${selectedNode.currentScore >= selectedNode.masteryThreshold ? 'text-green-600' : 'text-orange-600'}`}>
                                            {selectedNode.currentScore}%
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="font-semibold text-gray-700">Attempts</span>
                                    <span className="font-bold text-gray-900">{selectedNode.attempts}</span>
                                </div>
                            </div>

                            {canStartNode(selectedNode) && (
                                <Button
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                                    onClick={() => onStartNode?.(selectedNode.id)}
                                >
                                    {selectedNode.status === 'IN_PROGRESS' ? 'Continue Learning' : 'Start Learning'}
                                </Button>
                            )}

                            {selectedNode.status === 'NEEDS_REVIEW' && selectedNode.attempts >= 3 && (
                                <Button
                                    variant="outline"
                                    className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                                    onClick={() => onRequestTutor?.(selectedNode.id)}
                                >
                                    Request Human Tutor
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default VisualRoadmap
