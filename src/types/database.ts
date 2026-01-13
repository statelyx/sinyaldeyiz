export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          nickname: string
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
        Insert: {
          id: string
          email?: string | null
          nickname?: string
          age?: number | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          city?: string | null
          avatar_url?: string | null
          provider?: 'google' | 'email' | 'guest' | null
          is_guest?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          nickname?: string
          age?: number | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          city?: string | null
          avatar_url?: string | null
          provider?: 'google' | 'email' | 'guest' | null
          is_guest?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_catalog: {
        Row: {
          id: string
          marka: string
          model: string
          donanim: string
          motor: string
          yakit: 'Benzin' | 'Dizel' | 'Hibrit' | 'Elektrik' | 'LPG'
          vites: 'Düz' | 'Otomatik' | 'Yarı Otomatik' | 'CVT'
          fiyat: string
          websitesi: string | null
        }
        Insert: {
          id: string
          marka: string
          model: string
          donanim: string
          motor: string
          yakit: 'Benzin' | 'Dizel' | 'Hibrit' | 'Elektrik' | 'LPG'
          vites: 'Düz' | 'Otomatik' | 'Yarı Otomatik' | 'CVT'
          fiyat: string
          websitesi?: string | null
        }
        Update: {
          id?: string
          marka?: string
          model?: string
          donanim?: string
          motor?: string
          yakit?: 'Benzin' | 'Dizel' | 'Hibrit' | 'Elektrik' | 'LPG'
          vites?: 'Düz' | 'Otomatik' | 'Yarı Otomatik' | 'CVT'
          fiyat?: string
          websitesi?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          catalog_id: string | null
          year: number | null
          plate_number: string | null
          nickname: string | null
          is_primary: boolean
          photo_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          catalog_id?: string | null
          year?: number | null
          plate_number?: string | null
          nickname?: string | null
          is_primary?: boolean
          photo_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          catalog_id?: string | null
          year?: number | null
          plate_number?: string | null
          nickname?: string | null
          is_primary?: boolean
          photo_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      location_status: {
        Row: {
          user_id: string
          is_visible: boolean
          visibility_duration: 30 | 60 | 120 | null
          expires_at: string | null
          lat: number | null
          lon: number | null
          geohash: string | null
          accuracy_meters: number | null
          last_location_update: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          is_visible?: boolean
          visibility_duration?: 30 | 60 | 120 | null
          expires_at?: string | null
          lat?: number | null
          lon?: number | null
          geohash?: string | null
          accuracy_meters?: number | null
          last_location_update?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          is_visible?: boolean
          visibility_duration?: 30 | 60 | 120 | null
          expires_at?: string | null
          lat?: number | null
          lon?: number | null
          geohash?: string | null
          accuracy_meters?: number | null
          last_location_update?: string
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          category: 'general' | 'brand' | 'model' | 'location' | 'event'
          brand: string | null
          model: string | null
          city: string | null
          title: string
          content: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: 'general' | 'brand' | 'model' | 'location' | 'event'
          brand?: string | null
          model?: string | null
          city?: string | null
          title: string
          content?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: 'general' | 'brand' | 'model' | 'location' | 'event'
          brand?: string | null
          model?: string | null
          city?: string | null
          title?: string
          content?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          entry_id: string
          user_id: string
          value: -1 | 1
          created_at: string
        }
        Insert: {
          entry_id: string
          user_id: string
          value: -1 | 1
          created_at?: string
        }
        Update: {
          entry_id?: string
          user_id?: string
          value?: -1 | 1
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          target_type: 'topic' | 'entry' | 'user' | 'vehicle_photo'
          target_id: string
          reason: 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'other'
          description: string | null
          created_by: string
          created_at: string
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
        }
        Insert: {
          id?: string
          target_type: 'topic' | 'entry' | 'user' | 'vehicle_photo'
          target_id: string
          reason: 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'other'
          description?: string | null
          created_by: string
          created_at?: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
        }
        Update: {
          id?: string
          target_type?: 'topic' | 'entry' | 'user' | 'vehicle_photo'
          target_id?: string
          reason?: 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'other'
          description?: string | null
          created_by?: string
          created_at?: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
        }
      }
      hotspots: {
        Row: {
          id: string
          region_id: string
          region_name: string | null
          user_count: number
          started_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          region_id: string
          region_name?: string | null
          user_count?: number
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          region_id?: string
          region_name?: string | null
          user_count?: number
          started_at?: string
          updated_at?: string
        }
      }
      vehicle_brands: {
        Row: {
          id: number
          name: string
          type: 'car' | 'motorcycle'
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          type: 'car' | 'motorcycle'
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: 'car' | 'motorcycle'
          created_at?: string
        }
      }
      vehicle_models: {
        Row: {
          id: number
          brand_id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          brand_id: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          brand_id?: number
          name?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
