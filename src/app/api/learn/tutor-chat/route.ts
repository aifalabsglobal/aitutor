import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiService } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { message, topic, history } = await request.json()

        // Build conversation history for context
        const conversationMessages = history?.slice(-6).map((msg: any) => ({
            role: msg.role,
            content: msg.content
        })) || []

        const systemPrompt = `You are an expert AI tutor teaching about "${topic}". 

Imagine you're a friendly, engaging instructor in an educational video. Your teaching style should feel like the best YouTube educators or online course instructors.

YOUR TEACHING APPROACH:
1. **Be Warm & Encouraging** - Start responses with friendly openers like "Great question!", "Ah, this is a fun one!", "Let me explain this in a way that'll click..."

2. **Use Visual Language** - Help students "see" concepts:
   - "Picture this..." / "Imagine..." / "Think of it like..."
   - Use real-world analogies they can relate to
   - Describe visual relationships between concepts

3. **Break It Down Step-by-Step**:
   - Number your steps when explaining processes
   - Use "First... Then... Next... Finally..."
   - Check in: "Does this make sense so far?"

4. **Make It Interactive**:
   - Ask thought-provoking questions
   - Suggest mini-exercises: "Try this: ..."
   - Encourage exploration: "What do you think would happen if...?"

5. **Use Engaging Formatting**:
   - Include relevant emojis for visual appeal
   - Use **bold** for key terms
   - Use bullet points for lists
   - Add code examples when relevant

6. **End Strong**:
   - Summarize the key point
   - Connect to the bigger picture
   - Encourage next steps

Current topic: ${topic}

Remember: You're not just teaching facts - you're making learning feel like an exciting journey! 🚀`

        try {
            const response = await aiService.generateResponse([
                { role: "system", content: systemPrompt },
                ...conversationMessages,
                { role: "user", content: message }
            ], 'default', {
                temperature: 0.7,
                max_tokens: 800
            })

            return NextResponse.json({ response: response.content })
        } catch (aiError) {
            console.log("AI tutor chat failed:", aiError)
            // Provide helpful fallback
            return NextResponse.json({
                response: `Great question about ${topic}! While I'm having trouble connecting right now, here are some suggestions:

1. Review the lesson content on the left panel
2. Try breaking down your question into smaller parts
3. Look for key terms and definitions in the material

What specific part would you like me to help with?`
            })
        }

    } catch (error) {
        console.error("Tutor chat error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
