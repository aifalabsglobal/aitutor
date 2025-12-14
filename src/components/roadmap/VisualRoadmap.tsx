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
                    <h2 className="text-2xl font-bold">{roadmapTitle}</h2>
                    <p className="text-slate-600">
                        {nodes.filter(n => n.status === 'COMPLETED').length} of {nodes.length} steps completed
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-48">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Status legend */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                            <div className={`w-6 h-6 rounded-full ${config.color} border-2 flex items-center justify-center`}>
                                <Icon className={`w-3 h-3 ${config.textColor}`} />
                            </div>
                            <span className="text-slate-600">{config.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Visual roadmap container */}
            <div className="flex gap-6">
                {/* Roadmap nodes - vertical flowchart */}
                <div
                    className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl p-6 overflow-auto min-h-[500px]"
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
                                        <div className="absolute left-[28px] top-[56px] w-0.5 h-12 bg-slate-300" />
                                    )}

                                    {/* Node */}
                                    <div
                                        className={`
                      flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all
                      ${isSelected ? 'bg-white shadow-lg ring-2 ring-primary' : 'hover:bg-white/50'}
                    `}
                                        onClick={() => handleNodeClick(node)}
                                    >
                                        {/* Status icon */}
                                        <div className={`
                      w-14 h-14 rounded-full ${config.color} border-2 
                      flex items-center justify-center flex-shrink-0
                      ${node.status === 'COMPLETED' ? 'ring-2 ring-green-200' : ''}
                    `}>
                                            <Icon className={`w-6 h-6 ${config.textColor}`} />
                                        </div>

                                        {/* Node content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm text-slate-400">Step {node.order}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {node.difficulty}
                                                </Badge>
                                                {node.currentScore > 0 && (
                                                    <Badge
                                                        variant={node.currentScore >= node.masteryThreshold ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        Score: {node.currentScore}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-lg truncate">{node.title}</h3>
                                            <p className="text-sm text-slate-600 line-clamp-2">{node.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {node.estimatedMinutes} min
                                                </span>
                                                {node.attempts > 0 && (
                                                    <span>Attempts: {node.attempts}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <div className="flex-shrink-0">
                                            {canStartNode(node) && (
                                                <Button
                                                    size="sm"
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
                                                    className="text-orange-600 border-orange-300"
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
                    <Card className="w-80 flex-shrink-0">
                        <CardHeader>
                            <CardTitle className="text-lg">Node Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">{selectedNode.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">{selectedNode.description}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Status</span>
                                    <Badge variant="outline">{getStatusConfig(selectedNode.status).label}</Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Difficulty</span>
                                    <span>{selectedNode.difficulty}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Duration</span>
                                    <span>{selectedNode.estimatedMinutes} minutes</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Mastery Required</span>
                                    <span>{selectedNode.masteryThreshold}%</span>
                                </div>
                                {selectedNode.currentScore > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Current Score</span>
                                        <span className={selectedNode.currentScore >= selectedNode.masteryThreshold ? 'text-green-600' : 'text-orange-600'}>
                                            {selectedNode.currentScore}%
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Attempts</span>
                                    <span>{selectedNode.attempts}</span>
                                </div>
                            </div>

                            {canStartNode(selectedNode) && (
                                <Button
                                    className="w-full"
                                    onClick={() => onStartNode?.(selectedNode.id)}
                                >
                                    {selectedNode.status === 'IN_PROGRESS' ? 'Continue Learning' : 'Start Learning'}
                                </Button>
                            )}

                            {selectedNode.status === 'NEEDS_REVIEW' && selectedNode.attempts >= 3 && (
                                <Button
                                    variant="outline"
                                    className="w-full text-orange-600 border-orange-300"
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
