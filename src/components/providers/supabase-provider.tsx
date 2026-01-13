'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createSupabase } from '@/lib/supabase/client'

// Extended Profile type with onboarding fields
interface Profile {
  id: string
  nickname: string | null
  email: string | null
  age: number | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  city: string | null
  avatar_url: string | null
  provider: 'google' | 'email' | 'guest' | null
  is_guest: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// Auth States
type AuthState = 'loading' | 'unauthenticated' | 'authenticated_not_onboarded' | 'authenticated_onboarded' | 'guest'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  authState: AuthState
  isOnboarded: boolean
  isGuest: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState<AuthState>('loading')

  // Compute derived state
  const isOnboarded = profile?.onboarding_completed ?? false
  const isGuest = profile?.is_guest ?? false

  // Fetch profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const supabase = createSupabase()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error:', error.message)
        // Profile might not exist yet for new users
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [])

  // Create initial profile for new users
  const createInitialProfile = useCallback(async (user: User): Promise<Profile | null> => {
    try {
      const supabase = createSupabase()
      const provider = user.app_metadata?.provider || 'email'

      const newProfile = {
        id: user.id,
        email: user.email || null,
        nickname: null,
        provider: provider as 'google' | 'email' | 'guest',
        is_guest: false,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await (supabase
        .from('profiles') as any)
        .upsert(newProfile)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }, [])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      updateAuthState(user, profileData)
    }
  }, [user, fetchProfile])

  // Update auth state based on user and profile
  const updateAuthState = (user: User | null, profile: Profile | null) => {
    if (!user) {
      setAuthState('unauthenticated')
    } else if (profile?.is_guest) {
      setAuthState('guest')
    } else if (profile?.onboarding_completed) {
      setAuthState('authenticated_onboarded')
    } else {
      setAuthState('authenticated_not_onboarded')
    }
  }

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = createSupabase()

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          setAuthState('unauthenticated')
          return
        }

        if (session?.user) {
          setUser(session.user)
          setSession(session)

          // Fetch or create profile
          let profileData = await fetchProfile(session.user.id)

          if (!profileData) {
            // Create initial profile for new users
            profileData = await createInitialProfile(session.user)
          }

          setProfile(profileData)
          updateAuthState(session.user, profileData)
        } else {
          setAuthState('unauthenticated')
        }

        setLoading(false)

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event)

            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user)
              setSession(session)

              let profileData = await fetchProfile(session.user.id)

              if (!profileData) {
                profileData = await createInitialProfile(session.user)
              }

              setProfile(profileData)
              updateAuthState(session.user, profileData)
            } else if (event === 'SIGNED_OUT') {
              setUser(null)
              setSession(null)
              setProfile(null)
              setAuthState('unauthenticated')
            } else if (event === 'TOKEN_REFRESHED' && session) {
              setSession(session)
            }
          }
        )

        return () => subscription.unsubscribe()
      } catch (err) {
        console.error('Auth initialization failed:', err)
        setLoading(false)
        setAuthState('unauthenticated')
      }
    }

    initAuth()
  }, [fetchProfile, createInitialProfile])

  // Sign out
  const signOut = async () => {
    try {
      const supabase = createSupabase()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setUser(null)
    setSession(null)
    setProfile(null)
    setAuthState('unauthenticated')
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user' }

    try {
      const supabase = createSupabase()
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (!error) {
        await refreshProfile()
      }

      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        authState,
        isOnboarded,
        isGuest,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
