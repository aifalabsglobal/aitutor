'use client'

import { useState, useEffect } from 'react'
import { useAIContext } from '@/contexts/ai-context'
import { speakText } from '@/components/ui/auto-read'
import { Sparkles, Target, Zap, CheckCircle } from 'lucide-react'

export function JarvisAssistant() {
    const context = useAIContext()
    const [suggestion, setSuggestion] = useState<string | null>(null)
    const [showHUD, setShowHUD] = useState(true)

    // Show welcome message on homepage
    useEffect(() => {
        if (context.currentPage === '/' && !context.userId) {
            setSuggestion("Welcome! I'm JARVIS, your AI learning assistant. Try voice commands with Ctrl+K.")
            setTimeout(() => {
                speakText("Welcome! I'm JARVIS, your AI learning assistant.", 1.0, 'en-US')
            }, 1000)
        }
    }, [context.currentPage, context.userId])

    // Status HUD
    const getStatusColor = () => {
        if (context.totalProgress < 30) return 'from-blue-500 to-cyan-500'
        if (context.totalProgress < 70) return 'from-purple-500 to-pink-500'
        return 'from-green-500 to-emerald-500'
    }

    if (!showHUD) return null

    return (
        <>
            {/* JARVIS HUD - Top Right */}
            <div className="fixed top-6 right-6 z-40 space-y-3">
                {/* Status Panel */}
                <div className="bg-black/80 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-4 shadow-2xl min-w-[280px] animate-slide-in-right">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span className="text-cyan-400 font-semibold text-sm tracking-wider">JARVIS</span>
                        <div className="ml-auto flex gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-500 text-xs">ONLINE</span>
                        </div>
                    </div>

                    {/* User Stats */}
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Status</span>
                            <span className="text-white font-mono">
                                {context.userId ? 'Active' : 'Demo Mode'}
                            </span>
                        </div>

                        {context.userId && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Progress</span>
                                    <span className="text-white font-mono">{context.totalProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-1000`}
                                        style={{ width: `${context.totalProgress}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-slate-400">Lessons Completed</span>
                                    <span className="text-white font-mono">{context.completedLessons}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Proactive Suggestion */}
                {suggestion && (
                    <div className="bg-gradient-to-r from-cyan-900/90 to-blue-900/90 backdrop-blur-lg border border-cyan-400/40 rounded-lg p-4 shadow-2xl animate-slide-in-right">
                        <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-cyan-100 text-sm leading-relaxed">
                                    {suggestion}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Learning Goals - Bottom Left HUD */}
            {context.learningGoals && context.learningGoals.length > 0 && (
                <div className="fixed bottom-6 left-6 z-40 bg-black/80 backdrop-blur-lg border border-purple-500/30 rounded-lg p-4 shadow-2xl max-w-xs animate-slide-up">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-semibold text-xs tracking-wider">OBJECTIVES</span>
                    </div>
                    <div className="space-y-2">
                        {context.learningGoals.slice(0, 3).map((goal, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                <span className="text-slate-300 text-xs">{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Voice Wave Indicator - When Speaking */}
            <div className="fixed bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                <div className="flex gap-1 items-end">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-pulse"
                            style={{
                                height: `${20 + Math.random() * 40}px`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
