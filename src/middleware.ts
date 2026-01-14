import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Session kontrolü
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Korumalı rotalar
  const protectedPaths = ['/dashboard', '/garage', '/forum']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Auth sayfaları (giriş yapmış kullanıcıya gösterme)
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // Ana sayfa ve auth callback hariç her yer için kontrol
  const publicPaths = ['/', '/auth/callback', '/offline']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path))

  // Eğer kullanıcı giriş yapmamışsa ve korumalı bir rotaya erişmeye çalışıyorsa
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Eğer kullanıcı giriş yapmışsa ve auth sayfalarına erişmeye çalışıyorsa
  if (isAuthPath && session) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Onboarding kontrolü (sadece session varsa)
  if (session && !pathname.startsWith('/onboarding')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, nickname')
        .eq('id', session.user.id)
        .single()

      // Eğer profile yoksa veya onboarding tamamlanmadıysa
      if (!profile || (!profile.onboarding_completed && !profile.nickname)) {
        const onboardingUrl = new URL('/onboarding', request.url)
        return NextResponse.redirect(onboardingUrl)
      }
    } catch (error) {
      // Profile erişemeyebiliriz (hata durumunda sessizce devam et)
      console.error('Middleware profile check error:', error)
    }
  }

  return response
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
