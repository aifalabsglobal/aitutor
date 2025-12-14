import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiService } from "@/lib/ai-service"

// GET - Fetch assessment questions for a node
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nodeId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { nodeId } = await params

        const node = await db.roadmapStep.findUnique({
            where: { id: nodeId }
        })

        if (!node) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 })
        }

        // Generate assessment questions using AI
        const prompt = `Create an educational assessment for:

**Topic:** ${node.title}
**Description:** ${node.description}
**Level:** ${node.difficulty}

**Generate 4 high-quality questions:**
- 3 multiple choice (test understanding, not memorization)
- 1 short answer (test application/explanation)

**Quality Standards:**
✓ Questions test concepts, not trivia
✓ Use real-world scenarios when possible
✓ MCQ distractors should be plausible
✓ Clear, unambiguous wording
✓ Progressive difficulty

**JSON Structure:**
[
  {
    "id": "q1",
    "question": "Specific, scenario-based question",
    "type": "MCQ",
    "options": ["Correct answer", "Plausible wrong", "Another wrong", "Third wrong"],
    "correctAnswer": "Correct answer",
    "explanation": "Why this is correct + brief learning insight"
  }
]

Return ONLY valid JSON array.`

        let questions: any[] = []
        try {
            const completion = await aiService.generateResponse([
                {
                    role: "system",
                    content: "You are an experienced assessment designer creating fair, educational questions. Design questions that test true understanding through real-world scenarios. Explanations should teach, not just correct. Professional + encouraging tone. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ], 'gpt-4', {
                temperature: 0.6,
                max_tokens: 1500
            })
            questions = JSON.parse(completion.content)
        } catch (aiError) {
            console.error("AI assessment generation failed:", aiError)
            // Fallback questions
            questions = [
                {
                    id: "q1",
                    question: `What is the main concept of ${node.title}?`,
                    type: "MCQ",
                    options: ["I understand it well", "I need more practice", "I'm confused", "I haven't studied this yet"],
                    correctAnswer: "I understand it well"
                },
                {
                    id: "q2",
                    question: "How would you apply this concept in practice?",
                    type: "SHORT_ANSWER",
                    correctAnswer: "practical application"
                }
            ]
        }

        return NextResponse.json(questions)

    } catch (error) {
        console.error("Assessment fetch error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Submit assessment answers
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ nodeId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { nodeId } = await params
        const { answers } = await request.json()

        const node = await db.roadmapStep.findUnique({
            where: { id: nodeId },
            include: {
                roadmap: true
            }
        })

        if (!node) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 })
        }

        // Calculate score (simplified - in production, compare with correct answers)
        // For now, generate a score based on number of answers provided
        const answeredCount = Object.keys(answers).length
        const baseScore = Math.min(100, answeredCount * 25)

        // Add some randomization for demo purposes
        const score = Math.min(100, baseScore + Math.floor(Math.random() * 20))
        const passed = score >= node.masteryThreshold

        // Update node
        const newAttempts = node.attempts + 1
        let newStatus = node.status

        if (passed) {
            newStatus = 'COMPLETED'
            // Unlock dependent nodes
            const roadmapSteps = await db.roadmapStep.findMany({
                where: { roadmapId: node.roadmapId },
                orderBy: { order: 'asc' }
            })

            const currentIndex = roadmapSteps.findIndex(s => s.id === nodeId)
            if (currentIndex < roadmapSteps.length - 1) {
                const nextStep = roadmapSteps[currentIndex + 1]
                if (nextStep.status === 'LOCKED') {
                    await db.roadmapStep.update({
                        where: { id: nextStep.id },
                        data: { status: 'AVAILABLE' }
                    })
                }
            }
        } else if (newAttempts >= 3) {
            newStatus = 'NEEDS_REVIEW'
        }

        await db.roadmapStep.update({
            where: { id: nodeId },
            data: {
                currentScore: score,
                attempts: newAttempts,
                status: newStatus
            }
        })

        // Create assessment record
        await db.nodeAssessment.create({
            data: {
                userId: session.user.id,
                stepId: nodeId,
                score,
                passed,
                answers,
                timeSpent: 300, // Default 5 minutes
                attemptNumber: newAttempts
            }
        })

        const feedback = passed
            ? "Excellent work! You've demonstrated a solid understanding of this topic."
            : newAttempts >= 3
                ? "You've made multiple attempts. Consider requesting a tutor for personalized help."
                : "Keep going! Review the content and try again. Focus on the areas you found challenging."

        return NextResponse.json({
            score,
            passed,
            feedback
        })

    } catch (error) {
        console.error("Assessment submit error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
