'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Trophy, Flame, Star, TrendingUp, Award, Target } from "lucide-react"
import { calculateLevel, BADGE_CONFIGS } from "@/lib/gamification"

interface GamificationDashboardProps {
    user: {
        xp: number
        level: number
        streak: number
        longestStreak: number
        badges?: Array<{ badgeType: string; earnedAt: Date }>
    }
}

export function GamificationDashboard({ user }: GamificationDashboardProps) {
    const levelInfo = calculateLevel(user.xp)

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Level & XP Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-blue-100 text-sm">Current Level</p>
                                <h2 className="text-5xl font-bold">{user.level}</h2>
                                <p className="text-blue-200 text-lg">{levelInfo.title}</p>
                            </div>
                            <Trophy className="w-16 h-16 text-blue-200" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress to Level {user.level + 1}</span>
                                <span>{user.xp} XP</span>
                            </div>
                            <Progress value={levelInfo.progress} className="h-3 bg-blue-400" />
                            <p className="text-xs text-blue-200">{levelInfo.xpToNext} XP to next level</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Flame className="w-4 h-4 text-orange-300" />
                                    <p className="text-blue-200 text-xs">Current Streak</p>
                                </div>
                                <p className="text-2xl font-bold">{user.streak} days</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="w-4 h-4 text-yellow-300" />
                                    <p className="text-blue-200 text-xs">Total XP</p>
                                </div>
                                <p className="text-2xl font-bold">{user.xp}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Streak Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-900">
                            <Flame className="w-5 h-5 text-orange-600" />
                            Learning Streak
                        </CardTitle>
                        <CardDescription>Keep it going! 🔥</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center mb-6">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-7xl mb-2"
                            >
                                🔥
                            </motion.div>
                            <p className="text-4xl font-bold text-orange-900 mb-1">{user.streak}</p>
                            <p className="text-gray-600">Day Streak</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Personal Best:</span>
                                <span className="text-lg font-bold text-orange-900">{user.longestStreak} days</span>
                            </div>
                        </div>

                        {user.streak >= 7 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-4 p-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg text-white text-center"
                            >
                                <p className="font-bold">You're on fire! 🔥</p>
                                <p className="text-sm">Keep up the amazing work!</p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Badges Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Award className="w-5 h-5 text-blue-600" />
                            Your Badges
                        </CardTitle>
                        <CardDescription>
                            {user.badges?.length || 0} earned
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.badges && user.badges.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {user.badges.map((badge, index) => {
                                    const config = BADGE_CONFIGS[badge.badgeType as keyof typeof BADGE_CONFIGS]
                                    return (
                                        <motion.div
                                            key={badge.badgeType}
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.1, type: "spring" }}
                                            whileHover={{ scale: 1.1 }}
                                            className="flex flex-col items-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 cursor-pointer"
                                        >
                                            <span className="text-4xl mb-1">{config?.icon || "🏆"}</span>
                                            <p className="text-xs font-semibold text-center text-amber-900">
                                                {config?.name || badge.badgeType}
                                            </p>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No badges yet</p>
                                <p className="text-xs">Start learning to earn your first badge!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-3"
            >
                <Card className="border-blue-100 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Your Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs text-gray-600">Level</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">{user.level}</p>
                                <p className="text-xs text-gray-500">{levelInfo.title}</p>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-purple-600" />
                                    <p className="text-xs text-gray-600">Total XP</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-900">{user.xp}</p>
                                <p className="text-xs text-gray-500">Experience Points</p>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-orange-600" />
                                    <p className="text-xs text-gray-600">Streak</p>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">{user.streak}</p>
                                <p className="text-xs text-gray-500">Days in a row</p>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-4 h-4 text-amber-600" />
                                    <p className="text-xs text-gray-600">Badges</p>
                                </div>
                                <p className="text-2xl font-bold text-amber-900">{user.badges?.length || 0}</p>
                                <p className="text-xs text-gray-500">Achievements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
