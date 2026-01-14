import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Insert']

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()

    // Cookie-aware Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
    }

    if (data.user) {
      // Check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname, onboarding_completed')
        .eq('id', data.user.id)
        .single()

      // If no profile exists, create one
      if (profileError || !profile) {
        const provider = data.user.app_metadata?.provider || 'email'

        const newProfile = {
          id: data.user.id,
          email: data.user.email || null,
          provider: provider as 'google' | 'email' | 'guest',
          is_guest: false,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        await (supabase.from('profiles') as any).upsert(newProfile)

        // New user - go to onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Check onboarding status
      if ((profile as any)?.onboarding_completed || (profile as any)?.nickname) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  // Fallback - redirect to home
  return NextResponse.redirect(`${origin}/`)
}
