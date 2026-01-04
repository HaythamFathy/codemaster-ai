import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Define protected paths
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // 2. Check for token in cookies
        const token = request.cookies.get('token')?.value;

        if (!token) {
            // 3. Kick them out if no token
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Note: We can't easily decode JWT here without 'jose' library, 
        // so we rely on the AdminLayout (client-side) to check the specific ROLE.
        // This middleware just ensures they are at least logged in.
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
