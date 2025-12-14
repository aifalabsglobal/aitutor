'use client'

import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Users,
    BookOpen,
    Target,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Sparkles
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface TutorAssignment {
    id: string
    studentId: string
    roadmapId: string
    blockedNodes: string[]
    reason: string
    sessionCount: number
    status: string
    createdAt: string
    student: {
        id: string
        name: string
        email: string
    }
    roadmap: {
        id: string
        title: string
    }
}

async function fetchTutorAssignments(): Promise<TutorAssignment[]> {
    const response = await fetch('/api/tutor/request')
    if (!response.ok) throw new Error('Failed to fetch assignments')
    return response.json()
}

async function markAssignmentComplete(assignmentId: string) {
    const response = await fetch('/api/tutor/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId })
    })
    if (!response.ok) throw new Error('Failed to complete assignment')
    return response.json()
}

export default function TutorDashboard() {
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    const { data: assignments, isLoading } = useQuery({
        queryKey: ['tutor-assignments'],
        queryFn: fetchTutorAssignments,
        enabled: !!session?.user && session.user.role === 'TUTOR',
    })

    const completeMutation = useMutation({
        mutationFn: markAssignmentComplete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tutor-assignments'] })
        }
    })

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (session.user.role !== 'TUTOR') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="max-w-md border-blue-100">
                        <CardContent className="p-8 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-blue-900 mb-2">Access Denied</h2>
                            <p className="text-gray-600">
                                You need tutor privileges to access this dashboard.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    const pendingCount = assignments?.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length || 0
    const completedCount = assignments?.filter(a => a.status === 'COMPLETED').length || 0

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
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
                            >
                                <Users className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Tutor Dashboard</h1>
                                <p className="text-sm text-gray-600">Manage student assignments</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                                    Switch to Student View
                                </Button>
                            </Link>
                            <span className="text-sm text-gray-600">
                                Welcome, {session.user?.name || "Tutor"}
                            </span>
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
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                        Tutor Dashboard
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Help students who need guidance on challenging topics.
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: "Active Sessions", value: pendingCount, icon: Clock, color: "orange" },
                        { label: "Completed", value: completedCount, icon: CheckCircle, color: "green" },
                        { label: "Total Students", value: new Set(assignments?.map(a => a.studentId)).size, icon: Users, color: "blue" }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Card className="border-blue-100 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="text-3xl font-bold text-blue-900">{stat.value}</p>
                                        </div>
                                        <div className={`w-14 h-14 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                                            <stat.icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Assignment Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Card className="border-blue-100 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Target className="w-5 h-5 text-blue-600" />
                                Student Assignments
                            </CardTitle>
                            <CardDescription>
                                Students who need your help with specific topics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                                </div>
                            ) : assignments && assignments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Roadmap</TableHead>
                                            <TableHead>Blocked Topics</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Requested</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignments.map((assignment) => (
                                            <TableRow key={assignment.id} className="hover:bg-blue-50">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-blue-900">{assignment.student.name}</p>
                                                        <p className="text-sm text-gray-600">{assignment.student.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{assignment.roadmap.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                                                        {assignment.blockedNodes.length} topic(s)
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        assignment.status === 'COMPLETED' ? 'bg-green-600' :
                                                            assignment.status === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-orange-600'
                                                    }>
                                                        {assignment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {new Date(assignment.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Link href={`/tutor/session/${assignment.id}`}>
                                                            <Button size="sm" variant="outline" className="border-blue-300 hover:bg-blue-50">
                                                                View Details
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                        {assignment.status !== 'COMPLETED' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => completeMutation.mutate(assignment.id)}
                                                                disabled={completeMutation.isPending}
                                                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                                            >
                                                                Mark Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-16 text-center">
                                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-blue-900 mb-2">No assignments yet</h3>
                                    <p className="text-gray-600">
                                        When students request help, their assignments will appear here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    )
}
