import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user with their full context
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                learningGoals: {
                    where: { status: 'ACTIVE' },
                    take: 5
                },
                roadmaps: {
                    where: { status: 'ACTIVE' },
                    include: {
                        steps: {
                            where: { status: 'COMPLETED' },
                            select: { id: true }
                        }
                    },
                    take: 1,
                    orderBy: { updatedAt: 'desc' }
                },
                studentProfile: true,
                chatSessions: {
                    take: 1,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        messages: {
                            where: { role: 'USER' },
                            take: 10,
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate progress
        const totalLessons = user.roadmaps.reduce((sum, rm) => sum + rm.totalSteps, 0)
        const completedLessons = user.roadmaps.reduce(
            (sum, rm) => sum + rm.steps.length,
            0
        )
        const totalProgress = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0

        // Get recent questions
        const recentQuestions = user.chatSessions[0]?.messages
            .map(msg => msg.content)
            .slice(0, 5) || []

        // Build context
        const context = {
            userId: user.id,
            userName: user.name,
            preferredLanguage: user.preferredLanguage,
            learningGoals: user.learningGoals.map(g => g.title),
            currentLevel: user.studentProfile?.currentLevel,
            completedLessons,
            totalProgress,
            recentQuestions,
            strugglingTopics: [] // TODO: Analyze from assessments
        }

        return NextResponse.json(context)
    } catch (error) {
        console.error('Context API error:', error)
        return NextResponse.json({ error: 'Failed to load context' }, { status: 500 })
    }
}
