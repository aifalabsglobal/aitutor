import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's roadmaps
        const roadmaps = await db.roadmap.findMany({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            },
            include: {
                steps: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ roadmaps })
    } catch (error) {
        console.error('Roadmaps API error:', error)
        return NextResponse.json({ error: 'Failed to load roadmaps' }, { status: 500 })
    }
}
