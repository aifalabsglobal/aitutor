import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { awardXP, updateStreak, awardBadge, XP_REWARDS } from "@/lib/gamification"

/**
 * Award XP to user
 * POST /api/gamification/award-xp
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { action, bonus = 0 } = await request.json()

        // Update daily streak
        await updateStreak(session.user.id)

        // Award XP based on action
        let xpAmount = 0
        let reason = ""

        switch (action) {
            case "LESSON_COMPLETE":
                xpAmount = XP_REWARDS.LESSON_COMPLETE + bonus
                reason = "Completed a lesson"
                break
            case "QUIZ_PASS":
                xpAmount = XP_REWARDS.QUIZ_PASS + bonus
                reason = "Passed a quiz"
                break
            case "PERFECT_QUIZ":
                xpAmount = XP_REWARDS.PERFECT_QUIZ + bonus
                reason = "Perfect quiz score!"
                await awardBadge(session.user.id, 'PERFECT_SCORE' as any)
                break
            case "ASSESSMENT_PASS":
                xpAmount = XP_REWARDS.ASSESSMENT_PASS + bonus
                reason = "Passed assessment"
                break
            case "ROADMAP_COMPLETE":
                xpAmount = XP_REWARDS.ROADMAP_COMPLETE + bonus
                reason = "Completed entire roadmap!"
                await awardBadge(session.user.id, 'ROADMAP_COMPLETE' as any)
                break
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const result = await awardXP(session.user.id, xpAmount, reason)

        return NextResponse.json({
            success: true,
            ...result,
            message: reason
        })
    } catch (error) {
        console.error("Gamification error:", error)
        return NextResponse.json(
            { error: "Failed to award XP" },
            { status: 500 }
        )
    }
}
