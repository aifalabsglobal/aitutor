import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        name,
        email,
        role: 'STUDENT',
      }
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: 'User',
        resourceId: user.id,
        metadata: { registrationMethod: 'email' }
      }
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}