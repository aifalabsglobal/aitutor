import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiService } from "@/lib/ai-service"

// Pollinations.ai is completely free and doesn't need an API key!
// Just construct the URL with the prompt

function generatePollinationsUrl(prompt: string, width: number = 800, height: number = 600): string {
    const encodedPrompt = encodeURIComponent(prompt)
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        // Allow guest access for testing

        const { topic, context, style } = await request.json()

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 })
        }

        // Use AI to generate a good image prompt based on the learning topic
        let imagePrompt = `Educational diagram explaining ${topic}, clean minimalist style, informative, professional, whiteboard style illustration`

        try {
            const promptResponse = await aiService.generateResponse([
                {
                    role: "system",
                    content: `You are an expert at creating image prompts for educational illustrations. 
          Create a detailed prompt for an AI image generator to create an educational diagram or illustration.
          
          Requirements:
          - The image should help explain the concept visually
          - Use clean, professional, educational style
          - Include relevant visual metaphors or diagrams
          - Keep it simple and clear for learning
          - No text in the image (the image generator doesn't do text well)
          
          Respond with ONLY the image prompt, nothing else. Keep it under 100 words.`
                },
                {
                    role: "user",
                    content: `Create an image prompt for: "${topic}"${context ? `\nContext: ${context}` : ''}${style ? `\nStyle preference: ${style}` : ''}`
                }
            ], 'default', {
                temperature: 0.7,
                max_tokens: 150
            })

            imagePrompt = promptResponse.content.trim()
        } catch (aiError) {
            console.log("AI prompt generation failed, using default:", aiError)
            // Use fallback prompt
            imagePrompt = `Educational illustration of ${topic}, clean minimalist diagram, professional infographic style, soft colors, easy to understand visual explanation`
        }

        // Generate the Pollinations URL
        const imageUrl = generatePollinationsUrl(imagePrompt)

        return NextResponse.json({
            imageUrl,
            prompt: imagePrompt,
            provider: "pollinations.ai",
            note: "Free AI-generated educational image"
        })

    } catch (error) {
        console.error("Image generation error:", error)
        return NextResponse.json(
            { error: "Failed to generate image" },
            { status: 500 }
        )
    }
}
