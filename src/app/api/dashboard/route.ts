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

    // Get user info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, role: true }
    })

    // Get learning goals
    const learningGoals = await db.learningGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    // Get active roadmap with steps
    const activeRoadmap = await db.roadmap.findFirst({
      where: { 
        userId: session.user.id,
        status: "ACTIVE"
      },
      include: {
        steps: {
          orderBy: { order: "asc" },
          take: 5
        },
        learningGoal: true
      }
    })

    // Get recent chat sessions
    const recentSessions = await db.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: { messages: true }
        }
      }
    })

    // Calculate progress
    const totalSteps = activeRoadmap?.steps?.length || 0
    const completedSteps = activeRoadmap?.steps?.filter(step => step.status === "COMPLETED").length || 0
    
    // Get progress records for time tracking
    const progressRecords = await db.progress.findMany({
      where: { 
        userId: session.user.id,
        lastAccessed: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    const timeSpent = progressRecords.reduce((total, record) => total + record.timeSpent, 0)
    
    // Calculate streak (consecutive days with activity)
    const streak = await calculateStreak(session.user.id)

    return NextResponse.json({
      user,
      learningGoals,
      activeRoadmap,
      recentSessions,
      progress: {
        totalSteps,
        completedSteps,
        timeSpent,
        streak
      }
    })

  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function calculateStreak(userId: string): Promise<number> {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const progressRecords = await db.progress.findMany({
      where: {
        userId,
        lastAccessed: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { lastAccessed: "desc" }
    })

    if (progressRecords.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      
      const hasActivity = progressRecords.some(record => {
        const recordDate = new Date(record.lastAccessed)
        recordDate.setHours(0, 0, 0, 0)
        return recordDate.getTime() === checkDate.getTime()
      })
      
      if (hasActivity) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  } catch (error) {
    console.error("Error calculating streak:", error)
    return 0
  }
}