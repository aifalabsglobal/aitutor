# API Documentation - AI Tutor Platform

Complete API reference for the AI Tutor platform. All endpoints require authentication unless otherwise noted.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Roadmaps](#roadmaps)
- [Learning](#learning)
- [Quizzes](#quizzes)
- [Chat](#chat)
- [Gamification](#gamification)
- [Error Handling](#error-handling)

---

## Authentication

### Sign Up
Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "STUDENT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

### Sign In
Authenticate an existing user.

**Endpoint:** `POST /api/auth/signin`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "session": {
    "user": {
      "id": "clx1234567890",
      "email": "student@example.com",
      "name": "John Doe",
      "role": "STUDENT"
    },
    "expires": "2024-12-15T00:00:00.000Z"
  }
}
```

### Get Session
Retrieve current session information.

**Endpoint:** `GET /api/auth/session`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "level": 5,
    "xp": 1250
  }
}
```

### Sign Out
End current session.

**Endpoint:** `POST /api/auth/signout`

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Users

### Get User Profile
Retrieve detailed user profile.

**Endpoint:** `GET /api/user/profile`

**Response:** `200 OK`
```json
{
  "id": "clx1234567890",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "avatar": "https://...",
  "bio": "Passionate learner",
  "xp": 1250,
  "level": 5,
  "streak": 7,
  "longestStreak": 21,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "studentProfile": {
    "learningGoal": "Master web development",
    "currentLevel": "intermediate",
    "preferredPace": "moderate",
    "timeAvailability": "2 hours daily",
    "learningStyle": "hands-on",
    "targetOutcome": "job"
  }
}
```

### Update User Profile
Update user information.

**Endpoint:** `PATCH /api/user/profile`

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Full-stack developer in training",
  "avatar": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "name": "John Smith",
    "bio": "Full-stack developer in training"
  }
}
```

### Get User Statistics
Retrieve learning statistics and analytics.

**Endpoint:** `GET /api/user/stats`

**Response:** `200 OK`
```json
{
  "totalXP": 1250,
  "level": 5,
  "streak": 7,
  "longestStreak": 21,
  "lessonsCompleted": 25,
  "quizzesPassed": 15,
  "roadmapsCompleted": 2,
  "totalTimeSpent": 3600,
  "achievements": 12,
  "badges": 8
}
```

---

## Roadmaps

### List Roadmaps
Get all roadmaps for the current user.

**Endpoint:** `GET /api/roadmaps`

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, ACTIVE, COMPLETED, ARCHIVED)
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "roadmaps": [
    {
      "id": "roadmap_123",
      "title": "Full-Stack Web Development",
      "description": "Complete path to becoming a full-stack developer",
      "totalSteps": 15,
      "completedSteps": 5,
      "estimatedHours": 120,
      "difficulty": "intermediate",
      "status": "ACTIVE",
      "progress": 33.3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

### Create Roadmap
Generate a new personalized learning roadmap using AI.

**Endpoint:** `POST /api/roadmaps`

**Request Body:**
```json
{
  "learningGoalId": "goal_123",
  "title": "Master React Development",
  "subject": "React & Frontend",
  "targetLevel": "advanced",
  "timeCommitment": 10,
  "additionalContext": "Focus on hooks and performance optimization"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "roadmap": {
    "id": "roadmap_456",
    "title": "Master React Development",
    "description": "AI-generated roadmap",
    "totalSteps": 12,
    "estimatedHours": 60,
    "difficulty": "advanced",
    "status": "DRAFT",
    "generatedBy": "grok-beta"
  }
}
```

### Get Roadmap Details
Retrieve detailed roadmap with all steps.

**Endpoint:** `GET /api/roadmaps/[id]`

**Response:** `200 OK`
```json
{
  "id": "roadmap_123",
  "title": "Full-Stack Web Development",
  "description": "Complete path",
  "totalSteps": 15,
  "estimatedHours": 120,
  "difficulty": "intermediate",
  "status": "ACTIVE",
  "steps": [
    {
      "id": "step_1",
      "title": "HTML Fundamentals",
      "description": "Learn basic HTML structure",
      "order": 1,
      "type": "TOPIC",
      "difficulty": "beginner",
      "estimatedMinutes": 120,
      "status": "COMPLETED",
      "currentScore": 85,
      "masteryThreshold": 70,
      "prerequisites": [],
      "positionX": 100,
      "positionY": 100
    },
    {
      "id": "step_2",
      "title": "CSS Styling",
      "description": "Master CSS for beautiful UIs",
      "order": 2,
      "type": "TOPIC",
      "difficulty": "beginner",
      "estimatedMinutes": 180,
      "status": "IN_PROGRESS",
      "currentScore": 45,
      "masteryThreshold": 70,
      "prerequisites": ["step_1"],
      "positionX": 250,
      "positionY": 100
    }
  ]
}
```

### Update Roadmap
Modify roadmap details or step positions.

**Endpoint:** `PATCH /api/roadmaps/[id]`

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "ACTIVE",
  "steps": [
    {
      "id": "step_1",
      "positionX": 150,
      "positionY": 120
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "roadmap": {
    "id": "roadmap_123",
    "title": "Updated Title",
    "status": "ACTIVE"
  }
}
```

### Delete Roadmap
Remove a roadmap (soft delete to ARCHIVED status).

**Endpoint:** `DELETE /api/roadmaps/[id]`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Roadmap archived successfully"
}
```

---

## Learning

### Get Learning Content
Retrieve content for a specific roadmap node.

**Endpoint:** `GET /api/learn/[roadmapId]/[nodeId]`

**Response:** `200 OK`
```json
{
  "step": {
    "id": "step_2",
    "title": "CSS Styling",
    "description": "Master CSS for beautiful UIs",
    "content": "# CSS Fundamentals\n\n## Introduction\n...",
    "type": "TOPIC",
    "difficulty": "beginner",
    "estimatedMinutes": 180,
    "resources": [
      {
        "type": "video",
        "title": "CSS Crash Course",
        "url": "https://..."
      },
      {
        "type": "article",
        "title": "CSS Documentation",
        "url": "https://..."
      }
    ]
  },
  "progress": {
    "percentage": 45,
    "timeSpent": 90,
    "completed": false
  },
  "nextStep": {
    "id": "step_3",
    "title": "JavaScript Basics"
  }
}
```

### Update Progress
Record learning progress for a step.

**Endpoint:** `POST /api/learn/progress`

**Request Body:**
```json
{
  "stepId": "step_2",
  "roadmapId": "roadmap_123",
  "percentage": 75,
  "timeSpent": 120,
  "completed": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "progress": {
    "percentage": 75,
    "timeSpent": 120,
    "completed": false
  },
  "xpAwarded": 25
}
```

### Submit Assessment
Submit answers for a node assessment.

**Endpoint:** `POST /api/learn/[roadmapId]/[nodeId]/assess`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": "A"
    },
    {
      "questionId": "q2",
      "answer": "function declaration"
    }
  ],
  "timeSpent": 600
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "assessment": {
    "score": 85,
    "passed": true,
    "attemptNumber": 2,
    "feedback": {
      "overall": "Great job! You've mastered this topic.",
      "questions": [
        {
          "questionId": "q1",
          "correct": true,
          "explanation": "..."
        }
      ]
    }
  },
  "stepStatus": "COMPLETED",
  "xpAwarded": 100,
  "badgesEarned": ["PERFECT_SCORE"]
}
```

---

## Quizzes

### List Quizzes
Get available quizzes.

**Endpoint:** `GET /api/quizzes`

**Query Parameters:**
- `subject` (optional): Filter by subject
- `difficulty` (optional): Filter by difficulty
- `limit` (optional): Number of results

**Response:** `200 OK`
```json
{
  "quizzes": [
    {
      "id": "quiz_123",
      "title": "JavaScript Fundamentals Quiz",
      "description": "Test your JavaScript knowledge",
      "subject": "JavaScript",
      "difficulty": "intermediate",
      "questionCount": 10,
      "timeLimit": 30,
      "passingScore": 70,
      "attempts": 2,
      "bestScore": 85
    }
  ]
}
```

### Get Quiz
Retrieve quiz questions.

**Endpoint:** `GET /api/quizzes/[id]`

**Response:** `200 OK`
```json
{
  "id": "quiz_123",
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge",
  "subject": "JavaScript",
  "difficulty": "intermediate",
  "timeLimit": 30,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "question": "What is a closure in JavaScript?",
      "type": "MULTIPLE_CHOICE",
      "options": [
        "A function inside another function",
        "A way to close browser windows",
        "A loop structure",
        "A data type"
      ],
      "points": 10
    }
  ]
}
```

### Submit Quiz Attempt
Submit quiz answers for grading.

**Endpoint:** `POST /api/quizzes/attempt`

**Request Body:**
```json
{
  "quizId": "quiz_123",
  "answers": [
    {
      "questionId": "q1",
      "answer": "A function inside another function"
    }
  ],
  "timeSpent": 1200
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "attempt": {
    "id": "attempt_789",
    "score": 90,
    "passed": true,
    "timeSpent": 1200,
    "feedback": {
      "overall": "Excellent work!",
      "correctAnswers": 9,
      "totalQuestions": 10,
      "questions": [...]
    }
  },
  "xpAwarded": 100,
  "badgesEarned": ["QUIZ_MASTER"]
}
```

### Get Quiz Results
Retrieve results for a specific quiz attempt.

**Endpoint:** `GET /api/quizzes/results/[attemptId]`

**Response:** `200 OK`
```json
{
  "attempt": {
    "id": "attempt_789",
    "quizTitle": "JavaScript Fundamentals Quiz",
    "score": 90,
    "passed": true,
    "timeSpent": 1200,
    "createdAt": "2024-12-15T01:00:00.000Z",
    "feedback": {
      "questions": [...]
    }
  }
}
```

---

## Chat

### Send Message
Send a message to the AI tutor.

**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "message": "Can you explain closures in JavaScript?",
  "sessionId": "session_123",
  "context": {
    "roadmapId": "roadmap_123",
    "currentStepId": "step_5"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": {
    "id": "msg_456",
    "role": "ASSISTANT",
    "content": "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned...",
    "metadata": {
      "confidence": 0.95,
      "sources": ["MDN Web Docs", "JavaScript.info"]
    }
  },
  "sessionId": "session_123"
}
```

### Get Chat History
Retrieve chat session history.

**Endpoint:** `GET /api/chat/history`

**Query Parameters:**
- `sessionId` (optional): Specific session ID
- `limit` (optional): Number of messages (default: 50)

**Response:** `200 OK`
```json
{
  "sessions": [
    {
      "id": "session_123",
      "title": "JavaScript Closures Help",
      "createdAt": "2024-12-15T00:30:00.000Z",
      "updatedAt": "2024-12-15T01:00:00.000Z",
      "messages": [
        {
          "id": "msg_1",
          "role": "USER",
          "content": "Can you explain closures?",
          "createdAt": "2024-12-15T00:30:00.000Z"
        },
        {
          "id": "msg_2",
          "role": "ASSISTANT",
          "content": "A closure is...",
          "createdAt": "2024-12-15T00:30:15.000Z"
        }
      ]
    }
  ]
}
```

---

## Gamification

### Award XP
Award experience points to a user.

**Endpoint:** `POST /api/gamification/award-xp`

**Request Body:**
```json
{
  "userId": "clx1234567890",
  "amount": 100,
  "reason": "QUIZ_PASS",
  "metadata": {
    "quizId": "quiz_123",
    "score": 90
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "xpAwarded": 100,
  "newTotal": 1350,
  "levelUp": false,
  "currentLevel": 5
}
```

### Get Badges
Retrieve user's earned badges.

**Endpoint:** `GET /api/gamification/badges`

**Response:** `200 OK`
```json
{
  "badges": [
    {
      "id": "badge_1",
      "badgeType": "FIRST_LESSON",
      "earnedAt": "2024-01-01T10:00:00.000Z",
      "description": "Completed your first lesson"
    },
    {
      "id": "badge_2",
      "badgeType": "QUIZ_MASTER",
      "earnedAt": "2024-01-05T14:30:00.000Z",
      "description": "Passed 10 quizzes with 90%+ score"
    }
  ],
  "total": 2
}
```

### Get Achievements
Retrieve achievement progress.

**Endpoint:** `GET /api/gamification/achievements`

**Response:** `200 OK`
```json
{
  "achievements": [
    {
      "id": "achievement_1",
      "achievementType": "COMPLETE_10_LESSONS",
      "progress": 7,
      "targetProgress": 10,
      "completed": false,
      "description": "Complete 10 lessons"
    },
    {
      "id": "achievement_2",
      "achievementType": "STREAK_30_DAYS",
      "progress": 7,
      "targetProgress": 30,
      "completed": false,
      "description": "Maintain a 30-day learning streak"
    }
  ]
}
```

### Check Achievements
Trigger achievement check after an action.

**Endpoint:** `POST /api/gamification/check-achievements`

**Request Body:**
```json
{
  "userId": "clx1234567890",
  "action": "LESSON_COMPLETE",
  "metadata": {
    "lessonId": "lesson_123"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "achievementsUnlocked": [
    {
      "achievementType": "COMPLETE_10_LESSONS",
      "xpAwarded": 500,
      "badgeAwarded": "DEDICATED_LEARNER"
    }
  ]
}
```

---

## Error Handling

All endpoints follow consistent error response format:

### Error Response Format
```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  }
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Codes

- `INVALID_INPUT` - Request validation failed
- `UNAUTHORIZED` - Authentication required or failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AI_SERVICE_ERROR` - AI service unavailable
- `DATABASE_ERROR` - Database operation failed

### Example Error Responses

**400 Bad Request**
```json
{
  "error": true,
  "code": "INVALID_INPUT",
  "message": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**401 Unauthorized**
```json
{
  "error": true,
  "code": "UNAUTHORIZED",
  "message": "Authentication required. Please sign in."
}
```

**429 Too Many Requests**
```json
{
  "error": true,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 60 seconds.",
  "details": {
    "retryAfter": 60
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Authentication endpoints**: 5 requests per minute
- **Chat endpoints**: 20 requests per minute
- **Standard endpoints**: 100 requests per minute
- **Read-only endpoints**: 200 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when the limit resets

---

## Webhooks (Coming Soon)

Future support for webhooks to notify external systems of events:
- User completed roadmap
- Achievement unlocked
- Tutor assignment requested
- Quiz passed

---

**For questions or support, contact:** support@aifalabs.com
