import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('avatar') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const filename = `${session.user.id}_${timestamp}.${file.name.split('.').pop()}`
        const filepath = join(process.cwd(), 'public', 'avatars', filename)

        // Save file
        await writeFile(filepath, buffer)
        const url = `/avatars/${filename}`

        // Update user avatar
        await db.user.update({
            where: { email: session.user.email },
            data: { avatar: url }
        })

        return NextResponse.json({ success: true, url })
    } catch (error) {
        console.error('Avatar upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
