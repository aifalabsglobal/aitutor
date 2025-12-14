import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiService } from "@/lib/ai-service"

interface CreateRoadmapInput {
    title: string
    description: string
    subject: string
    difficulty: string
    roadmapType: 'PERSONALIZED' | 'STANDARDIZED'
    specificTopics?: string
    steps?: Array<{
        title: string
        description: string
        difficulty: string
        estimatedMinutes: number
    }>
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const input: CreateRoadmapInput = await request.json()

        // Create or get learning goal
        let learningGoal = await db.learningGoal.findFirst({
            where: {
                userId: session.user.id,
                subject: input.subject
            }
        })

        if (!learningGoal) {
            learningGoal = await db.learningGoal.create({
                data: {
                    userId: session.user.id,
                    title: input.title,
                    subject: input.subject,
                    targetLevel: input.difficulty,
                    timeCommitment: 60, // default 1 hour per week
                }
            })
        }

        let stepsToCreate: any[] = []

        if (input.roadmapType === 'PERSONALIZED') {
            // AI-generated roadmap
            const prompt = `
        Create a detailed learning roadmap for: "${input.title}"
        Subject: ${input.subject}
        Difficulty: ${input.difficulty}
        ${input.specificTopics ? `Specific topics to include: ${input.specificTopics}` : ''}
        
        Generate a JSON array of steps with the following structure:
        [
          {
            "title": "Step title",
            "description": "What this step covers (2-3 sentences)",
            "difficulty": "beginner|intermediate|advanced",
            "estimatedMinutes": 30,
            "prerequisites": [] // array of step indices (0-based) that must be completed first
          }
        ]
        
        Requirements:
        - Generate 6-10 steps that progressively build knowledge
        - Earlier steps should be prerequisites for later ones
        - Include a mix of learning and practice steps
        - Each step should be completable in 20-60 minutes
        - Make descriptions specific and actionable
        
        Return ONLY valid JSON array, no other text.
      `

            try {
                const completion = await aiService.generateResponse([
                    {
                        role: "system",
                        content: "You are an expert learning experience designer with 15+ years creating engaging educational content. Write like a trusted mentor - professional but friendly, specific and actionable, motivating and clear. Create roadmaps that build confidence step-by-step with practical, real-world applications. Always respond with valid JSON only - no markdown, no explanations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ], 'gpt-4', {
                    temperature: 0.7,
                    max_tokens: 2000
                })

                stepsToCreate = JSON.parse(completion.content)
            } catch (aiError) {
                console.error("AI generation failed, using default steps:", aiError)
                // Fallback to default steps
                stepsToCreate = [
                    {
                        title: `Introduction to ${input.title}`,
                        description: `Overview of the fundamentals and core concepts.`,
                        difficulty: "beginner",
                        estimatedMinutes: 30,
                        prerequisites: []
                    },
                    {
                        title: `Core Concepts`,
                        description: `Deep dive into essential concepts and principles.`,
                        difficulty: "intermediate",
                        estimatedMinutes: 45,
                        prerequisites: [0]
                    },
                    {
                        title: `Practical Application`,
                        description: `Hands-on exercises to apply what you've learned.`,
                        difficulty: "intermediate",
                        estimatedMinutes: 60,
                        prerequisites: [1]
                    },
                    {
                        title: `Advanced Topics`,
                        description: `Explore advanced concepts and best practices.`,
                        difficulty: "advanced",
                        estimatedMinutes: 45,
                        prerequisites: [2]
                    },
                    {
                        title: `Final Project`,
                        description: `Complete a comprehensive project demonstrating mastery.`,
                        difficulty: "advanced",
                        estimatedMinutes: 90,
                        prerequisites: [3]
                    }
                ]
            }
        } else {
            // Standardized roadmap from user-provided steps
            stepsToCreate = (input.steps || []).map((step, index) => ({
                ...step,
                prerequisites: index > 0 ? [index - 1] : []
            }))
        }

        // Calculate visual positions for flowchart
        const stepsWithPositions = stepsToCreate.map((step: any, index: number) => ({
            ...step,
            order: index + 1,
            positionX: 0,
            positionY: index * 120, // Vertical spacing
            status: index === 0 ? 'AVAILABLE' : 'LOCKED',
            prerequisites: JSON.stringify(step.prerequisites || [])
        }))

        // Create roadmap with steps
        const roadmap = await db.roadmap.create({
            data: {
                userId: session.user.id,
                learningGoalId: learningGoal.id,
                title: input.title,
                description: input.description || `A ${input.difficulty} learning path for ${input.subject}`,
                totalSteps: stepsWithPositions.length,
                estimatedHours: Math.ceil(stepsWithPositions.reduce((sum: number, s: any) => sum + s.estimatedMinutes, 0) / 60),
                difficulty: input.difficulty,
                roadmapType: input.roadmapType,
                status: 'ACTIVE',
                generatedBy: input.roadmapType === 'PERSONALIZED' ? 'AI (GPT-4)' : 'Template',
                steps: {
                    create: stepsWithPositions.map((step: any) => ({
                        title: step.title,
                        description: step.description,
                        order: step.order,
                        type: 'TOPIC',
                        difficulty: step.difficulty,
                        estimatedMinutes: step.estimatedMinutes,
                        prerequisites: step.prerequisites,
                        status: step.status,
                        positionX: step.positionX,
                        positionY: step.positionY,
                        masteryThreshold: 70,
                    }))
                }
            },
            include: {
                steps: true
            }
        })

        return NextResponse.json({
            id: roadmap.id,
            message: "Roadmap created successfully",
            stepsCount: roadmap.steps.length
        })

    } catch (error) {
        console.error("Roadmap creation error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
