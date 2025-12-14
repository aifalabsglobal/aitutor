export type AIModel = 'llama-3.1-8b' | 'llama-3.1-70b' | 'mixtral' | 'default'

export interface AIResponse {
  content: string
  model: AIModel
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AIService {
  private static instance: AIService

  private constructor() { }

  private get groqApiKey(): string {
    return process.env.GROQ_API_KEY || ''
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    model: AIModel = 'default',
    options: {
      temperature?: number
      max_tokens?: number
    } = {}
  ): Promise<AIResponse> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured')
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messages.map(m => ({
            role: m.role.toLowerCase(),
            content: m.content
          })),
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[AIService] Groq Error:', response.status, error)
        throw new Error(`Groq API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      let content = data.choices?.[0]?.message?.content || ''
      content = this.cleanJsonResponse(content)

      return {
        content,
        model: 'llama-3.1-8b',
        usage: data.usage
      }
    } catch (error) {
      console.error('[AIService] Error:', error)
      throw new Error(`AI generation failed: ${error}`)
    }
  }

  private cleanJsonResponse(content: string): string {
    if (content.includes('```json')) {
      content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    } else if (content.includes('```')) {
      content = content.replace(/```\s*/g, '')
    }
    return content.trim()
  }

  selectOptimalModel(task: 'roadmap' | 'quiz' | 'chat' | 'assessment'): AIModel {
    return 'llama-3.1-8b'
  }

  async generateImage(prompt: string): Promise<string | null> {
    return null
  }

  async searchWeb(query: string): Promise<string | null> {
    return null
  }
}

export const aiService = AIService.getInstance()