import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define auth pages and public pages
    const isAuthPage = ['/signin', '/signup'].includes(req.nextUrl.pathname)
    const isPublicPage = ['/', '/auth/callback'].includes(req.nextUrl.pathname)

    // If user is not signed in
    if (!session) {
      // Allow access to auth pages and public pages
      if (isAuthPage || isPublicPage) {
        return res
      }
      // Redirect to signin for all other pages
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    // If user is signed in
    if (session) {
      // Don't allow access to auth pages, redirect to messages
      if (isAuthPage || req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard/messages', req.url))
      }
      // Allow access to all other pages
      return res
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to continue
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
