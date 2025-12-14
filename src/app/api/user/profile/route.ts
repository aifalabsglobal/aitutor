import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                phoneNumber: true,
                timezone: true,
                preferredLanguage: true,
                role: true,
                createdAt: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const updated = await db.user.update({
            where: { email: session.user.email },
            data: {
                name: data.name,
                bio: data.bio,
                phoneNumber: data.phoneNumber,
                timezone: data.timezone,
            }
        })

        // Log the update
        await db.auditLog.create({
            data: {
                userId: updated.id,
                action: 'USER_PROFILE_UPDATE',
                resource: 'User',
                resourceId: updated.id,
                metadata: { fields: Object.keys(data) }
            }
        })

        return NextResponse.json({ success: true, user: updated })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
