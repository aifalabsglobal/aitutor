import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiService } from "@/lib/ai-service"

function parseJsonSafely(jsonString: string): any {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('JSON Parse Error:', error)
    console.error('Raw content:', jsonString)

    // Try to extract JSON from markdown code blocks
    const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch (e) {
        console.error('Failed to parse JSON from markdown block')
      }
    }

    // Return default structure if all parsing fails
    return {
      title: "Learning Roadmap",
      description: "Personalized learning path",
      totalSteps: 5,
      estimatedHours: 20,
      difficulty: "intermediate",
      steps: []
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { learningGoal, subject, currentLevel, targetLevel, timeCommitment, learningStyle, specificTopics, goals } = data

    // Create learning goal
    const learningGoalRecord = await db.learningGoal.create({
      data: {
        userId: session.user.id,
        title: learningGoal,
        description: goals,
        subject,
        targetLevel,
        timeCommitment: parseInt(timeCommitment) || 60,
        status: "ACTIVE"
      }
    })

    // Generate AI roadmap with fallback
    let roadmapData: any = null

    try {
      const model = aiService.selectOptimalModel('roadmap')

      const roadmapPrompt = `
      Create a comprehensive learning roadmap for a student who wants to:
      - Goal: ${learningGoal}
      - Subject: ${subject}
      - Current Level: ${currentLevel}
      - Target Level: ${targetLevel}
      - Time Commitment: ${timeCommitment} minutes per day
      - Learning Style: ${learningStyle}
      - Specific Topics: ${specificTopics}
      - Goals: ${goals}

      Create a JSON response with the following structure:
      {
        "title": "Roadmap title",
        "description": "Brief description",
        "totalSteps": number,
        "estimatedHours": number,
        "difficulty": "beginner|intermediate|advanced",
        "steps": [
          {
            "title": "Step title",
            "description": "Step description",
            "content": "Detailed learning content",
            "type": "TOPIC|EXERCISE|QUIZ|PROJECT|REVIEW",
            "difficulty": "beginner|intermediate|advanced",
            "estimatedMinutes": number,
            "prerequisites": [],
            "resources": {}
          }
        ]
      }
      `

      const completion = await aiService.generateResponse([
        {
          role: "system",
          content: "You are an expert educational curriculum designer. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: roadmapPrompt
        }
      ], model, {
        temperature: 0.7,
        max_tokens: 2000
      })

      roadmapData = parseJsonSafely(completion.content || "{}")
    } catch (aiError) {
      console.log("AI generation failed, using default roadmap:", aiError)
      // Create default roadmap when AI fails
      roadmapData = {
        title: `${subject} Learning Path`,
        description: `Master ${subject} from ${currentLevel} to ${targetLevel}`,
        totalSteps: 5,
        estimatedHours: 20,
        difficulty: targetLevel === 'advanced' ? 'advanced' : targetLevel === 'beginner' ? 'beginner' : 'intermediate',
        steps: [
          {
            title: `${subject} Fundamentals`,
            description: `Learn the core concepts and foundations of ${subject}`,
            content: `<h3>Introduction to ${subject}</h3><p>Start your journey by understanding the fundamental concepts.</p>`,
            type: "TOPIC",
            difficulty: "beginner",
            estimatedMinutes: 45,
            prerequisites: [],
            resources: {}
          },
          {
            title: `${subject} Core Concepts`,
            description: `Deep dive into essential principles and techniques`,
            content: `<h3>Core Concepts</h3><p>Build on your foundation with key principles.</p>`,
            type: "TOPIC",
            difficulty: "intermediate",
            estimatedMinutes: 60,
            prerequisites: [],
            resources: {}
          },
          {
            title: `${subject} Practice Exercises`,
            description: `Apply what you've learned through hands-on practice`,
            content: `<h3>Practice Time</h3><p>Put your knowledge to the test with exercises.</p>`,
            type: "EXERCISE",
            difficulty: "intermediate",
            estimatedMinutes: 90,
            prerequisites: [],
            resources: {}
          },
          {
            title: `${subject} Advanced Topics`,
            description: `Explore advanced concepts and best practices`,
            content: `<h3>Advanced Topics</h3><p>Take your skills to the next level.</p>`,
            type: "TOPIC",
            difficulty: "advanced",
            estimatedMinutes: 60,
            prerequisites: [],
            resources: {}
          },
          {
            title: `${subject} Capstone Project`,
            description: `Complete a comprehensive project demonstrating your mastery`,
            content: `<h3>Final Project</h3><p>Showcase everything you've learned.</p>`,
            type: "PROJECT",
            difficulty: "advanced",
            estimatedMinutes: 120,
            prerequisites: [],
            resources: {}
          }
        ]
      }
    }

    // Create roadmap
    const roadmap = await db.roadmap.create({
      data: {
        userId: session.user.id,
        learningGoalId: learningGoalRecord.id,
        title: roadmapData.title || `${subject} Learning Roadmap`,
        description: roadmapData.description || `Personalized roadmap from ${currentLevel} to ${targetLevel}`,
        totalSteps: roadmapData.totalSteps || roadmapData.steps?.length || 0,
        estimatedHours: roadmapData.estimatedHours || 40,
        difficulty: roadmapData.difficulty || "intermediate",
        status: "ACTIVE",
        generatedBy: "AI Tutor"
      }
    })

    // Create roadmap steps
    if (roadmapData.steps && Array.isArray(roadmapData.steps)) {
      for (let i = 0; i < roadmapData.steps.length; i++) {
        const step = roadmapData.steps[i]
        await db.roadmapStep.create({
          data: {
            roadmapId: roadmap.id,
            title: step.title,
            description: step.description,
            content: step.content,
            order: i + 1,
            type: step.type || "TOPIC",
            difficulty: step.difficulty || "intermediate",
            estimatedMinutes: step.estimatedMinutes || 60,
            prerequisites: JSON.stringify(step.prerequisites || []),
            resources: step.resources || {},
            status: i === 0 ? "AVAILABLE" : "LOCKED"
          }
        })
      }
    }

    // Create initial progress record
    await db.progress.create({
      data: {
        userId: session.user.id,
        roadmapId: roadmap.id,
        percentage: 0,
        timeSpent: 0,
        completed: false
      }
    })

    return NextResponse.json({
      success: true,
      learningGoal: learningGoalRecord,
      roadmap
    })

  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}