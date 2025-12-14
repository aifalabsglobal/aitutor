import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { status } = await request.json()

        const updated = await db.user.update({
            where: { id: params.userId },
            data: { status }
        })

        // Audit log
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'USER_STATUS_UPDATE',
                resource: 'User',
                resourceId: params.userId,
                newValue: { status },
                metadata: { adminId: session.user.id }
            }
        })

        return NextResponse.json({ success: true, user: updated })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }
}
