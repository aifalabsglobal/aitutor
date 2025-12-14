'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Users, BookOpen, MessageCircle, Target, TrendingUp, Settings, Brain, Sparkles } from "lucide-react"
import { AIModelConfiguration } from "@/components/admin/ai-model-configuration"
import { motion } from "framer-motion"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRoadmaps: number
  totalSessions: number
  totalQuizzes: number
  averageScore: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: {
    roadmaps: number
    quizAttempts: number
    chatSessions: number
  }
}

interface Roadmap {
  id: string
  title: string
  subject: string
  difficulty: string
  status: string
  user: {
    name: string
    email: string
  }
  createdAt: string
  _count: {
    steps: number
    progress: number
  }
}

async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats")
  if (!response.ok) throw new Error("Failed to fetch admin stats")
  return response.json()
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/admin/users")
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

async function fetchRoadmaps(): Promise<Roadmap[]> {
  const response = await fetch("/api/admin/roadmaps")
  if (!response.ok) throw new Error("Failed to fetch roadmaps")
  return response.json()
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: !!session?.user && session.user.role === "ADMIN",
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    enabled: !!session?.user && session.user.role === "ADMIN",
  })

  const { data: roadmaps, isLoading: roadmapsLoading } = useQuery({
    queryKey: ["admin-roadmaps"],
    queryFn: fetchRoadmaps,
    enabled: !!session?.user && session.user.role === "ADMIN",
  })

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-slate-600">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight">
                  <span className="text-blue-600">ai</span>
                  <span className="text-gray-900">fa</span>
                </span>
                <span className="text-sm text-gray-500 ml-2">/ Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, roadmaps, and monitor platform performance.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-blue-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
            <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, subtitle: `${stats?.activeUsers || 0} active this week`, color: "blue", gradient: "from-blue-500 to-blue-600" },
                { icon: BookOpen, label: "Total Roadmaps", value: stats?.totalRoadmaps || 0, subtitle: "Active learning paths", color: "green", gradient: "from-green-500 to-green-600" },
                { icon: MessageCircle, label: "Chat Sessions", value: stats?.totalSessions || 0, subtitle: "Total conversations", color: "purple", gradient: "from-purple-500 to-purple-600" },
                { icon: Target, label: "Quizzes Taken", value: stats?.totalQuizzes || 0, subtitle: `Avg score: ${stats?.averageScore || 0}%`, color: "orange", gradient: "from-orange-500 to-orange-600" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className={`border-${stat.color}-100 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stat.subtitle}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <stat.icon className="w-7 h-7 text-white" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-blue-900">Platform Overview</CardTitle>
                  <CardDescription>
                    Key metrics and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                      <h4 className="font-bold mb-4 text-blue-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        User Engagement
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Daily Active Users</span>
                          <span className="font-semibold text-blue-700">Coming soon</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average Session Length</span>
                          <span className="font-semibold text-blue-700">Coming soon</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Retention Rate</span>
                          <span className="font-semibold text-blue-700">Coming soon</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                      <h4 className="font-bold mb-4 text-purple-900 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Content Performance
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Most Popular Subject</span>
                          <span className="font-semibold text-purple-700">Coming soon</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Quiz Completion Rate</span>
                          <span className="font-semibold text-purple-700">Coming soon</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Roadmap Completion</span>
                          <span className="font-semibold text-purple-700">Coming soon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage all platform users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Roadmaps</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id} className="hover:bg-blue-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-blue-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className={user.role === "ADMIN" ? "bg-blue-600" : ""}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{user._count.roadmaps}</TableCell>
                        <TableCell className="font-medium">{user._count.quizAttempts}</TableCell>
                        <TableCell className="font-medium">{user._count.chatSessions}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmaps" className="space-y-6">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Roadmap Management
                </CardTitle>
                <CardDescription>
                  Monitor and manage learning roadmaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roadmaps?.map((roadmap) => (
                      <TableRow key={roadmap.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium text-blue-900">{roadmap.title}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{roadmap.user.name}</p>
                            <p className="text-xs text-gray-600">{roadmap.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-300 text-blue-700">{roadmap.subject}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-purple-300 text-purple-700">{roadmap.difficulty}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={roadmap.status === "ACTIVE" ? "default" : "secondary"}
                            className={roadmap.status === "ACTIVE" ? "bg-green-600" : ""}
                          >
                            {roadmap.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {roadmap._count.progress > 0 ? (
                            <span className="text-blue-700 font-medium">{roadmap._count.progress} steps</span>
                          ) : (
                            <span className="text-gray-400">Not started</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(roadmap.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-models" className="space-y-6">
            <AIModelConfiguration />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-blue-900">
                  <Settings className="w-6 h-6 text-blue-600" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                  <h4 className="font-bold mb-4 text-blue-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Configuration
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm font-medium text-gray-700">Default AI Model</span>
                      <Badge className="bg-blue-600">GPT-4</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm font-medium text-gray-700">Max Response Length</span>
                      <span className="text-sm text-blue-700 font-semibold">2000 tokens</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm font-medium text-gray-700">Quiz Generation</span>
                      <Badge variant="outline" className="border-green-300 text-green-700">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">Fallback Strategy</span>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">Active</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                  <h4 className="font-bold mb-4 text-purple-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Platform Limits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-purple-100">
                      <span className="text-sm font-medium text-gray-700">Max Roadmaps per User</span>
                      <span className="text-sm text-purple-700 font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-purple-100">
                      <span className="text-sm font-medium text-gray-700">Chat Session History</span>
                      <span className="text-sm text-purple-700 font-semibold">30 days</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">Quiz Time Limit</span>
                      <span className="text-sm text-purple-700 font-semibold">30 minutes</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}