'use client'

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Send, Bot, User, Sparkles, Plus, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          conversationHistory: messages.slice(-5)
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "Explain machine learning like I'm 10",
    "Help me understand calculus basics",
    "What's the best way to learn programming?",
    "Can you explain quantum physics simply?",
    "How do I improve my study habits?"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Bot className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">AI Tutor Chat</h1>
                <p className="text-sm text-gray-600">Your personal learning assistant</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                  Dashboard
                </Button>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Card className="h-full border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-900">Suggested Questions</h4>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <motion.div key={index} whileHover={{ scale: 1.02, x: 3 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-left h-auto p-3 whitespace-normal hover:bg-blue-50 text-gray-700"
                          onClick={() => setInput(question)}
                        >
                          <span className="text-blue-600 mr-2">→</span>
                          {question}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Learning Tips
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Be specific in your questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Ask for examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Request step-by-step explanations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Follow up with clarifying questions</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <Card className="h-full flex flex-col border-blue-100 shadow-lg">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Bot className="w-5 h-5 text-blue-600" />
                  Chat with AI Tutor
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                      >
                        <Bot className="w-10 h-10 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-3">Start a conversation</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        Ask me anything! I can help you learn, explain concepts,
                        solve problems, and guide your learning journey.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {suggestedQuestions.slice(0, 4).map((question, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Button
                              variant="outline"
                              className="h-auto p-4 whitespace-normal text-left border-blue-200 hover:bg-blue-50 w-full"
                              onClick={() => setInput(question)}
                            >
                              {question}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="w-10 h-10 mt-1 border-2 border-blue-200">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <Bot className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[75%] rounded-2xl p-4 shadow-md ${message.role === "user"
                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                : "bg-white border border-blue-100"
                              }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                          {message.role === "user" && (
                            <Avatar className="w-10 h-10 mt-1 border-2 border-blue-200">
                              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white">
                                <User className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-4 justify-start"
                        >
                          <Avatar className="w-10 h-10 mt-1 border-2 border-blue-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                              <Bot className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-md">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Form */}
                <div className="border-t border-blue-100 p-4 bg-gradient-to-r from-blue-50/50 to-white">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about your learning..."
                      disabled={isLoading}
                      className="flex-1 h-12 border-blue-200 focus:border-blue-500"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </form>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    AI Tutor may make mistakes. Please verify important information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}