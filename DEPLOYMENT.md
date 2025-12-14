# Deployment Guide - AI Tutor Platform

This guide covers deploying the AI Tutor platform to various hosting providers.

## Table of Contents

- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- PostgreSQL database (recommend [Supabase](https://supabase.com) or [Neon](https://neon.tech))
- Grok or OpenAI API key

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No
- **Project name?** aitutor (or your preferred name)
- **Directory?** ./
- **Override settings?** No

### Step 4: Configure Environment Variables

In the Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
GROK_API_KEY=your-grok-key
```

### Step 5: Redeploy

```bash
vercel --prod
```

### Database Migrations

After deployment, run migrations:

```bash
# Set DATABASE_URL locally to your production DB
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## Docker Deployment

Deploy using Docker containers for complete control.

### Prerequisites

- Docker installed
- Docker Compose (optional)
- PostgreSQL database

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/aitutor
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GROK_API_KEY=${GROK_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=aitutor
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Step 3: Build and Run

```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Step 4: Run Migrations

```bash
# Run migrations in the container
docker-compose exec app npx prisma migrate deploy
```

---

## AWS Deployment

Deploy to AWS using EC2, ECS, or Elastic Beanstalk.

### Option 1: AWS EC2

#### Step 1: Launch EC2 Instance

1. Launch Ubuntu 22.04 LTS instance (t3.medium recommended)
2. Configure security group:
   - Inbound: HTTP (80), HTTPS (443), SSH (22)
3. Connect via SSH

#### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL (or use RDS)
sudo apt install -y postgresql postgresql-contrib
```

#### Step 3: Clone and Setup

```bash
# Clone repository
git clone https://github.com/aifalabsglobal/aitutor.git
cd aitutor

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
nano .env.local  # Edit with your values

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Build
npm run build
```

#### Step 4: Start with PM2

```bash
# Start application
pm2 start npm --name "aitutor" -- start

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

#### Step 5: Configure Nginx (Optional)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/aitutor
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/aitutor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: AWS ECS (Elastic Container Service)

1. Build and push Docker image to ECR
2. Create ECS cluster
3. Define task definition with environment variables
4. Create service with load balancer
5. Configure RDS PostgreSQL database
6. Set up auto-scaling policies

### Option 3: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js aitutor

# Create environment
eb create aitutor-prod

# Set environment variables
eb setenv DATABASE_URL="..." NEXTAUTH_SECRET="..." GROK_API_KEY="..."

# Deploy
eb deploy
```

---

## Database Setup

### Recommended PostgreSQL Hosting

#### 1. Supabase (Recommended for beginners)

- Free tier: 500MB database, 2GB bandwidth
- Sign up: [supabase.com](https://supabase.com)
- Get connection string from project settings
- Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### 2. Neon (Serverless PostgreSQL)

- Free tier: 10GB storage
- Sign up: [neon.tech](https://neon.tech)
- Excellent for development and production
- Built-in connection pooling

#### 3. AWS RDS

- Production-grade managed PostgreSQL
- Auto-backups and scaling
- More expensive but robust

#### 4. Railway

- Simple deployment with database included
- Good for small to medium apps

### Database Migration

```bash
# Deploy migrations to production
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AI Service
GROK_API_KEY="your-api-key"
```

### Optional Environment Variables

```bash
# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="app-password"

# File Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

### Generate Secure Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Post-Deployment Checklist

### Security

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables set securely
- [ ] Database has strong password
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Performance

- [ ] CDN configured for static assets
- [ ] Database connection pooling enabled
- [ ] Caching strategy implemented
- [ ] Image optimization enabled

### Monitoring

- [ ] Error tracking setup (Sentry)
- [ ] Application monitoring (Vercel Analytics, New Relic)
- [ ] Database monitoring
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (CloudWatch, Datadog)

### Backup

- [ ] Database automated backups enabled
- [ ] Backup retention policy set
- [ ] Disaster recovery plan documented

### Testing

- [ ] Health check endpoint working
- [ ] Authentication flow tested
- [ ] API endpoints verified
- [ ] Database migrations applied
- [ ] Environment variables verified

### Documentation

- [ ] Production URLs documented
- [ ] Deployment process documented
- [ ] Rollback procedure created
- [ ] Team notified of deployment

---

## Continuous Deployment

### GitHub Actions (Auto-deploy to Vercel)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  image: node:18
  script:
    - npm install -g vercel
    - vercel --prod --token=$VERCEL_TOKEN
  only:
    - main
```

---

## Troubleshooting

### Common Issues

**Build fails on Vercel**
- Check Node.js version in `package.json` engines field
- Ensure all dependencies are in `dependencies`, not `devDependencies`

**Database connection timeout**
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Enable connection pooling

**Environment variables not working**
- Prefix client-side variables with `NEXT_PUBLIC_`
- Restart deployment after adding variables
- Check for typos in variable names

**Memory issues**
- Increase server memory allocation
- Optimize database queries
- Implement caching

---

For support, contact: support@aifalabs.com
