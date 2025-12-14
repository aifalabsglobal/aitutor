import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token || (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Protect profile routes
    if (request.nextUrl.pathname.startsWith('/profile')) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/signin', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/profile/:path*']
}
