import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options)
                            })
                        } catch (error) {
                            // Handle error silently in middleware
                        }
                    },
                },
            }
        )

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth callback error:', error)
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

                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    email: data.user.email,
                    provider: provider,
                    is_guest: false,
                    onboarding_completed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as any)

                // New user - go to onboarding
                return NextResponse.redirect(`${origin}/onboarding`)
            }

            // Check onboarding status
            if (profile.onboarding_completed || profile.nickname) {
                return NextResponse.redirect(`${origin}/dashboard`)
            } else {
                return NextResponse.redirect(`${origin}/onboarding`)
            }
        }
    }

    // Fallback - redirect to home
    return NextResponse.redirect(`${origin}/`)
}
