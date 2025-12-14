import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ roadmapId: string, nodeId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { roadmapId, nodeId } = await params

        // Verify roadmap ownership
        const roadmap = await db.roadmap.findUnique({
            where: {
                id: roadmapId,
                userId: session.user.id
            }
        })

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
        }

        // Get node content
        const node = await db.roadmapStep.findUnique({
            where: { id: nodeId }
        })

        if (!node) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 })
        }

        // Update status to IN_PROGRESS if AVAILABLE
        if (node.status === 'AVAILABLE') {
            await db.roadmapStep.update({
                where: { id: nodeId },
                data: { status: 'IN_PROGRESS' }
            })
        }

        return NextResponse.json({
            id: node.id,
            title: node.title,
            description: node.description,
            content: node.content,
            difficulty: node.difficulty,
            estimatedMinutes: node.estimatedMinutes,
            masteryThreshold: node.masteryThreshold,
            currentScore: node.currentScore,
            attempts: node.attempts,
            status: node.status
        })

    } catch (error) {
        console.error("Node content fetch error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
