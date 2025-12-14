import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { language } = await request.json()

        // Update user's preferred language
        await prisma.user.update({
            where: { email: session.user.email },
            data: { preferredLanguage: language }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Language update error:', error)
        return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
    }
}
