import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiService } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quizId, answers, timeSpent } = await request.json()

    // Get quiz details
    const quiz = await db.quiz.findUnique({
      where: { id: quizId }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Grade the quiz
    const { score, feedback } = await gradeQuiz(quiz, answers)

    const passed = score >= quiz.passingScore

    // Save quiz attempt
    const attempt = await db.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        answers,
        score,
        passed,
        timeSpent,
        feedback
      }
    })

    return NextResponse.json({
      id: attempt.id,
      score,
      passed,
      timeSpent,
      feedback
    })

  } catch (error) {
    console.error("Quiz attempt error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function gradeQuiz(quiz: any, userAnswers: any) {
  try {
    const questions = quiz.questions
    let correctCount = 0
    const feedback: any[] = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = userAnswers[question.id]
      const correctAnswer = question.correctAnswer

      let isCorrect = false

      if (question.type === "multiple_choice" || question.type === "true_false") {
        isCorrect = userAnswer === correctAnswer.toString()
      } else if (question.type === "short_answer") {
        // Use AI to evaluate short answers
        const evaluation = await evaluateShortAnswer(question, userAnswer)
        isCorrect = evaluation.isCorrect
        feedback.push({
          question: question.question,
          userAnswer,
          correct: isCorrect,
          explanation: evaluation.explanation
        })
      } else {
        isCorrect = userAnswer === correctAnswer
      }

      if (question.type !== "short_answer") {
        feedback.push({
          question: question.question,
          userAnswer,
          correct: isCorrect,
          explanation: question.explanation
        })
      }

      if (isCorrect) {
        correctCount++
      }
    }

    const score = Math.round((correctCount / questions.length) * 100)

    return { score, feedback }

  } catch (error) {
    console.error("Error grading quiz:", error)
    // Fallback to basic grading
    const questions = quiz.questions
    let correctCount = 0
    const feedback: any[] = []

    for (const question of questions) {
      const userAnswer = userAnswers[question.id]
      const isCorrect = userAnswer === question.correctAnswer.toString()

      if (isCorrect) correctCount++

      feedback.push({
        question: question.question,
        userAnswer,
        correct: isCorrect,
        explanation: question.explanation
      })
    }

    const score = Math.round((correctCount / questions.length) * 100)
    return { score, feedback }
  }
}

async function evaluateShortAnswer(question: any, userAnswer: string) {
  try {
    const prompt = `
    Evaluate this short answer:
    
    Question: ${question.question}
    Expected answer concept: ${question.explanation}
    Student's answer: "${userAnswer}"
    
    Respond with JSON:
    {
      "isCorrect": true/false,
      "explanation": "Brief explanation of why the answer is correct or incorrect, and what would make it better"
    }
    
    Be lenient but fair. Focus on understanding the concept rather than exact wording.
    `

    const completion = await aiService.generateResponse([
      {
        role: "system",
        content: "You are an expert teacher evaluating student responses. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], 'default', {
      temperature: 0.3,
      max_tokens: 500
    })

    const evaluation = JSON.parse(completion.content || "{}")
    return evaluation

  } catch (error) {
    console.error("Error evaluating short answer:", error)
    return {
      isCorrect: false,
      explanation: "Unable to evaluate answer automatically. Please review with your tutor."
    }
  }
}