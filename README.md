# 🎓 AI Tutor - Intelligent Personalized Learning Platform

An AI-powered adaptive learning platform that creates personalized roadmaps, provides interactive lessons, gamified learning experiences, and intelligent tutoring through conversational AI.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### 🤖 AI-Powered Learning
- **Personalized Roadmaps**: AI generates custom learning paths based on student goals and proficiency
- **Intelligent Chat Tutor**: Interactive conversational AI for real-time learning assistance
- **Voice Onboarding**: Natural voice-based user onboarding experience
- **Adaptive Assessments**: Dynamic quizzes that adjust to student performance

### 📚 Learning Experience
- **Visual Roadmaps**: Interactive, drag-and-drop roadmap builder with node-based progression
- **Rich Content**: Lessons with markdown support, code highlighting, and interactive elements
- **Progress Tracking**: Comprehensive analytics and progress monitoring
- **Multi-format Quizzes**: Multiple choice, true/false, short answer, essay, and coding questions

### 🎮 Gamification
- **XP & Leveling System**: Earn experience points and level up as you learn
- **Badges & Achievements**: Unlock badges for milestones (First Lesson, Quiz Master, Streaks, etc.)
- **Streak Tracking**: Daily activity streaks with longest streak records
- **Leaderboards**: Compete with other learners (coming soon)

### 👥 Role-Based Access
- **Students**: Personalized learning dashboards, progress tracking, and AI tutoring
- **Tutors**: Manage student assignments, provide feedback, track blockers
- **Admins**: Oversee platform operations, manage users, and analytics

### 🎨 Modern UI/UX
- **Responsive Design**: Beautiful, mobile-first interface
- **Dark/Light Themes**: Toggle between themes for comfortable learning
- **Smooth Animations**: Engaging micro-interactions with Framer Motion
- **Accessible Components**: Built with Radix UI for accessibility compliance

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** or **pnpm**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/aifalabsglobal/aitutor.git
cd aitutor
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aitutor"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Service (Grok or OpenAI)
GROK_API_KEY="your-grok-api-key"
# OR
OPENAI_API_KEY="your-openai-api-key"

# Optional: Voice/Speech APIs
SPEECH_API_KEY="your-speech-api-key"
```

4. **Set up the database**
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed sample data
npx tsx prisma/seed.ts
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
aitutor/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── chat/            # AI chat endpoints
│   │   │   ├── gamification/    # XP, badges, achievements
│   │   │   ├── learn/           # Learning content delivery
│   │   │   ├── quizzes/         # Quiz management
│   │   │   ├── roadmaps/        # Roadmap CRUD operations
│   │   │   └── user/            # User profile management
│   │   ├── dashboard/           # Role-based dashboards
│   │   │   ├── student/
│   │   │   └── tutor/
│   │   ├── learn/               # Learning interface
│   │   ├── onboarding/          # User onboarding flow
│   │   ├── profile/             # User profiles
│   │   ├── quizzes/             # Quiz taking interface
│   │   └── roadmaps/            # Roadmap management
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── chat/                # Chat-related components
│   │   ├── gamification/        # Gamification UI
│   │   ├── onboarding/          # Onboarding components
│   │   ├── roadmap/             # Roadmap visualizations
│   │   └── voice/               # Voice interaction components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── db.ts               # Database client
│   │   ├── grok.ts             # AI service integration
│   │   └── utils.ts            # Helper functions
│   └── types/                   # TypeScript type definitions
├── prisma/
│   ├── schema.prisma           # Main Prisma schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Database seeding
├── public/                      # Static assets
└── tests/                       # Test files
```

## 🔧 Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **React 19** - UI library

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend & Database
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **NextAuth.js** - Authentication solution

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query** - Data synchronization
- **Axios** - HTTP client

### AI & NLP
- **Grok API** - AI language model (or OpenAI compatible)
- **Speech Recognition** - Voice interaction support

### Forms & Validation
- **React Hook Form** - Performance forms
- **Zod** - Schema validation

### Advanced Features
- **TanStack Table** - Data tables
- **DND Kit** - Drag and drop
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code highlighting

## 🗄️ Database Schema

### Core Models

#### User
Central user model with support for students, tutors, and admins. Includes gamification fields (XP, level, streaks).

#### StudentProfile
Learning preferences: goals, pace, time availability, learning style, target outcomes.

#### LearningGoal
User-defined learning objectives with target completion dates and time commitments.

#### Roadmap
AI-generated personalized learning paths with steps, estimated hours, and difficulty levels.

#### RoadmapStep
Individual learning nodes with content, assessments, prerequisites, and visual positioning.

#### Quiz & QuizAttempt
Flexible quiz system supporting multiple question types with detailed attempt tracking.

#### ChatSession & ChatMessage
Conversational AI interactions with context preservation.

#### Progress
Granular tracking of user progress through roadmaps and steps.

### Gamification Models

#### Badge
Achievements like First Lesson, Quiz Master, Streak badges.

#### Achievement
Long-term goals (Complete 100 lessons, 365-day streak, etc.).

### Administrative Models

#### NodeAssessment
Tracks each assessment attempt for mastery-based progression.

