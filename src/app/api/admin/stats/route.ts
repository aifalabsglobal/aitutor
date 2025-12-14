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

    // Get total users
    const totalUsers = await db.user.count()

    // Get active users (users with activity in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeUsersResult = await db.progress.groupBy({
      by: ['userId'],
      where: {
        lastAccessed: {
          gte: sevenDaysAgo
        }
      }
    })

    const activeUsers = activeUsersResult.length

    // Get total roadmaps
    const totalRoadmaps = await db.roadmap.count()

    // Get total chat sessions
    const totalSessions = await db.chatSession.count()

    // Get total quizzes and average score
    const quizAttempts = await db.quizAttempt.findMany({
      select: { score: true }
    })

    const totalQuizzes = quizAttempts.length
    const averageScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length)
      : 0

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRoadmaps,
      totalSessions,
      totalQuizzes,
      averageScore
    })

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}