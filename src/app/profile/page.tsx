'use client'

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Calendar, Target, BookOpen, Settings, Sparkles, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: ""
  })

  const handleSave = async () => {
    // In a real app, this would update the user profile
    setIsEditing(false)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
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
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link href="/roadmaps" className="text-gray-600 hover:text-blue-600 transition-colors">My Roadmaps</Link>
                <Link href="/chat" className="text-gray-600 hover:text-blue-600 transition-colors">AI Tutor</Link>
                <Link href="/quizzes" className="text-gray-600 hover:text-blue-600 transition-colors">Practice</Link>
                <Link href="/profile" className="text-blue-600 font-semibold">Profile</Link>
              </nav>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account settings and preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="border-blue-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <User className="w-5 h-5 text-blue-600" />
                      Profile Information
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-blue-300 hover:bg-blue-50"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-blue-100">
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-900">{session.user?.name}</h3>
                      <p className="text-gray-600">{session.user?.email}</p>
                      <Badge className="mt-2 bg-blue-600">
                        {session.user?.role}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-2 border-blue-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-2 border-blue-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself and your learning goals..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                          className="mt-2 border-blue-200"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="border-blue-300">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <Label className="text-sm font-semibold text-gray-600">Full Name</Label>
                        <p className="mt-2 text-blue-900 font-medium">{session.user?.name || "Not set"}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <Label className="text-sm font-semibold text-gray-600">Email</Label>
                        <p className="mt-2 text-blue-900 font-medium">{session.user?.email}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <Label className="text-sm font-semibold text-gray-600">Role</Label>
                        <p className="mt-2 text-purple-900 font-medium">{session.user?.role}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <Label className="text-sm font-semibold text-gray-600">Member Since</Label>
                        <p className="mt-2 text-green-900 font-medium">Today</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Learning Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <Label className="font-semibold text-gray-700">Preferred Learning Style</Label>
                    <p className="text-sm text-gray-600 mt-2">
                      Visual (diagrams, videos)
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                    <Label className="font-semibold text-gray-700">Daily Time Commitment</Label>
                    <p className="text-sm text-gray-600 mt-2">
                      1 hour per day
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                    <Label className="font-semibold text-gray-700">Notification Preferences</Label>
                    <p className="text-sm text-gray-600 mt-2">
                      Email reminders for study sessions
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-blue-300 hover:bg-blue-50">
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Active Roadmaps</p>
                      <p className="text-2xl font-bold text-blue-900">0</p>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Completed Steps</p>
                      <p className="text-2xl font-bold text-green-900">0</p>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Study Streak</p>
                      <p className="text-2xl font-bold text-purple-900">0 days</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card className="border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-900">Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-blue-200 hover:bg-blue-50">
                    Export My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-blue-200 hover:bg-blue-50">
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-blue-200 hover:bg-blue-50">
                    Help & Support
                  </Button>
                  <Separator />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}