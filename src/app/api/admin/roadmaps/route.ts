import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roadmaps = await db.roadmap.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        learningGoal: {
          select: {
            subject: true
          }
        },
        _count: {
          select: {
            steps: true,
            progress: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json(roadmaps)

  } catch (error) {
    console.error("Admin roadmaps error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}