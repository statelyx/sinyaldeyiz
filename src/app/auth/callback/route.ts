import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, {
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7, // 7 days
                })
              )
            } catch {
              // Ignore - called from Server Component
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
    }

    if (data.user) {
      console.log('Auth successful for user:', data.user.id)

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname, onboarding_completed')
        .eq('id', data.user.id)
        .single()

      console.log('Profile query result:', { profile, profileError })

      // If profile doesn't exist, create one
      if (profileError?.code === 'PGRST116' || !profile) {
        console.log('Creating new profile for user:', data.user.id)

        const provider = data.user.app_metadata?.provider || 'email'

        const newProfile = {
          id: data.user.id,
          email: data.user.email || null,
          nickname: null,
          provider: provider as 'google' | 'email' | 'guest',
          is_guest: false,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Use upsert to handle race conditions
        const { error: insertError } = await (supabase.from('profiles') as any)
          .upsert(newProfile, { onConflict: 'id' })

        if (insertError) {
          console.error('Profile creation error:', insertError)
          // Even if profile creation fails, redirect to onboarding 
          // The onboarding page will try to create the profile again
        } else {
          console.log('Profile created successfully')
        }

        // New user - go to onboarding
        const response = NextResponse.redirect(`${origin}/onboarding`)
        return response
      }

      console.log('Profile found:', profile)

      // Existing user - check onboarding status
      if ((profile as any)?.onboarding_completed === true || (profile as any)?.nickname) {
        console.log('Redirecting onboarded user to dashboard')
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        console.log('Redirecting existing user to onboarding')
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  console.log('Fallback: redirecting to home')
  return NextResponse.redirect(`${origin}/`)
}
