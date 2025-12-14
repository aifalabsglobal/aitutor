'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, MessageSquare, Zap, BarChart3, Sparkles, BookOpen, Trophy, Users, CheckCircle2, Star, Brain, Rocket, Clock, GraduationCap, TrendingUp, Award } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-blue-600">ai</span>
                <span className="text-gray-900">fa</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="#courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Courses
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-blue-700 hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium text-sm border border-blue-200">
                <Sparkles className="w-4 h-4" />
                Next Level AI Tutoring For Lifelong Learners
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 bg-clip-text text-transparent leading-tight">
              Learn Anything,<br />Anytime, Anywhere
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed"
            >
              Create a custom learning pathway to help you achieve more in school, work, and life.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto"
            >
              Learn at your own pace through bite-sized, practical education with personalized AI guidance.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/auth/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all">
                  Start Creating Custom Courses
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="#features">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-blue-600 text-blue-700 hover:bg-blue-50">
                  See How It Works
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto"
          >
            {[
              { number: "10K+", label: "Happy Learners", gradient: "from-blue-600 to-blue-700" },
              { number: "50K+", label: "Courses Generated", gradient: "from-purple-600 to-purple-700" },
              { number: "5+", label: "Years Of Experience", gradient: "from-green-600 to-green-700" },
              { number: "15+", label: "Universities Using AIFA", gradient: "from-orange-600 to-orange-700" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.9 + index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1 }}
                className="text-center p-4 rounded-xl bg-white shadow-lg border border-gray-100"
              >
                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interactive Courses Built to Fit Your Goals
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              With AIFA, you learn at your own pace through bite-sized, practical education
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Fundamentals of Machine Learning for Beginners",
                level: "Beginner",
                color: "blue",
                icon: Brain,
                lessons: "24 lessons",
                duration: "6 weeks"
              },
              {
                title: "Intermediate Web Development",
                level: "Intermediate",
                color: "purple",
                icon: Rocket,
                lessons: "32 lessons",
                duration: "8 weeks"
              },
              {
                title: "Advanced Data Science & Analytics",
                level: "Advanced",
                color: "green",
                icon: TrendingUp,
                lessons: "40 lessons",
                duration: "10 weeks"
              }
            ].map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-14 h-14 bg-gradient-to-br from-${course.color}-500 to-${course.color}-600 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <course.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${course.color}-100 text-${course.color}-700`}>
                    {course.level}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50">
                View All Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Learn What Interests You in as Little as 10 Minutes a Day
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {[
            {
              icon: Zap,
              title: "Effective, Bite-Sized Lessons",
              description: "Our AI tutor crafts personalized learning paths to help you master new skills efficiently. No more overwhelming content—just focused, practical knowledge.",
              color: "blue"
            },
            {
              icon: Target,
              title: "Inspired Learning, Affordable Pricing",
              description: "Personal tutoring is not a luxury anymore. Start your journey for as little as the price of a cup of coffee. Quality education for everyone.",
              color: "purple"
            },
            {
              icon: Award,
              title: "Real-Life Skill Assessments",
              description: "Sharpen your skills with personalized guidance. Our AI tutor adapts to your level and provides continuous coaching to help you grow.",
              color: "green"
            },
            {
              icon: Clock,
              title: "Fit Learning Into Your Work-Life Balance",
              description: "Access AIFA on your preferred device and turn spare moments into powerful learning opportunities. Learn anywhere, anytime.",
              color: "orange"
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.03 }}
              className="flex gap-6 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 flex-shrink-0 bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <benefit.icon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need to Master Any Subject
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              AI-powered tools that adapt to your unique learning style
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Personalized Roadmaps",
                description: "Custom learning paths tailored to your goals and pace"
              },
              {
                icon: MessageSquare,
                title: "24/7 AI Tutoring",
                description: "Instant answers with explanations at your level"
              },
              {
                icon: BarChart3,
                title: "Progress Tracking",
                description: "Visualize your journey with detailed analytics"
              },
              {
                icon: Trophy,
                title: "Achievements",
                description: "Earn badges and celebrate your milestones"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-center border border-gray-100"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loved by Learners Worldwide
          </h2>
          <p className="text-gray-600 text-lg">Real stories from our community</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Mitchell",
              role: "Software Engineer",
              text: "AIFA's personalized learning paths helped me transition into AI/ML. The bite-sized lessons fit perfectly into my busy schedule!",
              rating: 5
            },
            {
              name: "David Kim",
              role: "University Student",
              text: "The 24/7 AI tutor is a game changer. I can get help anytime I'm stuck, and the explanations are always clear and helpful.",
              rating: 5
            },
            {
              name: "Emma Rodriguez",
              role: "Marketing Manager",
              text: "Learning data analytics with AIFA transformed my career. The real-life assessments made sure I could apply what I learned.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Effective Lessons, Big Results.<br />Start Learning with AIFA Today!
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Join thousands of learners achieving their goals with personalized AI-powered education.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-12 py-6 shadow-2xl">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          <p className="mt-6 text-blue-200 text-sm">
            No credit card required • Start learning in minutes
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-blue-400">ai</span>
                  <span className="text-white">fa</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered learning platform for lifelong learners everywhere.
              </p>
              <p className="text-xs text-gray-500 mt-2">An initiative by AIM Technologies</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#courses" className="hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 <span className="font-bold"><span className="text-blue-400">ai</span><span className="text-white">fa</span></span>. All rights reserved. Made with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}