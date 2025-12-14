import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const roadmap = await db.roadmap.findUnique({
            where: {
                id,
                userId: session.user.id
            },
            include: {
                learningGoal: {
                    select: {
                        title: true,
                        subject: true
                    }
                },
                steps: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        order: true,
                        type: true,
                        difficulty: true,
                        estimatedMinutes: true,
                        prerequisites: true,
                        status: true,
                        masteryThreshold: true,
                        currentScore: true,
                        attempts: true,
                        positionX: true,
                        positionY: true
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
        }

        // Transform prerequisites from JSON string to array
        const transformedSteps = roadmap.steps.map(step => ({
            ...step,
            prerequisites: step.prerequisites ? JSON.parse(step.prerequisites) : []
        }))

        return NextResponse.json({
            ...roadmap,
            steps: transformedSteps
        })

    } catch (error) {
        console.error("Roadmap fetch error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const roadmap = await db.roadmap.findUnique({
            where: {
                id,
                userId: session.user.id
            }
        })

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
        }

        // Delete roadmap (cascade will delete related data)
        await db.roadmap.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Roadmap deleted successfully" })

    } catch (error) {
        console.error("Roadmap delete error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        // Verify ownership
        const roadmap = await db.roadmap.findUnique({
            where: {
                id,
                userId: session.user.id
            }
        })

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
        }

        // Update roadmap
        const updated = await db.roadmap.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                difficulty: body.difficulty,
            }
        })

        return NextResponse.json(updated)

    } catch (error) {
        console.error("Roadmap update error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
