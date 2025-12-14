import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Mark tutor session as complete
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.user.role !== 'TUTOR' && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        const { assignmentId, tutorNotes } = await request.json()

        // Get the assignment
        const assignment = await db.tutorAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                roadmap: {
                    include: { steps: true }
                }
            }
        })

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        // Update assignment status
        await db.tutorAssignment.update({
            where: { id: assignmentId },
            data: {
                status: 'COMPLETED',
                tutorNotes,
                completedAt: new Date()
            }
        })

        // Update blocked node statuses to AVAILABLE for reassessment
        for (const nodeId of assignment.blockedNodes) {
            await db.roadmapStep.update({
                where: { id: nodeId },
                data: {
                    status: 'AVAILABLE',
                    attempts: 0, // Reset attempts for fresh reassessment
                    currentScore: 0
                }
            })
        }

        // Resume roadmap
        await db.roadmap.update({
            where: { id: assignment.roadmapId },
            data: { status: 'ACTIVE' }
        })

        return NextResponse.json({
            message: "Tutor session completed. Student can now be reassessed.",
            assignmentId
        })

    } catch (error) {
        console.error("Complete assignment error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
