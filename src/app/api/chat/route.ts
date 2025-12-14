import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiService } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Allow guest mode for demo/testing
    const userId = session?.user?.id || null

    const { message, conversationHistory } = await request.json()

    let chatSessionId: string | null = null

    // Only save to DB if authenticated
    if (userId) {
      let chatSession = await db.chatSession.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" }
      })

      if (!chatSession) {
        chatSession = await db.chatSession.create({
          data: {
            userId,
            title: "New Chat Session",
            context: {}
          }
        })
      }

      chatSessionId = chatSession.id

      // Save user message
      await db.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: "USER",
          content: message,
          metadata: {}
        }
      })
    }

    // Get user context for better responses (only for authenticated users)
    let currentContext: { subject: string; goal: string; currentStep: string } | null = null
    if (userId) {
      const userRoadmaps = await db.roadmap.findMany({
        where: { userId },
        include: {
          learningGoal: true,
          steps: {
            where: { status: "IN_PROGRESS" },
            take: 1
          }
        },
        take: 1
      })

      currentContext = userRoadmaps[0] ? {
        subject: userRoadmaps[0].learningGoal.subject,
        goal: userRoadmaps[0].learningGoal.title,
        currentStep: userRoadmaps[0].steps[0]?.title || "getting started"
      } : null
    }

    // Generate AI response with model selection
    const systemPrompt = `You are an expert AI learning companion - a knowledgeable, encouraging mentor who genuinely cares about student success. Be warm, approachable, and patient like a favorite teacher.

1. Provide clear, accurate, and engaging explanations
2. Adapt your teaching style to the user's level and needs
3. Use examples, analogies, and visual descriptions when helpful
4. Ask follow-up questions to ensure understanding
5. Break down complex topics into manageable steps
6. Encourage critical thinking and problem-solving
7. Be patient, supportive, and motivating

Current learning context: ${currentContext ?
        `User is learning ${currentContext.subject} with goal: ${currentContext.goal}. 
   Currently working on: ${currentContext.currentStep}` :
        "No specific learning context available"}

Guidelines:
- Start responses warmly (e.g., "Great question!", "Let's explore this...")
- Use conversational language ("you'll", "let's", "imagine") not academic prose
- Break complex topics into numbered steps
- Include real-world examples and analogies
- Ask follow-up questions to check understanding
- Be encouraging without being condescending
- Celebrate curiosity and progress
- Make learning feel achievable and exciting

Conversation history for context:
${conversationHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || "No previous messages"}`

    const model = aiService.selectOptimalModel('chat')
    let aiResponse = "I'm here to help you learn! Could you please rephrase your question or let me know what specific topic you'd like to explore?"

    try {
      const response = await aiService.generateResponse([
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ], model, {
        temperature: 0.7,
        max_tokens: 1000
      })
      aiResponse = response.content || aiResponse
    } catch (aiError) {
      console.log("AI chat failed, using fallback:", aiError)
      // Provide helpful fallback responses based on message content
      if (message.toLowerCase().includes('help') || message.toLowerCase().includes('?')) {
        aiResponse = `I'd love to help you with that! Here are some things I can assist with:

1. **Explain concepts** - Ask me about any topic in your learning roadmap
2. **Give examples** - I can provide practical examples for complex ideas
3. **Answer questions** - Feel free to ask anything about your studies
4. **Review progress** - Check your roadmap to see what's next

What would you like to explore today?`
      } else {
        aiResponse = `That's a great topic to explore! While I'm having trouble connecting to my full knowledge base right now, here are some suggestions:

1. Check your **Learning Roadmap** for structured content on this topic
2. Review the **current step** in your roadmap for related material
3. Try the **Practice** section for hands-on exercises

Is there a specific aspect of this topic you'd like me to focus on?`
      }
    }

    // Save AI response only if authenticated
    if (chatSessionId) {
      await db.chatMessage.create({
        data: {
          sessionId: chatSessionId,
          role: "ASSISTANT",
          content: aiResponse,
          metadata: {
            model: model,
            context: currentContext
          }
        }
      })

      // Update session title if this is the first exchange
      const messageCount = await db.chatMessage.count({
        where: { sessionId: chatSessionId }
      })

      if (messageCount <= 2) {
        const title = message.length > 50 ? message.substring(0, 47) + "..." : message
        await db.chatSession.update({
          where: { id: chatSessionId },
          data: { title }
        })
      }
    }

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}