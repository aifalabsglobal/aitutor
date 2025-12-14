import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Request a tutor for a specific node
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { nodeId, roadmapId, reason } = await request.json()

        // Verify the roadmap belongs to the user
        const roadmap = await db.roadmap.findUnique({
            where: {
                id: roadmapId,
                userId: session.user.id
            }
        })

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
        }

        // Update the step status to TUTOR_REQUIRED
        await db.roadmapStep.update({
            where: { id: nodeId },
            data: { status: 'TUTOR_REQUIRED' }
        })

        // Pause the roadmap
        await db.roadmap.update({
            where: { id: roadmapId },
            data: { status: 'PAUSED' }
        })

        // Create tutor assignment request
        const tutorAssignment = await db.tutorAssignment.create({
            data: {
                studentId: session.user.id,
                roadmapId,
                blockedNodes: [nodeId],
                reason: reason || "Student requested tutor assistance after multiple failed attempts",
                status: 'PENDING'
            }
        })

        return NextResponse.json({
            message: "Tutor request submitted successfully",
            assignmentId: tutorAssignment.id
        })

    } catch (error) {
        console.error("Tutor request error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// GET - Get tutor assignments (for admin/tutor)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // If tutor, get their assignments
        if (session.user.role === 'TUTOR') {
            const assignments = await db.tutorAssignment.findMany({
                where: { tutorId: session.user.id },
                include: {
                    student: {
                        select: { id: true, name: true, email: true }
                    },
                    roadmap: {
                        select: { id: true, title: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(assignments)
        }

        // If admin, get all pending assignments
        if (session.user.role === 'ADMIN') {
            const assignments = await db.tutorAssignment.findMany({
                where: { status: 'PENDING' },
                include: {
                    student: {
                        select: { id: true, name: true, email: true }
                    },
                    roadmap: {
                        select: { id: true, title: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(assignments)
        }

        // If student, get their own requests
        const assignments = await db.tutorAssignment.findMany({
            where: { studentId: session.user.id },
            include: {
                tutor: {
                    select: { id: true, name: true, email: true }
                },
                roadmap: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(assignments)

    } catch (error) {
        console.error("Tutor assignments fetch error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
