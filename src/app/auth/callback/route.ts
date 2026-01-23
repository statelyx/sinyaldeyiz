import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(`${origin}/?error=no_code`)
  }

  // Create cookies store - we'll use this to set cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  console.log('Callback: All incoming cookies:', allCookies.map(c => c.name).join(', '))

  // Find the PKCE verifier cookie (the name varies based on project ID)
  const verifierCookie = allCookies.find(c => c.name.endsWith('-code-verifier'))
  const verifier = verifierCookie?.value
  console.log('Callback: PKCE Verifier found with name:', verifierCookie?.name, 'status:', !!verifier)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, { ...options, path: '/' })
            })
          } catch (err) {
            // Handle middleware or server action context where cookies().set might fail
            console.error('Error setting cookies in callback:', err)
          }
        },
      },
    }
  )

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth exchange error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        verifier_present: !!verifier
      })
      return NextResponse.redirect(`${origin}/?error=exchange_failed&message=${encodeURIComponent(error.message)}`)
    }

    if (!data.session || !data.user) {
      console.error('No session or user in response')
      return NextResponse.redirect(`${origin}/?error=no_session`)
    }

    console.log('Auth successful for user:', data.user.id)
    console.log('Session expires at:', data.session.expires_at)

    // Determine redirect URL based on profile
    let redirectUrl = `${origin}/onboarding`

    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('nickname, onboarding_completed')
        .eq('id', data.user.id)
        .single()

      console.log('Profile query result:', { profile, profileError })

      const profileData = profile as { nickname: string | null; onboarding_completed: boolean } | null

      if (profileError?.code === 'PGRST116' || !profileData) {
        // No profile exists - create one
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

        const { error: insertError } = await (supabase
          .from('profiles') as any)
          .upsert(newProfile, { onConflict: 'id' })

        if (insertError) {
          console.error('Profile creation error:', insertError)
          // Continue to onboarding even if profile creation fails
        } else {
          console.log('Profile created successfully')
        }

        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100))
        redirectUrl = `${origin}/onboarding?auth=new`
      } else if (profileData.onboarding_completed === true || profileData.nickname) {
        // Existing user with completed onboarding
        console.log('User has completed onboarding, redirecting to dashboard')
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100))
        redirectUrl = `${origin}/dashboard?auth=success`
      } else {
        // Existing user without completed onboarding
        console.log('User needs to complete onboarding')
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100))
        redirectUrl = `${origin}/onboarding?auth=returning`
      }
    } catch (profileErr) {
      console.error('Profile check error:', profileErr)
      // Default to onboarding on any error
      redirectUrl = `${origin}/onboarding`
    }

    console.log('Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)

  } catch (err) {
    console.error('Unexpected error in auth callback:', err)
    return NextResponse.redirect(`${origin}/?error=unexpected_error`)
  }
}
