import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { calculateLevel } from "@/lib/gamification"

/**
 * Get user gamification stats
 * GET /api/gamification/stats
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                xp: true,
                level: true,
                streak: true,
                longestStreak: true,
                lastActiveDate: true,
                badges: {
                    orderBy: { earnedAt: 'desc' }
                },
                achievements: {
                    where: { completed: true },
                    orderBy: { completedAt: 'desc' }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const levelInfo = calculateLevel(user.xp)

        return NextResponse.json({
            xp: user.xp,
            level: user.level,
            levelInfo,
            streak: user.streak,
            longestStreak: user.longestStreak,
            lastActiveDate: user.lastActiveDate,
            badges: user.badges,
            achievements: user.achievements
        })
    } catch (error) {
        console.error("Get stats error:", error)
        return NextResponse.json(
            { error: "Failed to get stats" },
            { status: 500 }
        )
    }
}