#### TutorAssignment
Human tutor escalation when AI assistance is insufficient.

#### AuditLog
Comprehensive audit trail for compliance and debugging.

## 🔌 API Reference

### Authentication
```
POST   /api/auth/signup           # User registration
POST   /api/auth/signin           # User login
GET    /api/auth/session          # Get current session
POST   /api/auth/signout          # User logout
```

### User Management
```
GET    /api/user/profile          # Get user profile
PATCH  /api/user/profile          # Update user profile
GET    /api/user/stats            # Get user statistics
```

### Roadmaps
```
GET    /api/roadmaps              # List all roadmaps
POST   /api/roadmaps              # Create new roadmap
GET    /api/roadmaps/[id]         # Get roadmap by ID
PATCH  /api/roadmaps/[id]         # Update roadmap
DELETE /api/roadmaps/[id]         # Delete roadmap
GET    /api/roadmaps/[id]/steps   # Get roadmap steps
```

### Learning
```
GET    /api/learn/[roadmapId]/[nodeId]    # Get learning content
POST   /api/learn/progress                 # Update progress
```

### Quizzes
```
GET    /api/quizzes               # List all quizzes
POST   /api/quizzes               # Create quiz
GET    /api/quizzes/[id]          # Get quiz by ID
POST   /api/quizzes/attempt       # Submit quiz attempt
GET    /api/quizzes/results/[id]  # Get attempt results
```

### Chat
```
POST   /api/chat                  # Send message to AI tutor
GET    /api/chat/history          # Get chat history
```

### Gamification
```
POST   /api/gamification/award-xp # Award XP to user
GET    /api/gamification/badges   # Get user badges
GET    /api/gamification/achievements # Get achievements
POST   /api/gamification/check-achievements # Check for new achievements
```

## 🎯 Key Features Explained

### 1. Personalized Learning Roadmaps

The platform generates customized learning paths using AI:

1. **Onboarding**: User provides learning goals, current level, time availability
2. **Profile Creation**: System creates a Student Learning Profile (SLP)
3. **AI Generation**: Grok AI generates a structured roadmap with:
   - Sequential learning steps
   - Prerequisite dependencies
   - Estimated time for each step
   - Difficulty progression
   - Assessment criteria
4. **Visual Representation**: Interactive node-based roadmap with drag-and-drop positioning

### 2. Mastery-Based Progression

Students must demonstrate mastery before advancing:

- Each node has a **mastery threshold** (default 70%)
- Students take **assessments** for each node
- System tracks **attempt count** and **best score**
- Nodes unlock based on **prerequisites** and **mastery**
- **Adaptive remediation** if mastery not achieved

### 3. AI Tutoring with Context

Intelligent conversational assistance:

- **Context-aware**: Knows current roadmap position and learning history
- **Personalized responses**: Adapts to student's learning style and level
- **Resource suggestions**: Provides relevant links, examples, and explanations
- **Escalation path**: Can recommend human tutor when needed

### 4. Gamification Engine

Engagement through game mechanics:

- **XP System**: Award points for completing lessons, quizzes, and milestones
- **Leveling**: Automatic level-ups with XP thresholds
- **Daily Streaks**: Track consecutive days of activity
- **Badges**: Instant rewards for specific achievements
- **Long-term Achievements**: Progressive goals with tracking

### 5. Human Tutor Escalation

When AI assistance is insufficient:

1. Student requests tutor help on specific nodes
2. System creates **TutorAssignment** with context
3. Admin assigns human tutor
4. Tutor provides personalized guidance
5. After tutoring, AI reassesses mastery
6. Roadmap progression continues

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- content-formatting.test.ts

# Run with coverage
npm test -- --coverage
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

The build process:
1. Compiles TypeScript
2. Optimizes assets with Next.js
3. Generates static pages where possible
4. Creates standalone output for deployment

## 📦 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t aitutor .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  aitutor
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production

Ensure these are set in your production environment:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GROK_API_KEY` or `OPENAI_API_KEY`

## 🔐 Security

- **Authentication**: Secure session-based auth with NextAuth.js
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + Content Security Policy
- **CSRF Protection**: Built-in Next.js CSRF tokens
- **Audit Logging**: Comprehensive activity tracking

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Grok](https://grok.com/) / [OpenAI](https://openai.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📧 Support

For questions or issues:
- 📧 Email: support@aifalabs.com
- 🐛 Issues: [GitHub Issues](https://github.com/aifalabsglobal/aitutor/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/aifalabsglobal/aitutor/discussions)

## 🗺️ Roadmap

### Current Version (v0.1.0)
- ✅ Core learning platform
- ✅ AI roadmap generation
- ✅ Gamification system
- ✅ Chat-based tutoring
- ✅ Quiz system

### Upcoming Features
- 🔄 Real-time collaboration
- 🔄 Mobile application
- 🔄 Advanced analytics dashboard
- 🔄 Course marketplace
- 🔄 Live tutoring sessions
- 🔄 Peer learning communities
- 🔄 Certificate generation
- 🔄 Integration with LMS platforms

---

**Built with ❤️ by [AIFA Labs Global](https://github.com/aifalabsglobal)**
