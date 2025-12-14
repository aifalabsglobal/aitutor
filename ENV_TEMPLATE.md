# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://postgres:password@localhost:5432/aitutor?schema=public"

# ==========================================
# AUTHENTICATION (NextAuth.js)
# ==========================================
# Base URL of your application
NEXTAUTH_URL="http://localhost:3000"

# Secret key for encrypting tokens and sessions
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# ==========================================
# AI SERVICE CONFIGURATION
# ==========================================
# Choose ONE AI provider (Grok or OpenAI)

# Option 1: Grok API (recommended)
GROK_API_KEY="your-grok-api-key-here"
GROK_API_URL="https://api.x.ai/v1"
GROK_MODEL="grok-beta"

# Option 2: OpenAI API (alternative)
# OPENAI_API_KEY="your-openai-api-key-here"
# OPENAI_MODEL="gpt-4-turbo-preview"

# AI Settings
AI_TEMPERATURE="0.7"
AI_MAX_TOKENS="2000"

# ==========================================
# SPEECH & VOICE SERVICES (Optional)
# ==========================================
# For voice onboarding and voice interactions
SPEECH_API_KEY="your-speech-recognition-api-key"
TEXT_TO_SPEECH_API_KEY="your-tts-api-key"

# ==========================================
# APPLICATION SETTINGS
# ==========================================
# Node environment
NODE_ENV="development"

# Application name
NEXT_PUBLIC_APP_NAME="AI Tutor"

# Port (default: 3000)
PORT="3000"

# ==========================================
# GAMIFICATION SETTINGS
# ==========================================
# XP rewards
XP_PER_LESSON_COMPLETE="50"
XP_PER_QUIZ_PASS="100"
XP_PER_ROADMAP_COMPLETE="500"
XP_PER_DAILY_LOGIN="10"

# Level thresholds (XP needed per level)
XP_BASE_LEVEL="100"
XP_LEVEL_MULTIPLIER="1.5"

# ==========================================
# EMAIL SERVICE (Optional)
# ==========================================
# For notifications and password resets
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@aitutor.com"

# ==========================================
# FILE STORAGE (Optional)
# ==========================================
# AWS S3 for user uploads, avatars, etc.
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="aitutor-uploads"

# ==========================================
# ANALYTICS (Optional)
# ==========================================
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# ==========================================
# ERROR TRACKING (Optional)
# ==========================================
# Sentry for error monitoring
SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# ==========================================
# RATE LIMITING
# ==========================================
# API rate limits
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"

# ==========================================
# FEATURE FLAGS
# ==========================================
# Enable/disable features
ENABLE_VOICE_ONBOARDING="true"
ENABLE_CHAT_TUTOR="true"
ENABLE_GAMIFICATION="true"
ENABLE_TUTOR_ESCALATION="true"

# ==========================================
# DEBUGGING
# ==========================================
# Set to "true" to enable verbose logging
DEBUG="false"
LOG_LEVEL="info"

# ==========================================
# SECURITY
# ==========================================
# CORS allowed origins (comma-separated)
CORS_ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Session duration (in seconds)
SESSION_MAX_AGE="86400"

# ==========================================
# DEVELOPMENT TOOLS
# ==========================================
# Prisma Studio
PRISMA_STUDIO_PORT="5555"

# ==========================================
# NOTES
# ==========================================
# 1. Copy this file to .env.local for local development
# 2. Never commit .env.local to version control
# 3. Update production values in your hosting platform
# 4. Generate secure secrets for production environments
# 5. Rotate secrets regularly for security
