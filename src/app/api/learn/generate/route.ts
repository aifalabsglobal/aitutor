import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiService } from "@/lib/ai-service"
import { marked } from "marked"

// Configure marked for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Function to ensure content is properly formatted
function formatContent(rawContent: string): string {
  let cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()

  // If markdown, convert to HTML
  if (cleaned.includes('#') || (cleaned.includes('*') && cleaned.includes('\n'))) {
    cleaned = marked.parse(cleaned) as string
  }

  // If plain text, wrap in paragraphs
  if (!cleaned.includes('<')) {
    const paragraphs = cleaned.split('\n\n').filter(p => p.trim())
    cleaned = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n')
  }

  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { nodeId } = await request.json()

    // Get node
    const node = await db.roadmapStep.findUnique({
      where: { id: nodeId },
      include: {
        roadmap: {
          select: { title: true, difficulty: true }
        }
      }
    })

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    // Generate content using AI with clean, presentable formatting
    const prompt = `
You are creating BEAUTIFUL, WELL-FORMATTED educational content for: "${node.title}"

Create professional, magazine-quality lesson content that is:
- Visually attractive with clear sections
- Easy to read
- Engaging and human-like
- Properly formatted with HTML

📚 LESSON CONTEXT:
- Topic: ${node.title}
- Description: ${node.description}
- Part of: "${node.roadmap.title}" roadmap
- Difficulty: ${node.difficulty}
- Target time: ${node.estimatedMinutes} minutes

🎨 FORMATTING REQUIREMENTS:

1. USE CLEAN HTML STRUCTURE:
   - <h2> for major sections
   - <h3> for subsections
   - <p> for paragraphs (keep them short - 2-3 sentences max)
   - <ul> and <li> for lists
   - <strong> for emphasis
   - <em> for subtle emphasis

2. CREATE THESE SECTIONS:

   <h2>Introduction</h2>
   <p>Start with a warm, engaging intro. Use simple language. Make it relatable.</p>
   
   <h2>Key Concepts</h2>
   <p>Break down the main ideas. One concept per paragraph.</p>
   <ul>
     <li><strong>Concept 1:</strong> Explanation in simple terms</li>
     <li><strong>Concept 2:</strong> Another key point</li>
   </ul>
   
   <h2>How It Works</h2>
   <p>Step-by-step explanation. Use numbered lists if showing a process.</p>
   
   <h2>Real-World Example</h2>
   <p>Concrete example they can relate to. Tell a mini-story.</p>
   
   <h2>Practice This</h2>
   <p>Quick exercise or thought experiment they can do right now.</p>
   
   <h2>Key Takeaways</h2>
   <ul>
     <li>Summary point 1</li>
     <li>Summary point 2</li>
     <li>Summary point 3</li>
   </ul>

3. WRITING STYLE:
   - NO special characters like === or --- or bullets like •
   - NO emojis in the text (they interfere with speech)
   - Use proper punctuation only: . , ! ?
   - Write like a friendly teacher, not a robot
   - Short sentences for clarity
   - Use "you" to address the learner
   - Ask rhetorical questions to engage
   
4. READABILITY:
   - Each paragraph should be 2-4 sentences max
   - Use whitespace (separate paragraphs)
   - Highlight key terms with <strong>
   - Break complex ideas into bullet points

5. DO NOT USE:
   - Boxes or borders (===, ---, ╔═══)
   - Emojis anywhere in the content
   - Special unicode characters
   - Markdown formatting
   - Code blocks (unless teaching code)

GENERATE CLEAN, BEAUTIFUL, SPEECH-FRIENDLY HTML NOW:
`
    let content = ''
    try {
      const completion = await aiService.generateResponse([
        {
          role: "system",
          content: `You are creating the world's most HUMAN and INTERACTIVE educational content.

YOUR PERSONALITY:
- You're like a cool older sibling who knows everything and loves teaching
- You use humor, stories, and real-life examples constantly
- You make students feel smart and capable, never stupid
- You're excited about the topic and that excitement is contagious
- You ask questions that make students think and engage
- You celebrate every small win

YOUR TEACHING STYLE:
- Talk TO the student, not AT them ("You're going to love this...")
- Use "we" language: "Let's explore...", "Now we'll see..."
- Ask rhetorical questions: "Cool, right?", "Makes sense so far?"
- Include moments of humor and lightness
- Break complex things into super simple steps
- Always explain the WHY, not just the WHAT

INTERACTIVE ELEMENTS TO INCLUDE:
- Mental exercises ("In your head, try to...")
- Real-world connections ("Next time you..., you'll think of this")
- Pause moments ("Take 10 seconds to consider...")
- Mini challenges ("Can you guess what happens next?")
- Hidden answers with <details> tags

OUTPUT FORMAT:
Clean, beautiful HTML with lots of visual variety and interactive elements.
Make it feel like a premium interactive course, not a boring textbook.`
        },
        {
          role: "user",
          content: prompt
        }
      ], 'default', {
        temperature: 0.85,
        max_tokens: 4500
      })
      content = completion.content

      // FORMAT THE CONTENT PROPERLY
      content = formatContent(content)
    } catch (aiError) {
      console.error("AI generation failed, using fallback:", aiError)
      content = `
        <h3>👋 Welcome to ${node.title}!</h3>
        <p><em>Hey there, future expert! I'm so excited to explore this topic with you.</em></p>
        
        <div class="imagination-box">
          <p>🖼️ <strong>IMAGINE THIS:</strong> You're about to unlock a new skill that will change how you see the world...</p>
        </div>
        
        <h4>📖 What We'll Explore Together</h4>
        <p>${node.description}</p>
        
        <div class="voice-box">
          <p>🎙️ <strong>HERE'S THE THING:</strong> ${node.title} might sound complex, but I promise - by the end of this lesson, you'll be saying "Oh, THAT'S what it means!"</p>
        </div>
        
        <div class="interactive-box">
          <p>✏️ <strong>YOUR TURN - Quick Thought:</strong></p>
          <p>Before we dive in, think about: What do you already know about ${node.title}? Even a vague idea counts!</p>
        </div>
        
        <h4>🎯 By The End, You'll...</h4>
        <ul>
          <li>✅ Understand the core concepts of ${node.title}</li>
          <li>✅ See how it applies to real life</li>
          <li>✅ Feel confident explaining it to a friend</li>
        </ul>
        
        <div class="checkpoint-box">
          <p>📊 <strong>PROGRESS:</strong> █░░░░░░░░░ 10% - Just getting started!</p>
        </div>
        
        <p><em>Content is being generated. Please refresh the page in a moment to see the full interactive lesson.</em></p>
      `
    }

    // Save generated content
    await db.roadmapStep.update({
      where: { id: nodeId },
      data: { content }
    })

    return NextResponse.json({ content })

  } catch (error) {
    console.error("Content generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
