'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Zap, Settings, Info } from "lucide-react"

interface AIModelConfig {
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  enabled: boolean
  useCase: 'chat' | 'roadmap' | 'quiz' | 'evaluation'
}

const defaultConfigs: Record<string, AIModelConfig> = {
  'gpt-4': {
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: true,
    useCase: 'roadmap'
  },
  'gpt-3.5-turbo': {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1500,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: true,
    useCase: 'chat'
  },
  'claude-3': {
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: true,
    useCase: 'quiz'
  },
  'gemini-pro': {
    model: 'gemini-pro',
    temperature: 0.9,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    enabled: false,
    useCase: 'chat'
  }
}

export function AIModelConfiguration() {
  const [configs, setConfigs] = useState<Record<string, AIModelConfig>>(defaultConfigs)
  const [selectedUseCase, setSelectedUseCase] = useState<string>('chat')

  const updateConfig = (model: string, field: keyof AIModelConfig, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [field]: value
      }
    }))
  }

  const getOptimalModel = (useCase: string) => {
    const models = Object.entries(configs)
      .filter(([_, config]) => config.enabled && config.useCase === useCase)
      .sort(([_, a], [__, b]) => {
        // Priority order: GPT-4 > Claude-3 > GPT-3.5 > Gemini
        const priority = { 'gpt-4': 4, 'claude-3-opus-20240229': 3, 'gpt-3.5-turbo': 2, 'gemini-pro': 1 }
        return (priority[b.model as keyof typeof priority] || 0) - (priority[a.model as keyof typeof priority] || 0)
      })
    
    return models[0]?.[0] || 'gpt-3.5-turbo'
  }

  const modelDescriptions = {
    'gpt-4': {
      name: 'GPT-4',
      description: 'Most capable model, best for complex reasoning and structured content',
      strengths: ['Complex reasoning', 'Structured output', 'High accuracy'],
      cost: 'High'
    },
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient, great for conversational AI',
      strengths: ['Fast response', 'Cost effective', 'Good for chat'],
      cost: 'Low'
    },
    'claude-3-opus-20240229': {
      name: 'Claude 3 Opus',
      description: 'Excellent analytical capabilities, great for evaluation tasks',
      strengths: ['Analytical reasoning', 'Detailed explanations', 'Safety focused'],
      cost: 'High'
    },
    'gemini-pro': {
      name: 'Gemini Pro',
      description: 'Google\'s multimodal model with strong reasoning',
      strengths: ['Multimodal', 'Fast', 'Cost effective'],
      cost: 'Medium'
    }
  }

  return (
    <div className="space-y-6">
      {/* Use Case Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Model Optimization
          </CardTitle>
          <CardDescription>
            Configure which AI models to use for different tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['chat', 'roadmap', 'quiz', 'evaluation'] as const).map(useCase => (
              <div key={useCase} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium capitalize">{useCase}</Label>
                  <Badge variant="outline">
                    {getOptimalModel(useCase).replace('-turbo', '').replace('-opus-20240229', ' 3')}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {useCase === 'chat' && 'Conversational tutoring'}
                  {useCase === 'roadmap' && 'Learning path generation'}
                  {useCase === 'quiz' && 'Assessment creation'}
                  {useCase === 'evaluation' && 'Answer grading'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Model Configuration
          </CardTitle>
          <CardDescription>
            Fine-tune parameters for each AI model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(configs).map(([modelKey, config]) => {
              const desc = modelDescriptions[modelKey as keyof typeof modelDescriptions]
              if (!desc) return null

              return (
                <Card key={modelKey} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{desc.name}</CardTitle>
                        <CardDescription>{desc.description}</CardDescription>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => updateConfig(modelKey, 'enabled', enabled)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {desc.strengths.map(strength => (
                        <Badge key={strength} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">
                        Cost: {desc.cost}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Use Case</Label>
                      <Select
                        value={config.useCase}
                        onValueChange={(value: any) => updateConfig(modelKey, 'useCase', value)}
                        disabled={!config.enabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chat">Chat</SelectItem>
                          <SelectItem value="roadmap">Roadmap Generation</SelectItem>
                          <SelectItem value="quiz">Quiz Creation</SelectItem>
                          <SelectItem value="evaluation">Evaluation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Temperature</Label>
                        <span className="text-sm text-slate-600">{config.temperature}</span>
                      </div>
                      <Slider
                        value={[config.temperature]}
                        onValueChange={([value]) => updateConfig(modelKey, 'temperature', value)}
                        max={2}
                        min={0}
                        step={0.1}
                        disabled={!config.enabled}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Max Tokens</Label>
                        <span className="text-sm text-slate-600">{config.maxTokens}</span>
                      </div>
                      <Slider
                        value={[config.maxTokens]}
                        onValueChange={([value]) => updateConfig(modelKey, 'maxTokens', value)}
                        max={4000}
                        min={256}
                        step={256}
                        disabled={!config.enabled}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Top P</Label>
                        <span className="text-sm text-slate-600">{config.topP}</span>
                      </div>
                      <Slider
                        value={[config.topP]}
                        onValueChange={([value]) => updateConfig(modelKey, 'topP', value)}
                        max={1}
                        min={0}
                        step={0.1}
                        disabled={!config.enabled}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fallback Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Fallback Strategy
          </CardTitle>
          <CardDescription>
            Configure fallback behavior when primary models fail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Primary Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3-opus-20240229">Claude 3</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fallback Model</Label>
              <Select defaultValue="gpt-3.5-turbo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch defaultChecked />
            <Label>Enable automatic fallback on errors</Label>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Fallback Strategy</p>
                <p>
                  When a primary model fails or reaches rate limits, the system automatically 
                  switches to the fallback model to ensure continuous service.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Configuration</Button>
      </div>
    </div>
  )
}