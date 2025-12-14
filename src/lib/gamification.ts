/**
 * Gamification System
 * Handles XP, levels, streaks, badges, and achievements
 */

import { db } from './db'

// XP rewards for different actions
export const XP_REWARDS = {
    LESSON_COMPLETE: 50,
    QUIZ_PASS: 100,
    PERFECT_QUIZ: 150,
    ASSESSMENT_PASS: 75,
    DAILY_LOGIN: 10,
    STREAK_BONUS: 5, // per day
    ROADMAP_COMPLETE: 500,
    TUTOR_SESSION: 25,
    FIRST_TIME_BONUS: 50,
}

// Level thresholds
export const LEVELS = [
    { level: 1, xpRequired: 0, title: "Beginner" },
    { level: 2, xpRequired: 100, title: "Learner" },
    { level: 3, xpRequired: 250, title: "Student" },
    { level: 4, xpRequired: 500, title: "Apprentice" },
    { level: 5, xpRequired: 1000, title: "Scholar" },
    { level: 10, xpRequired: 3000, title: "Expert" },
    { level: 15, xpRequired: 7000, title: "Master" },
    { level: 20, xpRequired: 15000, title: "Guru" },
    { level: 25, xpRequired: 30000, title: "Legend" },
    { level: 50, xpRequired: 100000, title: "Grand Master" },
]

export function calculateLevel(xp: number): { level: number; title: string; progress: number; xpToNext: number } {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) {
            const current = LEVELS[i]
            const next = LEVELS[i + 1]

            if (!next) {
                return {
                    level: current.level,
                    title: current.title,
                    progress: 100,
                    xpToNext: 0
                }
            }

            const progressXp = xp - current.xpRequired
            const totalNeeded = next.xpRequired - current.xpRequired
            const progress = (progressXp / totalNeeded) * 100
            const xpToNext = next.xpRequired - xp

            return {
                level: current.level,
                title: current.title,
                progress: Math.min(Math.round(progress), 100),
                xpToNext: xpToNext
            }
        }
    }

    return { level: 1, title: "Beginner", progress: 0, xpToNext: 100 }
}

export async function awardXP(
    userId: string,
    xp: number,
    reason: string
): Promise<{ leveledUp: boolean; newLevel?: number; xpAwarded: number; badge?: any }> {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const oldLevel = calculateLevel(user.xp)
    const newXp = user.xp + xp
    const newLevel = calculateLevel(newXp)

    // Update user XP and level
    await db.user.update({
        where: { id: userId },
        data: {
            xp: newXp,
            level: newLevel.level
        }
    })

    const result: any = {
        leveledUp: newLevel.level > oldLevel.level,
        xpAwarded: xp
    }

    if (result.leveledUp) {
        result.newLevel = newLevel.level

        // Award badges for level milestones
        if (newLevel.level === 10) {
            result.badge = await awardBadge(userId, 'REACH_LEVEL_10' as any)
        } else if (newLevel.level === 25) {
            result.badge = await awardBadge(userId, 'REACH_LEVEL_25' as any)
        }
    }

    return result
}

export async function updateStreak(userId: string): Promise<number> {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
    if (lastActive) lastActive.setHours(0, 0, 0, 0)

    // Already counted today
    if (lastActive && lastActive.getTime() === today.getTime()) {
        return user.streak
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = 1
    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        // Continuing streak
        newStreak = user.streak + 1
    }

    const streakBonus = XP_REWARDS.DAILY_LOGIN + (newStreak * XP_REWARDS.STREAK_BONUS)

    const updated = await db.user.update({
        where: { id: userId },
        data: {
            streak: newStreak,
            longestStreak: Math.max(newStreak, user.longestStreak),
            lastActiveDate: new Date(),
            xp: { increment: streakBonus }
        }
    })

    // Award streak badges
    if (newStreak === 7) {
        await awardBadge(userId, 'WEEK_STREAK' as any)
    } else if (newStreak === 30) {
        await awardBadge(userId, 'MONTH_STREAK' as any)
        await checkAchievement(userId, 'STREAK_30_DAYS' as any)
    } else if (newStreak === 100) {
        await checkAchievement(userId, 'STREAK_100_DAYS' as any)
    }

    return updated.streak
}

export async function award Badge(userId: string, badgeType: any) {
    try {
        const badge = await db.badge.create({
            data: {
                userId,
                badgeType
            }
        })
        return badge
    } catch (error) {
        // Badge already exists
        return null
    }
}

export async function checkAchievement(userId: string, achievementType: any, increment: number = 1) {
    let achievement = await db.achievement.findUnique({
        where: {
            userId_achievementType: {
                userId,
                achievementType
            }
        }
    })

    if (!achievement) {
        achievement = await db.achievement.create({
            data: {
                userId,
                achievementType,
                progress: increment
            }
        })
    } else if (!achievement.completed) {
        achievement = await db.achievement.update({
            where: { id: achievement.id },
            data: {
                progress: { increment }
            }
        })

        // Check if completed
        if (achievement.progress >= achievement.targetProgress) {
            await db.achievement.update({
                where: { id: achievement.id },
                data: {
                    completed: true,
                    completedAt: new Date()
                }
            })

            // Award bonus XP for achievement
            await awardXP(userId, 200, `Achievement: ${achievementType}`)
        }
    }

    return achievement
}

export const BADGE_CONFIGS = {
    FIRST_LESSON: {
        icon: "🎓",
        name: "First Steps",
        description: "Completed your first lesson",
        color: "blue"
    },
    QUIZ_MASTER: {
        icon: "🏆",
        name: "Quiz Master",
        description: "Passed 10 quizzes",
        color: "yellow"
    },
    WEEK_STREAK: {
        icon: "🔥",
        name: "On Fire",
        description: "7-day learning streak",
        color: "orange"
    },
    MONTH_STREAK: {
        icon: "⭐",
        name: "Dedicated Learner",
        description: "30-day learning streak",
        color: "purple"
    },
    PERFECT_SCORE: {
        icon: "💯",
        name: "Perfectionist",
        description: "Got 100% on a quiz",
        color: "green"
    },
    EARLY_BIRD: {
        icon: "🌅",
        name: "Early Bird",
        description: "Learning before 9am",
        color: "yellow"
    },
    NIGHT_OWL: {
        icon: "🦉",
        name: "Night Owl",
        description: "Learning after 9pm",
        color: "indigo"
    },
    ROADMAP_COMPLETE: {
        icon: "🎯",
        name: "Goal Crusher",
        description: "Completed entire roadmap",
        color: "green"
    }
}
