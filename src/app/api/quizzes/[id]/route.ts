import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

        // Verify quiz exists (no ownership check since quizzes might be shared)
        const quiz = await db.quiz.findUnique({
            where: { id }
        })

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
        }

        // Delete quiz (cascade will delete related data)
        await db.quiz.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Quiz deleted successfully" })

    } catch (error) {
        console.error("Quiz delete error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
