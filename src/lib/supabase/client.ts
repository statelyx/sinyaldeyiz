import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Set to false to use real Supabase, true for mock data
const MOCK_MODE = true

let client: SupabaseClient<Database> | null = null

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return client
}

export function createSupabase(): SupabaseClient<Database> {
  return getSupabaseBrowserClient()
}

// Mock data for development (used when MOCK_MODE = true)
export const MOCK_DATA = {
  isMockMode: MOCK_MODE,
  user: {
    id: 'mock-user-id-123',
    email: 'test@sinyaldeyiz.com',
  },
  profile: {
    id: 'mock-user-id-123',
    nickname: 'TestSürücü',
    age: 28,
    gender: 'male' as const,
    city: 'İstanbul',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  visibleUsers: [
    {
      user_id: 'user-1',
      lat: 41.0082,
      lon: 28.9784,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      profiles: { nickname: 'BMWci34' },
      vehicles: [{ is_primary: true, vehicle_catalog: { marka: 'BMW', model: '320i' } }]
    },
    {
      user_id: 'user-2',
      lat: 41.0122,
      lon: 28.9824,
      expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      profiles: { nickname: 'MercedesFan' },
      vehicles: [{ is_primary: true, vehicle_catalog: { marka: 'Mercedes', model: 'C200' } }]
    },
    {
      user_id: 'user-3',
      lat: 41.0052,
      lon: 28.9754,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      profiles: { nickname: 'AudiTR' },
      vehicles: [{ is_primary: true, vehicle_catalog: { marka: 'Audi', model: 'A4' } }]
    },
  ],
}
