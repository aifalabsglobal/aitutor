'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Flame, Sparkles } from 'lucide-react'

interface XPCelebrationProps {
    xpEarned: number
    leveledUp?: boolean
    newLevel?: number
    badge?: {
        icon: string
        name: string
        description: string
    }
    onClose: () => void
}

export function XPCelebration({ xpEarned, leveledUp, newLevel, badge, onClose }: XPCelebrationProps) {
    const [show, setShow] = useState(true)

    useEffect(() => {
        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            setShow(false)
            setTimeout(onClose, 500)
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShow(false)
                        setTimeout(onClose, 500)
                    }}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="max-w-md">
                            <CardContent className="p-8 text-center">
                                {/* XP Earned Animation */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.6, repeat: 2 }}
                                    className="text-8xl mb-4"
                                >
                                    ✨
                                </motion.div>

                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Amazing Work!
                                </h2>

                                {/* XP Badge */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white mb-4"
                                >
                                    <Star className="w-5 h-5" />
                                    <span className="text-2xl font-bold">+{xpEarned} XP</span>
                                </motion.div>

                                {/* Level Up */}
                                {leveledUp && newLevel && (
                                    <motion.div
                                        initial={{ scale: 0, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4 relative overflow-hidden"
                                    >
                                        {/* Confetti effect */}
                                        <div className="absolute inset-0">
                                            {[...Array(20)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 1 }}
                                                    animate={{
                                                        y: [null, 200],
                                                        x: [null, (Math.random() - 0.5) * 200],
                                                        opacity: [null, 0],
                                                        rotate: [0, Math.random() * 360]
                                                    }}
                                                    transition={{ duration: 2, delay: i * 0.05 }}
                                                    className="absolute top-0 left-1/2"
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 4],
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <div className="relative z-10">
                                            <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
                                            <p className="text-white font-bold text-2xl mb-1">Level Up! 🎊</p>
                                            <p className="text-white text-lg">You're now Level {newLevel}!</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* New Badge */}
                                {badge && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.7, type: "spring" }}
                                        className="p-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl border-2 border-amber-300 mb-4"
                                    >
                                        <p className="text-6xl mb-3">{badge.icon}</p>
                                        <p className="font-bold text-xl text-amber-900 mb-1">New Badge Unlocked!</p>
                                        <p className="font-semibold text-amber-800">{badge.name}</p>
                                        <p className="text-sm text-amber-700">{badge.description}</p>
                                    </motion.div>
                                )}

                                {/* Close Button */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                >
                                    <Button
                                        onClick={() => {
                                            setShow(false)
                                            setTimeout(onClose, 500)
                                        }}
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Continue Learning!
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
