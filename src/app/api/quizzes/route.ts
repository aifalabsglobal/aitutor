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
      title: "General Quiz",
      description: "Test your knowledge",
      subject: "General",
      difficulty: "intermediate",
      questionType: "multiple_choice",
      timeLimit: 20,
      passingScore: 75,
      questions: []
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's active roadmaps to generate relevant quizzes
    const userRoadmaps = await db.roadmap.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE"
      },
      include: {
        learningGoal: true,
        steps: {
          where: { status: "AVAILABLE" },
          take: 3
        }
      },
      take: 3
    })

    // If user has roadmaps, generate personalized quizzes
    if (userRoadmaps.length > 0) {
      const quizzes: any[] = []

      for (const roadmap of userRoadmaps) {
        const quiz = await generateQuizForRoadmap(roadmap)
        if (quiz) {
          quizzes.push(quiz)
        }
      }

      // Also add some general quizzes
      const generalQuizzes = await generateGeneralQuizzes()
      quizzes.push(...generalQuizzes)

      return NextResponse.json(quizzes)
    }

    // Return general quizzes if no roadmaps
    const generalQuizzes = await generateGeneralQuizzes()
    return NextResponse.json(generalQuizzes)

  } catch (error) {
    console.error("Quizzes fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function generateQuizForRoadmap(roadmap: any) {
  try {
    const currentTopics = roadmap.steps.map((step: any) => step.title).join(", ")

    const prompt = `
    Generate a quiz for a student learning about ${roadmap.learningGoal.subject}.
    
    Current learning goal: ${roadmap.learningGoal.title}
    Current topics: ${currentTopics}
    Target level: ${roadmap.difficulty}
    
    Create a JSON quiz with the following structure:
    {
      "title": "Quiz title",
      "description": "Brief description",
      "subject": "${roadmap.learningGoal.subject}",
      "difficulty": "${roadmap.difficulty}",
      "questionType": "multiple_choice",
      "timeLimit": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "q1",
          "question": "Question text",
          "type": "multiple_choice",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Explanation for why this is correct"
        }
      ]
    }
    
    Requirements:
    - Generate 5 questions
    - Mix of difficulty levels appropriate for ${roadmap.difficulty}
    - Focus on current topics but include some review questions
    - Provide clear explanations for each answer
    - Make questions practical and application-based
    `

    const model = aiService.selectOptimalModel('quiz')
    const completion = await aiService.generateResponse([
      {
        role: "system",
        content: "You are an expert educational assessment designer. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], model, {
      temperature: 0.7,
      max_tokens: 1500
    })

    const quizData = parseJsonSafely(completion.content)

    // Save quiz to database
    const quiz = await db.quiz.create({
      data: {
        title: quizData.title || `${roadmap.learningGoal.subject} Practice Quiz`,
        description: quizData.description || `Test your knowledge of ${currentTopics}`,
        subject: quizData.subject || roadmap.learningGoal.subject,
        difficulty: quizData.difficulty || roadmap.difficulty,
        questionType: quizData.questionType || "multiple_choice",
        timeLimit: quizData.timeLimit || 15,
        passingScore: quizData.passingScore || 70,
        questions: quizData.questions || [],
        generatedBy: "AI Tutor"
      }
    })

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      questionType: quiz.questionType,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: quiz.questions
    }

  } catch (error) {
    console.error("Error generating quiz for roadmap:", error)
    return null
  }
}

async function generateGeneralQuizzes() {
  const subjects = [
    { name: "Programming", topics: "JavaScript, React, Node.js, Python" },
    { name: "Mathematics", topics: "Algebra, Calculus, Statistics, Geometry" },
    { name: "Science", topics: "Physics, Chemistry, Biology, Earth Science" },
    { name: "Languages", topics: "English, Spanish, French, German" }
  ]

  const quizzes: any[] = []

  for (const subject of subjects) {
    try {
      const prompt = `
      Generate a general knowledge quiz for ${subject.name}.
      
      Topics to cover: ${subject.topics}
      
      Create a JSON quiz with the following structure:
      {
        "title": "Quiz title",
        "description": "Brief description",
        "subject": "${subject.name}",
        "difficulty": "intermediate",
        "questionType": "multiple_choice",
        "timeLimit": 20,
        "passingScore": 75,
        "questions": [
          {
            "id": "q1",
            "question": "Question text",
            "type": "multiple_choice",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Explanation for why this is correct"
          }
        ]
      }
      
      Requirements:
      - Generate 5 questions
      - Mix of fundamental and intermediate concepts
      - Include practical, real-world applications
      - Provide clear explanations
      `

      const model = aiService.selectOptimalModel('quiz')
      const completion = await aiService.generateResponse([
        {
          role: "system",
          content: "You are an expert educational assessment designer. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ], model, {
        temperature: 0.7,
        max_tokens: 1500
      })

      const quizData = parseJsonSafely(completion.content)

      const quiz = await db.quiz.create({
        data: {
          title: quizData.title || `${subject.name} Fundamentals Quiz`,
          description: quizData.description || `Test your general knowledge of ${subject.topics}`,
          subject: quizData.subject || subject.name,
          difficulty: quizData.difficulty || "intermediate",
          questionType: quizData.questionType || "multiple_choice",
          timeLimit: quizData.timeLimit || 20,
          passingScore: quizData.passingScore || 75,
          questions: quizData.questions || [],
          generatedBy: "AI Tutor"
        }
      })

      quizzes.push({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        questionType: quiz.questionType,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        questions: quiz.questions
      })

    } catch (error) {
      console.error(`Error generating general quiz for ${subject.name}:`, error)
    }
  }

  return quizzes
}