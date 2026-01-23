import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              path: '/',
            })
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.log('Middleware auth error:', error.message)
  }

  const { pathname } = request.nextUrl

  // Protected routes
  const protectedPaths = ['/dashboard', '/garage', '/forum', '/map', '/profile', '/stats', '/drivers', '/messages', '/weather', '/admin']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Auth pages (don't show to logged in users)
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // Onboarding path - allow authenticated users to access without redirect
  const isOnboardingPath = pathname.startsWith('/onboarding')

  // If user is not logged in and trying to access protected route (except onboarding)
  if (isProtectedPath && !user && !isOnboardingPath) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth pages
  if (isAuthPath && user) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // IMPORTANT: Return supabaseResponse instead of NextResponse.next()
  // This ensures cookies are properly forwarded
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
