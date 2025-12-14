'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    Target,
    Sparkles,
    FileText,
    ArrowLeft,
    Plus,
    Trash2,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface RoadmapStep {
    title: string
    description: string
    difficulty: string
    estimatedMinutes: number
}

export default function CreateRoadmapPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [roadmapType, setRoadmapType] = useState<'PERSONALIZED' | 'STANDARDIZED'>('PERSONALIZED')

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        difficulty: 'intermediate',
        targetLevel: 'intermediate',
        specificTopics: '',
    })

    // Manual steps for standardized roadmap
    const [manualSteps, setManualSteps] = useState<RoadmapStep[]>([
        { title: '', description: '', difficulty: 'beginner', estimatedMinutes: 30 }
    ])

    const addStep = () => {
        setManualSteps([...manualSteps, {
            title: '',
            description: '',
            difficulty: 'intermediate',
            estimatedMinutes: 30
        }])
    }

    const removeStep = (index: number) => {
        if (manualSteps.length > 1) {
            setManualSteps(manualSteps.filter((_, i) => i !== index))
        }
    }

    const updateStep = (index: number, field: keyof RoadmapStep, value: string | number) => {
        const updated = [...manualSteps]
        updated[index] = { ...updated[index], [field]: value }
        setManualSteps(updated)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/roadmaps/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    roadmapType,
                    steps: roadmapType === 'STANDARDIZED' ? manualSteps : undefined
                })
            })

            if (response.ok) {
                const data = await response.json()
                router.push(`/roadmaps/${data.id}`)
            } else {
                alert('Failed to create roadmap')
            }
        } catch (error) {
            console.error('Error creating roadmap:', error)
            alert('An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
            >
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/roadmaps">
                                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
                                >
                                    <BookOpen className="w-6 h-6 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Create Roadmap</h1>
                                    <p className="text-xs text-gray-500">Plan your learning journey</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Card className="border-blue-100 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Target className="w-5 h-5 text-blue-600" />
                                Create a New Learning Roadmap
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Choose between AI-powered personalized roadmap or a template-based standardized roadmap.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Roadmap Type Selection */}
                            <div>
                                <Label className="text-base font-medium">Roadmap Type</Label>
                                <RadioGroup
                                    value={roadmapType}
                                    onValueChange={(v) => setRoadmapType(v as 'PERSONALIZED' | 'STANDARDIZED')}
                                    className="grid grid-cols-2 gap-4 mt-3"
                                >
                                    <Label
                                        htmlFor="personalized"
                                        className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${roadmapType === 'PERSONALIZED' ? 'border-blue-600 bg-blue-50' : 'border-blue-200 hover:border-blue-400'}
                  `}
                                    >
                                        <RadioGroupItem value="PERSONALIZED" id="personalized" className="sr-only" />
                                        <Sparkles className="w-8 h-8 text-blue-600 mb-2" />
                                        <span className="font-medium text-blue-900">AI Personalized</span>
                                        <span className="text-xs text-gray-600 text-center mt-1">
                                            AI generates a unique roadmap based on your inputs
                                        </span>
                                    </Label>
                                    <Label
                                        htmlFor="standardized"
                                        className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${roadmapType === 'STANDARDIZED' ? 'border-purple-600 bg-purple-50' : 'border-blue-200 hover:border-purple-400'}
                  `}
                                    >
                                        <RadioGroupItem value="STANDARDIZED" id="standardized" className="sr-only" />
                                        <FileText className="w-8 h-8 text-purple-600 mb-2" />
                                        <span className="font-medium text-purple-900">Template Based</span>
                                        <span className="text-xs text-gray-600 text-center mt-1">
                                            Define your own steps, AI adapts to student level
                                        </span>
                                    </Label>
                                </RadioGroup>
                            </div>

                            {/* Common Fields */}
                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="title" className="text-gray-700 font-medium">Roadmap Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Web Development Fundamentals"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="border-blue-200 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what this roadmap covers..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Subject Area</Label>
                                        <Select
                                            value={formData.subject}
                                            onValueChange={(v) => setFormData({ ...formData, subject: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="programming">Programming & Development</SelectItem>
                                                <SelectItem value="mathematics">Mathematics</SelectItem>
                                                <SelectItem value="science">Science</SelectItem>
                                                <SelectItem value="languages">Languages</SelectItem>
                                                <SelectItem value="business">Business</SelectItem>
                                                <SelectItem value="design">Design</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Difficulty Level</Label>
                                        <Select
                                            value={formData.difficulty}
                                            onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                                <SelectItem value="expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Personalized: Specific Topics */}
                            {roadmapType === 'PERSONALIZED' && (
                                <div>
                                    <Label htmlFor="specificTopics">Specific Topics to Cover (Optional)</Label>
                                    <Textarea
                                        id="specificTopics"
                                        placeholder="e.g., HTML, CSS, JavaScript basics, React fundamentals, API integration..."
                                        value={formData.specificTopics}
                                        onChange={(e) => setFormData({ ...formData, specificTopics: e.target.value })}
                                        rows={3}
                                    />
                                    <p className="text-sm text-slate-500 mt-1">
                                        The AI will generate a comprehensive roadmap including these topics and relevant prerequisites.
                                    </p>
                                </div>
                            )}

                            {/* Standardized: Manual Steps */}
                            {roadmapType === 'STANDARDIZED' && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-base">Roadmap Steps</Label>
                                        <Button variant="outline" size="sm" onClick={addStep}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Step
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {manualSteps.map((step, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <Badge variant="outline" className="mt-1">Step {index + 1}</Badge>
                                                    {manualSteps.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeStep(index)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid gap-3 mt-3">
                                                    <Input
                                                        placeholder="Step title"
                                                        value={step.title}
                                                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                                                    />
                                                    <Textarea
                                                        placeholder="Step description"
                                                        value={step.description}
                                                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                                                        rows={2}
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Select
                                                            value={step.difficulty}
                                                            onValueChange={(v) => updateStep(index, 'difficulty', v)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                                <SelectItem value="advanced">Advanced</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            type="number"
                                                            placeholder="Minutes"
                                                            value={step.estimatedMinutes}
                                                            onChange={(e) => updateStep(index, 'estimatedMinutes', parseInt(e.target.value) || 30)}
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-blue-100 mt-6">
                                <Link href="/roadmaps">
                                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50">Cancel</Button>
                                </Link>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading || !formData.title || !formData.subject}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Create Roadmap
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    )
}
