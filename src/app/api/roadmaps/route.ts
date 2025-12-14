import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roadmaps = await db.roadmap.findMany({
      where: { userId: session.user.id },
      include: {
        learningGoal: {
          select: { title: true }
        },
        steps: {
          select: {
            id: true,
            title: true,
            status: true,
            estimatedMinutes: true,
            order: true
          },
          orderBy: { order: "asc" },
          take: 5
        },
        progress: {
          select: {
            percentage: true,
            completed: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(roadmaps)

  } catch (error) {
    console.error("Roadmaps fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}