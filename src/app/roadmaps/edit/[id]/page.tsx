'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Roadmap {
    id: string
    title: string
    description: string
    subject: string
    difficulty: string
    specificTopics?: string
}

async function fetchRoadmap(id: string): Promise<Roadmap> {
    const response = await fetch(`/api/roadmaps/${id}`)
    if (!response.ok) throw new Error('Failed to fetch roadmap')
    return response.json()
}

async function updateRoadmap(id: string, data: Partial<Roadmap>): Promise<void> {
    const response = await fetch(`/api/roadmaps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update roadmap')
}

export default function EditRoadmapPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const { toast } = useToast()
    const roadmapId = params.id as string

    const { data: roadmap, isLoading } = useQuery({
        queryKey: ['roadmap', roadmapId],
        queryFn: () => fetchRoadmap(roadmapId),
        enabled: !!session?.user && !!roadmapId,
    })

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        difficulty: 'intermediate',
        specificTopics: '',
    })

    useEffect(() => {
        if (roadmap) {
            setFormData({
                title: roadmap.title || '',
                description: roadmap.description || '',
                subject: roadmap.subject || '',
                difficulty: roadmap.difficulty || 'intermediate',
                specificTopics: roadmap.specificTopics || '',
            })
        }
    }, [roadmap])

    const updateMutation = useMutation({
        mutationFn: () => updateRoadmap(roadmapId, formData),
        onSuccess: () => {
            toast({
                title: "Roadmap updated",
                description: "Your changes have been saved successfully.",
            })
            router.push(`/roadmaps/${roadmapId}`)
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update roadmap. Please try again.",
                variant: "destructive",
            })
        }
    })

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
            >
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/roadmaps/${roadmapId}`}>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                Edit Roadmap
                            </h1>
                            <p className="text-xs text-gray-500">Update your learning path</p>
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
                            <CardTitle className="text-blue-900">Roadmap Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="border-blue-200 focus:border-blue-500"
                                    placeholder="e.g., Web Development Fundamentals"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="border-blue-200 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Describe what this roadmap covers..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-700 font-medium">Subject Area</Label>
                                    <Select
                                        value={formData.subject}
                                        onValueChange={(v) => setFormData({ ...formData, subject: v })}
                                    >
                                        <SelectTrigger className="border-blue-200">
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
                                    <Label className="text-gray-700 font-medium">Difficulty Level</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                                    >
                                        <SelectTrigger className="border-blue-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="specificTopics" className="text-gray-700 font-medium">
                                    Specific Topics (Optional)
                                </Label>
                                <Textarea
                                    id="specificTopics"
                                    value={formData.specificTopics}
                                    onChange={(e) => setFormData({ ...formData, specificTopics: e.target.value })}
                                    className="border-blue-200 focus:border-blue-500"
                                    rows={3}
                                    placeholder="e.g., HTML, CSS, JavaScript basics, React fundamentals..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                                <Link href={`/roadmaps/${roadmapId}`}>
                                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                                        Cancel
                                    </Button>
                                </Link>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        onClick={() => updateMutation.mutate()}
                                        disabled={updateMutation.isPending || !formData.title}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                                    >
                                        {updateMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
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
