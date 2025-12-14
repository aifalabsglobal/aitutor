'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="text-blue-600">ai</span>
          <span className="text-gray-900">fa</span>
        </span>
        <p className="text-xs text-gray-500 mt-1">An initiative by AIM Technologies</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-blue-100 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to your account to continue learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full h-12 border-2 border-blue-200 hover:bg-blue-50"
                variant="outline"
                onClick={handleGoogleSignIn}
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-blue-200 focus:border-blue-500"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="text-center text-sm pt-2">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}