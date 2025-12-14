-- Add gamification fields to User
ALTER TABLE "User" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "User" ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastActiveDate" TIMESTAMP(3);

-- Create Badge table
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- Create Achievement table
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementType" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "targetProgress" INTEGER NOT NULL DEFAULT 100,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "Badge_userId_badgeType_key" ON "Badge"("userId", "badgeType");
CREATE UNIQUE INDEX "Achievement_userId_achievementType_key" ON "Achievement"("userId", "achievementType");

-- Add foreign keys
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
